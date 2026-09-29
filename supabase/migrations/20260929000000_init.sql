-- Prime: catalogue, orders and admin profiles.
--
-- All money is integer cents in EUR, including 19% German VAT.
-- The storefront reads the catalogue with the anon key; everything
-- order-related is reachable only with the service role.

-- Enums -----------------------------------------------------------------

create type public.order_status as enum (
  'awaiting_payment',
  'processing',
  'shipped',
  'completed',
  'cancelled'
);

create type public.payment_method as enum ('bank_transfer', 'cod', 'crypto');

-- Matches the keys under Products.badge in messages/*.json.
create type public.product_badge as enum ('new', 'lowStock');

create type public.user_role as enum ('customer', 'admin');

-- Shared updated_at trigger ---------------------------------------------

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Catalogue -------------------------------------------------------------

create table public.products (
  id         uuid primary key default gen_random_uuid(),
  slug       text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name       text not null,
  -- Form and purity, e.g. 'Lyophilized · ≥99%'. The amount lives on the variant.
  spec       text not null,
  badge      public.product_badge,
  -- Null falls back to the default product image.
  image_url  text,
  is_active  boolean not null default true,
  sort       integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.product_variants (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products (id) on delete cascade,
  sku         text not null unique,
  -- Language-neutral amount, e.g. '5 mg'.
  label       text not null,
  price_cents integer not null check (price_cents > 0),
  stock       integer not null default 0 check (stock >= 0),
  is_active   boolean not null default true,
  sort        integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (product_id, label)
);

create index product_variants_product_id_idx
  on public.product_variants (product_id);

-- Orders ----------------------------------------------------------------

create table public.orders (
  id              uuid primary key default gen_random_uuid(),
  -- Customer-facing reference is PRIME-{number}.
  number          bigint generated always as identity (start with 10001) unique,
  email           text not null,
  locale          text not null check (locale in ('de', 'en')),
  status          public.order_status not null default 'awaiting_payment',
  payment_method  public.payment_method not null default 'bank_transfer',
  subtotal_cents  integer not null check (subtotal_cents >= 0),
  shipping_cents  integer not null check (shipping_cents >= 0),
  total_cents     integer not null check (total_cents = subtotal_cents + shipping_cents),
  -- VAT contained in total_cents (prices are gross).
  vat_cents       integer not null check (vat_cents >= 0),
  -- { name, street, zip, city, country, phone? }
  billing         jsonb not null,
  shipping        jsonb not null,
  tracking_number text,
  paid_at         timestamptz,
  shipped_at      timestamptz,
  cancelled_at    timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Admin list filters by status, newest first; the unpaid-order cron scans
-- awaiting_payment by age.
create index orders_status_created_at_idx
  on public.orders (status, created_at desc);
create index orders_email_idx on public.orders (lower(email));

-- Snapshot of what was bought, so later catalogue edits never change an order.
create table public.order_items (
  id               uuid primary key default gen_random_uuid(),
  order_id         uuid not null references public.orders (id) on delete cascade,
  variant_id       uuid references public.product_variants (id) on delete set null,
  product_name     text not null,
  variant_label    text not null,
  sku              text not null,
  unit_price_cents integer not null check (unit_price_cents >= 0),
  qty              integer not null check (qty > 0),
  line_total_cents integer not null check (line_total_cents = unit_price_cents * qty)
);

create index order_items_order_id_idx on public.order_items (order_id);
create index order_items_variant_id_idx on public.order_items (variant_id);

create table public.order_events (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid not null references public.orders (id) on delete cascade,
  -- Null for the event that creates the order.
  from_status public.order_status,
  to_status   public.order_status not null,
  -- 'customer', 'system' or 'admin:<user id>'.
  actor       text not null,
  note        text,
  created_at  timestamptz not null default now()
);

create index order_events_order_id_created_at_idx
  on public.order_events (order_id, created_at);

-- Profiles --------------------------------------------------------------

-- Admins are promoted by hand (SQL editor); there is no public signup.
create table public.profiles (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  role       public.user_role not null default 'customer',
  created_at timestamptz not null default now()
);

-- Triggers --------------------------------------------------------------

create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

create trigger product_variants_set_updated_at
  before update on public.product_variants
  for each row execute function public.set_updated_at();

create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

-- Grants ----------------------------------------------------------------

-- Least privilege for the API roles; RLS below narrows reads further.
revoke all on all tables in schema public from anon, authenticated;

grant select on public.products, public.product_variants to anon, authenticated;
grant select on public.profiles to authenticated;

grant all on all tables in schema public to service_role;
grant usage, select on all sequences in schema public to service_role;

-- Row level security ----------------------------------------------------

alter table public.products         enable row level security;
alter table public.product_variants enable row level security;
alter table public.orders           enable row level security;
alter table public.order_items      enable row level security;
alter table public.order_events     enable row level security;
alter table public.profiles         enable row level security;

create policy "Active products are public"
  on public.products for select
  to anon, authenticated
  using (is_active);

create policy "Active variants of active products are public"
  on public.product_variants for select
  to anon, authenticated
  using (
    is_active
    and exists (
      select 1 from public.products p
      where p.id = product_id and p.is_active
    )
  );

-- Lets the admin check read the signed-in user's own role. No writes.
create policy "Users read their own profile"
  on public.profiles for select
  to authenticated
  using (user_id = (select auth.uid()));

-- orders, order_items and order_events have RLS enabled and no policies:
-- only the service role (which bypasses RLS) can read or write them.
