-- ============================================================
-- Migration: AMARE Store — Products Table & Storage Bucket
-- ============================================================
-- Run this in the Supabase SQL editor.
-- Idempotent: safe to run more than once.
--
-- Creates:
--   1. products table with full product catalog schema
--   2. Row Level Security policies for anonymous + admin access
--   3. Performance indexes
--   4. Storage bucket for product + gallery images
--   5. Storage policies for public read + admin write
-- ============================================================

-- ============================================================
-- SECTION 1 — PRODUCTS TABLE
-- ============================================================

-- 1.1 — Create the products table
create table if not exists public.products (
  id                uuid         primary key default gen_random_uuid(),
  created_at        timestamptz  not null default now(),
  updated_at        timestamptz  not null default now(),

  -- Core product data
  name              text         not null,
  slug              text         not null unique,
  short_description text,
  description       text,

  -- Classification
  category          text         not null default 'devices',
  brand             text,
  condition         text         default 'new',
  sku               text,

  -- Pricing & inventory
  price             numeric(10,2) not null default 0,
  stock             integer       not null default 0,

  -- Media
  image_url         text,
  gallery           jsonb         default '[]'::jsonb,

  -- Visibility & ordering
  featured          boolean       not null default false,
  status            text          not null default 'draft',
  sort_order        integer       not null default 0,

  -- Audit
  created_by        uuid,
  updated_by        uuid
);

-- 1.2 — Add comment on the table & columns for Supabase auto-docs
comment on table  public.products is 'AMARE Store product catalog — used by the storefront and admin dashboard.';
comment on column public.products.id                is 'Primary key — auto-generated UUID.';
comment on column public.products.created_at        is 'Timestamp of creation (auto).';
comment on column public.products.updated_at        is 'Timestamp of last update (auto via trigger).';
comment on column public.products.name              is 'Display name of the product (Arabic).';
comment on column public.products.slug              is 'URL-friendly identifier, unique across all products.';
comment on column public.products.short_description is 'Short summary shown on product cards.';
comment on column public.products.description       is 'Full product description shown on the detail page.';
comment on column public.products.category          is 'Product category — e.g. devices, clothing, uniforms, accessories, backpacks, camping, books, gifts.';
comment on column public.products.brand             is 'Manufacturer or supplier name (optional).';
comment on column public.products.condition         is 'Condition — new, used, refurbished. Default: new.';
comment on column public.products.sku               is 'Stock Keeping Unit — unique internal code.';
comment on column public.products.price             is 'Selling price in Moroccan Dirhams (MAD).';
comment on column public.products.stock             is 'Current quantity in inventory. 0 = out of stock.';
comment on column public.products.image_url         is 'Public URL of the primary product image in Supabase Storage.';
comment on column public.products.gallery           is 'JSON array of public URLs for additional product images.';
comment on column public.products.featured          is 'Whether the product appears in the featured section on the homepage.';
comment on column public.products.status            is 'Publishing status — draft, published, archived, hidden.';
comment on column public.products.sort_order        is 'Display order — lower numbers appear first.';
comment on column public.products.created_by        is 'UUID of the admin user who created this product.';
comment on column public.products.updated_by        is 'UUID of the admin user who last updated this product.';

-- ============================================================
-- SECTION 2 — AUTO-UPDATED TIMESTAMP TRIGGER
-- ============================================================

-- 2.1 — Create the trigger function (shared across tables)
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

-- 2.2 — Attach the trigger to the products table
drop trigger if exists trg_products_updated_at on public.products;
create trigger trg_products_updated_at
  before update on public.products
  for each row execute function public.handle_updated_at();

-- ============================================================
-- SECTION 3 — INDEXES FOR PERFORMANCE
-- ============================================================

-- 3.1 — Category + status: most common filter combination
create index if not exists idx_products_category_status
  on public.products (category, status);

-- 3.2 — Slug: unique lookup from URL
-- (already covered by the UNIQUE constraint, but explicit index ensures range scans)
create index if not exists idx_products_slug
  on public.products (slug);

-- 3.3 — Featured products: homepage carousel / featured section
create index if not exists idx_products_featured
  on public.products (featured, status)
  where featured = true;

-- 3.4 — Sort order: ensures ORDER BY sort_order uses an index
create index if not exists idx_products_sort_order
  on public.products (sort_order, created_at desc);

-- 3.5 — Full-text search support (Arabic-friendly)
-- Requires the pg_trgm extension for trigram-based fuzzy matching.
create extension if not exists pg_trgm with schema extensions;

create index if not exists idx_products_name_trgm
  on public.products using gin (name gin_trgm_ops);

-- ============================================================
-- SECTION 4 — ROW LEVEL SECURITY (RLS)
-- ============================================================

-- 4.1 — Enable RLS on the products table
alter table public.products enable row level security;

-- 4.2 — Drop existing policies (idempotent)
drop policy if exists "Anon can read published products" on public.products;
drop policy if exists "Admin full access to products"  on public.products;

-- 4.3 — Anonymous visitors: read only active (published) products
create policy "Anon can read published products"
  on public.products
  for select
  to anon
  using (status = 'published');

-- 4.4 — Authenticated admins: full CRUD
--       The check uses a helper function to avoid hardcoding role checks in every policy.
--       Admins are users whose profile.role is 'admin' or 'super_admin'.
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role in ('admin', 'super_admin')
  );
end;
$$ language plpgsql security definer stable;

-- 4.5 — Admin: full SELECT (including draft / archived / hidden)
create policy "Admin full access to products"
  on public.products
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ============================================================
-- SECTION 5 — STORAGE BUCKET
-- ============================================================

-- 5.1 — Insert the bucket into storage.buckets (if it doesn't exist)
--       Supabase storage buckets live in the `storage` schema.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'store-products',
  'store-products',
  true,                          -- public = true → files are publicly accessible
  10485760,                      -- 10 MB max file size (in bytes)
  '{image/jpeg,image/jpg,image/png,image/webp}'::text[]
)
on conflict (id) do update
  set public               = true,
      file_size_limit      = 10485760,
      allowed_mime_types   = '{image/jpeg,image/jpg,image/png,image/webp}'::text[];

-- ============================================================
-- SECTION 6 — STORAGE POLICIES
-- ============================================================

-- 6.1 — Public read: anyone can view product images
drop policy if exists "Public read store products" on storage.objects;
create policy "Public read store products"
  on storage.objects
  for select
  to anon
  using (bucket_id = 'store-products');

-- 6.2 — Admin upload (INSERT)
drop policy if exists "Admin upload store products" on storage.objects;
create policy "Admin upload store products"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'store-products'
    and public.is_admin()
  );

-- 6.3 — Admin update (UPDATE — rename, replace)
drop policy if exists "Admin update store products" on storage.objects;
create policy "Admin update store products"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'store-products'
    and public.is_admin()
  )
  with check (
    bucket_id = 'store-products'
    and public.is_admin()
  );

-- 6.4 — Admin delete (DELETE)
drop policy if exists "Admin delete store products" on storage.objects;
create policy "Admin delete store products"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'store-products'
    and public.is_admin()
  );

-- ============================================================
-- SECTION 7 — SEED DATA (optional — populate with placeholders)
-- ============================================================
-- Uncomment this block to insert initial demo products.
-- These match the display cards already in the storefront HTML.

/*
insert into public.products (name, slug, short_description, description, category, price, stock, sku, featured, status, sort_order)
values
  ('بذلة ميدانية رسمية',   'field-uniform',   'بذلة استكشاف عالية الجودة بشعار الجمعية، مقاومة للتمزق ومناسبة للعمل الميداني.', 'بذلة استكشاف عالية الجودة بشعار الجمعية، مقاومة للتمزق ومناسبة للعمل الميداني في جميع الظروف. مصنوعة من قماش قطني-بوليستر متين.', 'uniforms',    450,    20, 'AMR-UNI-001', true,  'published', 1),
  ('قميص الجمعية الرسمي',  'official-shirt',  'قميص بولو مطرز بشعار AMARE، قطن 100%، متوفر بمقاسات متعددة.',                  'قميص بولو مطرز بشعار AMARE، قطن 100% عالي الجودة، متوفر بمقاسات متعددة وألوان تناسب الميدان والمكتب.',                     'clothing',    180,    40, 'AMR-CLT-001', true,  'published', 2),
  ('جهاز كشف المعادن',     'metal-detector',   'جهاز كشف معادن احترافي بعمق يصل إلى 2 متر، مزود بشاشة رقمية.',                 'جهاز كشف معادن احترافي بعمق يصل إلى 2 متر، مزود بشاشة رقمية ومقاوم للماء والغبار.',                                           'devices',     3200,   5,  'AMR-DEV-001', true,  'published', 3),
  ('حقيبة استكشاف احترافية', 'explorer-backpack', 'حقيبة ظهر بسعة 45 لتر، مقاومة للماء، بجيب مخصص للأجهزة.',                  'حقيبة ظهر بسعة 45 لتر، مقاومة للماء، بجيب مخصص للأجهزة وحزام خصر مبطن لمزيد من الراحة.',                                       'backpacks',   390,    15, 'AMR-BPK-001', false, 'published', 4),
  ('دليل المستكشف الميداني', 'field-guide',      'كتاب شامل يغطي تقنيات البحث والاستكشاف، قراءة الخرائط، وقوانين التراث.',      'كتاب شامل يغطي تقنيات البحث والاستكشاف، قراءة الخرائط، استخدام الأجهزة، وقوانين التراث الوطني. المرجع الأساسي لكل مستكشف مغربي.', 'books',       120,    30, 'AMR-BOK-001', false, 'published', 5),
  ('مصباح أمامي قوي',      'headlamp',          'مصباح LED قابل للشحن بسطوع 1000 لومن، مقاوم للماء IPX6.',                    'مصباح LED قابل للشحن بسطوع 1000 لومن، مقاوم للماء IPX6، مزود بحزام رأس مريح وقابل للتعديل.',                                     'camping',     250,    0,  'AMR-CMP-001', false, 'draft',     6);
*/

-- ============================================================
-- MIGRATION COMPLETE
-- ============================================================
-- After running this migration in the Supabase SQL editor:
--
--   ✅ products table is created with all required columns
--   ✅ updated_at auto-updates on every row change
--   ✅ Performance indexes are in place
--   ✅ RLS is enabled — anon can only read published products
--   ✅ Admins (admin / super_admin) have full CRUD
--   ✅ store-products bucket exists (public, 10 MB, images only)
--   ✅ Anonymous users can view product images
--   ✅ Admins can upload, rename, replace, and delete images
--
-- The storefront HTML pages will use the `supabase-js` client
-- to query public.products where status = 'published'.
-- The admin dashboard (future) will use the authenticated client
-- for full CRUD operations.
-- ============================================================
