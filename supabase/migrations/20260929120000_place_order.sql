-- Places an order in one transaction: re-reads prices and stock, rejects
-- anything unavailable, writes the order with an item snapshot, takes the
-- stock and logs the first event.
--
-- Errors carry a stable message the app maps to a customer-facing reason:
--   UNAVAILABLE   (detail: variant ids) variant or product gone or inactive
--   OUT_OF_STOCK  (detail: variant ids) not enough stock
--   PRICE_CHANGED (detail: current total) total differs from what the
--                 customer confirmed
--   INVALID_ITEMS                       empty, duplicate or bad quantities
--
-- Shipping rules are passed in by the app (lib/shipping.ts) so the numbers
-- live in one place.

create function public.place_order(
  p_email                        text,
  p_locale                       text,
  p_payment_method               public.payment_method,
  p_billing                      jsonb,
  p_shipping                     jsonb,
  -- [{ "variant_id": uuid, "qty": int }]
  p_items                        jsonb,
  p_expected_total_cents         integer,
  p_shipping_flat_cents          integer,
  p_free_shipping_threshold_cents integer
)
returns table (order_id uuid, order_number bigint)
language plpgsql
set search_path = ''
as $$
declare
  v_requested   int;
  v_distinct    int;
  v_missing     uuid[];
  v_short       uuid[];
  v_subtotal    int;
  v_shipping    int;
  v_total       int;
  v_order_id    uuid;
  v_number      bigint;
begin
  create temp table _cart (variant_id uuid primary key, qty int not null)
    on commit drop;

  select count(*), count(distinct (item ->> 'variant_id'))
    into v_requested, v_distinct
    from jsonb_array_elements(p_items) as item;

  if v_requested = 0 or v_requested <> v_distinct then
    raise exception 'INVALID_ITEMS';
  end if;

  insert into _cart (variant_id, qty)
  select (item ->> 'variant_id')::uuid, (item ->> 'qty')::int
    from jsonb_array_elements(p_items) as item;

  -- 10 = MAX_QUANTITY in lib/cart-limits.ts.
  if exists (select 1 from _cart where qty < 1 or qty > 10) then
    raise exception 'INVALID_ITEMS';
  end if;

  -- Lock the variant rows (in a fixed order, so concurrent checkouts cannot
  -- deadlock) until the transaction ends.
  perform 1
    from public.product_variants v
    join _cart c on c.variant_id = v.id
   order by v.id
     for update of v;

  select array_agg(c.variant_id)
    into v_missing
    from _cart c
    left join public.product_variants v on v.id = c.variant_id
    left join public.products p on p.id = v.product_id
   where v.id is null or not v.is_active or not p.is_active;

  if v_missing is not null then
    raise exception 'UNAVAILABLE' using detail = array_to_string(v_missing, ',');
  end if;

  select array_agg(c.variant_id)
    into v_short
    from _cart c
    join public.product_variants v on v.id = c.variant_id
   where v.stock < c.qty;

  if v_short is not null then
    raise exception 'OUT_OF_STOCK' using detail = array_to_string(v_short, ',');
  end if;

  select sum(v.price_cents * c.qty)::int
    into v_subtotal
    from _cart c
    join public.product_variants v on v.id = c.variant_id;

  v_shipping := case
    when v_subtotal >= p_free_shipping_threshold_cents then 0
    else p_shipping_flat_cents
  end;
  v_total := v_subtotal + v_shipping;

  if v_total <> p_expected_total_cents then
    raise exception 'PRICE_CHANGED' using detail = v_total::text;
  end if;

  insert into public.orders (
    email, locale, status, payment_method,
    subtotal_cents, shipping_cents, total_cents, vat_cents,
    billing, shipping
  ) values (
    lower(trim(p_email)), p_locale, 'awaiting_payment', p_payment_method,
    v_subtotal, v_shipping, v_total,
    -- VAT contained in the gross total (19%).
    round(v_total * 19.0 / 119.0)::int,
    p_billing, p_shipping
  )
  returning id, number into v_order_id, v_number;

  insert into public.order_items (
    order_id, variant_id, product_name, variant_label, sku,
    unit_price_cents, qty, line_total_cents
  )
  select v_order_id, v.id, p.name, v.label, v.sku,
         v.price_cents, c.qty, v.price_cents * c.qty
    from _cart c
    join public.product_variants v on v.id = c.variant_id
    join public.products p on p.id = v.product_id
   order by p.sort, v.sort;

  update public.product_variants v
     set stock = v.stock - c.qty
    from _cart c
   where v.id = c.variant_id;

  insert into public.order_events (order_id, from_status, to_status, actor)
  values (v_order_id, null, 'awaiting_payment', 'customer');

  return query select v_order_id, v_number;
end;
$$;

-- Only the server (service role) may place orders.
revoke execute on function public.place_order from public, anon, authenticated;
grant execute on function public.place_order to service_role;
