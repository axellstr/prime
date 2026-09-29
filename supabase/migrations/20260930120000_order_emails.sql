-- One row per customer email attempt, shown on the admin order page.
-- A failed send never undoes the order change that triggered it; the admin
-- can resend from the order page.

create type public.order_email_kind as enum
  ('received', 'paid', 'shipped', 'cancelled');

create table public.order_emails (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid not null references public.orders (id) on delete cascade,
  kind        public.order_email_kind not null,
  recipient   text not null,
  sent        boolean not null,
  -- Resend's message id when sent, the error message when not.
  provider_id text,
  error       text,
  created_at  timestamptz not null default now()
);

create index order_emails_order_id_created_at_idx
  on public.order_emails (order_id, created_at);

-- Service role only, like the other order tables.
revoke all on public.order_emails from anon, authenticated;
grant all on public.order_emails to service_role;
alter table public.order_emails enable row level security;
