-- Moves an order to a new status in one transaction: checks the move is
-- allowed, stamps the matching timestamp, restocks on cancel and logs the
-- event. Used by the admin panel (actor 'admin:<user id>') and the
-- unpaid-order job (actor 'system').
--
-- Allowed moves:
--   awaiting_payment → processing | cancelled
--   processing       → shipped (tracking number required) | cancelled
--   shipped          → completed
--
-- Errors carry a stable message the app maps to a reason:
--   NOT_FOUND
--   INVALID_TRANSITION (detail: current status) also when someone else
--                      changed the order first
--   TRACKING_REQUIRED

create function public.transition_order(
  p_order_id        uuid,
  p_to_status       public.order_status,
  p_actor           text,
  p_note            text default null,
  p_tracking_number text default null
)
returns public.order_status
language plpgsql
set search_path = ''
as $$
declare
  v_from     public.order_status;
  v_tracking text := nullif(trim(p_tracking_number), '');
begin
  select status into v_from
    from public.orders
   where id = p_order_id
     for update;

  if not found then
    raise exception 'NOT_FOUND';
  end if;

  if not (
       (v_from = 'awaiting_payment' and p_to_status in ('processing', 'cancelled'))
    or (v_from = 'processing'       and p_to_status in ('shipped', 'cancelled'))
    or (v_from = 'shipped'          and p_to_status = 'completed')
  ) then
    raise exception 'INVALID_TRANSITION' using detail = v_from::text;
  end if;

  if p_to_status = 'shipped' and v_tracking is null then
    raise exception 'TRACKING_REQUIRED';
  end if;

  update public.orders
     set status          = p_to_status,
         paid_at         = case when p_to_status = 'processing' then now() else paid_at end,
         shipped_at      = case when p_to_status = 'shipped' then now() else shipped_at end,
         cancelled_at    = case when p_to_status = 'cancelled' then now() else cancelled_at end,
         tracking_number = case when p_to_status = 'shipped' then v_tracking else tracking_number end
   where id = p_order_id;

  -- Cancelled before shipping, so the goods are still here.
  if p_to_status = 'cancelled' then
    update public.product_variants v
       set stock = v.stock + i.qty
      from (
        select variant_id, sum(qty)::int as qty
          from public.order_items
         where order_id = p_order_id and variant_id is not null
         group by variant_id
      ) i
     where v.id = i.variant_id;
  end if;

  insert into public.order_events (order_id, from_status, to_status, actor, note)
  values (p_order_id, v_from, p_to_status, p_actor, nullif(trim(p_note), ''));

  return p_to_status;
end;
$$;

revoke execute on function public.transition_order from public, anon, authenticated;
grant execute on function public.transition_order to service_role;
