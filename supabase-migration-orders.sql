-- ============================================================
-- Migration: AMARE Store — Orders & Order Items Tables
-- ============================================================
-- Run this in the Supabase SQL editor.
-- Idempotent: safe to run more than once.
--
-- Creates:
--   1. orders table — customer orders with payment info
--   2. order_items table — line items per order
--   3. Auto-incrementing order number function
--   4. RLS policies for public insert + admin access
--   5. Performance indexes
-- ============================================================

-- ============================================================
-- SECTION 1 — ORDERS TABLE
-- ============================================================

create table if not exists public.orders (
  id                uuid         primary key default gen_random_uuid(),
  order_number      text         not null unique,
  created_at        timestamptz  not null default now(),
  updated_at        timestamptz  not null default now(),

  -- Customer information
  customer_name     text         not null,
  customer_phone    text         not null,
  customer_email    text,
  customer_city     text         not null,
  customer_address  text         not null,
  order_notes       text,

  -- Payment
  payment_method    text         not null default 'cod',
  payment_proof_url text,

  -- Financials
  subtotal          numeric(10,2) not null default 0,
  shipping          numeric(10,2) not null default 0,
  discount          numeric(10,2) not null default 0,
  grand_total       numeric(10,2) not null default 0,

  -- Status
  status            text          not null default 'pending'
);

-- Comments
comment on table  public.orders is 'Customer orders placed through the AMARE Store checkout.';
comment on column public.orders.id                is 'Primary key — auto-generated UUID.';
comment on column public.orders.order_number      is 'Human-readable order reference — auto-generated (AMR-YYYY-NNNN).';
comment on column public.orders.customer_name     is 'Full name of the customer.';
comment on column public.orders.customer_phone    is 'Customer phone number (required).';
comment on column public.orders.customer_email    is 'Customer email address (optional).';
comment on column public.orders.customer_city     is 'Delivery city.';
comment on column public.orders.customer_address  is 'Full delivery address.';
comment on column public.orders.order_notes       is 'Optional notes from the customer.';
comment on column public.orders.payment_method    is 'Payment method — cod (cash on delivery) or bank_transfer.';
comment on column public.orders.payment_proof_url is 'URL of the bank transfer receipt (only for bank_transfer).';
comment on column public.orders.subtotal          is 'Sum of all order item subtotals.';
comment on column public.orders.shipping          is 'Shipping cost.';
comment on column public.orders.discount          is 'Discount applied to the order.';
comment on column public.orders.grand_total       is 'Final amount (subtotal + shipping - discount).';
comment on column public.orders.status            is 'Order status — pending, confirmed, processing, shipped, delivered, cancelled.';

-- ============================================================
-- SECTION 2 — ORDER ITEMS TABLE
-- ============================================================

create table if not exists public.order_items (
  id            uuid         primary key default gen_random_uuid(),
  order_id      uuid         not null references public.orders(id) on delete cascade,
  product_id    uuid         references public.products(id) on delete set null,
  product_name  text         not null,
  product_price numeric(10,2) not null,
  quantity      integer      not null default 1,
  subtotal      numeric(10,2) not null,
  created_at    timestamptz  not null default now()
);

-- Comments
comment on table  public.order_items is 'Line items belonging to an order.';
comment on column public.order_items.id            is 'Primary key — auto-generated UUID.';
comment on column public.order_items.order_id      is 'Foreign key to orders.id — deleted when the order is deleted.';
comment on column public.order_items.product_id    is 'Foreign key to products.id — set to null if the product is deleted.';
comment on column public.order_items.product_name  is 'Snapshot of the product name at purchase time.';
comment on column public.order_items.product_price is 'Snapshot of the unit price at purchase time.';
comment on column public.order_items.quantity      is 'Quantity ordered.';
comment on column public.order_items.subtotal      is 'product_price × quantity.';

-- ============================================================
-- SECTION 3 — ORDER NUMBER GENERATOR
-- ============================================================

-- Generates sequential order numbers in the format AMR-YYYY-NNNN
-- Example: AMR-2026-0001, AMR-2026-0002, ...

create or replace function public.generate_order_number()
returns text as $$
declare
  current_year text := to_char(now(), 'YYYY');
  seq_number   integer;
begin
  select coalesce(
    max(nullif(regexp_replace(order_number, '^AMR-\d{4}-', ''), '')::integer),
    0
  ) + 1
  into seq_number
  from public.orders
  where order_number like 'AMR-' || current_year || '-%';

  return 'AMR-' || current_year || '-' || lpad(seq_number::text, 4, '0');
end;
$$ language plpgsql security definer;

-- ============================================================
-- SECTION 4 — AUTO-UPDATED TIMESTAMP
-- ============================================================

drop trigger if exists trg_orders_updated_at on public.orders;
create trigger trg_orders_updated_at
  before update on public.orders
  for each row execute function public.handle_updated_at();

-- ============================================================
-- SECTION 5 — INDEXES
-- ============================================================

create index if not exists idx_orders_status on public.orders (status);
create index if not exists idx_orders_created_at on public.orders (created_at desc);
create index if not exists idx_orders_order_number on public.orders (order_number);
create index if not exists idx_order_items_order_id on public.order_items (order_id);
create index if not exists idx_order_items_product_id on public.order_items (product_id);

-- ============================================================
-- SECTION 6 — ROW LEVEL SECURITY
-- ============================================================

alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- DROP existing policies (idempotent)
drop policy if exists "Anon can insert orders" on public.orders;
drop policy if exists "Anon can insert order items" on public.order_items;
drop policy if exists "Admin full access to orders" on public.orders;
drop policy if exists "Admin full access to order items" on public.order_items;

-- Anonymous visitors: can create orders (checkout)
create policy "Anon can insert orders"
  on public.orders
  for insert
  to anon
  with check (true);

-- Anonymous visitors: can create order items (checkout)
create policy "Anon can insert order items"
  on public.order_items
  for insert
  to anon
  with check (true);

-- Authenticated admins: full CRUD on orders
create policy "Admin full access to orders"
  on public.orders
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Authenticated admins: full CRUD on order items
create policy "Admin full access to order items"
  on public.order_items
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ============================================================
-- SECTION 7 — STORAGE: BANK TRANSFER RECEIPTS
-- ============================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'order-receipts',
  'order-receipts',
  false,
  10485760,
  '{image/jpeg,image/jpg,image/png,image/webp,application/pdf}'::text[]
)
on conflict (id) do update
  set public               = false,
      file_size_limit      = 10485760,
      allowed_mime_types   = '{image/jpeg,image/jpg,image/png,image/webp,application/pdf}'::text[];

-- Storage policies
drop policy if exists "Anon upload receipts" on storage.objects;
create policy "Anon upload receipts"
  on storage.objects
  for insert
  to anon
  with check (bucket_id = 'order-receipts');

drop policy if exists "Admin read receipts" on storage.objects;
create policy "Admin read receipts"
  on storage.objects
  for select
  to authenticated
  using (bucket_id = 'order-receipts' and public.is_admin());

-- ============================================================
-- MIGRATION COMPLETE
-- ============================================================
