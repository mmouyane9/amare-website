-- ============================================================================
-- Amare CMS — Production Supabase Migration
-- Paste entire script into Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- EXTENSIONS
-- ============================================================================
create extension if not exists "uuid-ossp";

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Automatic updated_at timestamp
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Automatic slug generation (Arabic + English safe)
create or replace function generate_slug(title text)
returns text as $$
begin
  return lower(regexp_replace(
    regexp_replace(title, '[^\w\s\-]', '', 'g'),
    '\s+', '-', 'g'
  ));
end;
$$ language plpgsql immutable;

-- Automatic sort_order for page_sections
create or replace function set_section_sort_order()
returns trigger as $$
declare
  max_order int;
begin
  select coalesce(max(sort_order), 0) + 1
  into max_order
  from page_sections
  where page_id = new.page_id;

  if new.sort_order is null or new.sort_order = 0 then
    new.sort_order := max_order;
  end if;
  return new;
end;
$$ language plpgsql;

-- ============================================================================
-- 1. PAGES
-- ============================================================================
create table if not exists pages (
  id             uuid primary key default uuid_generate_v4(),
  title          text not null,
  slug           text not null unique,
  template       text not null default 'default',
  status         text not null default 'draft'
                   check (status in ('draft', 'published', 'archived')),
  seo_title      text,
  seo_description text,
  seo_keywords   text,
  og_image       text,
  sort_order     int not null default 0,
  is_homepage    boolean not null default false,
  created_by     uuid references auth.users(id) on delete set null,
  updated_by     uuid references auth.users(id) on delete set null,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- Indexes
create index if not exists idx_pages_slug       on pages (slug);
create index if not exists idx_pages_status     on pages (status);
create index if not exists idx_pages_sort_order on pages (sort_order);
create index if not exists idx_pages_homepage   on pages (is_homepage) where is_homepage = true;
create index if not exists idx_pages_created_at on pages (created_at desc);

-- Trigger
create trigger trg_pages_updated_at
  before update on pages
  for each row execute function set_updated_at();

-- ============================================================================
-- 2. PAGE SECTIONS
-- ============================================================================
create table if not exists page_sections (
  id            uuid primary key default uuid_generate_v4(),
  page_id       uuid not null references pages(id) on delete cascade,
  section_type  text not null,
  section_key   text,
  title         text,
  description   text,
  content       jsonb not null default '{}'::jsonb,
  settings      jsonb not null default '{}'::jsonb,
  styles        jsonb not null default '{}'::jsonb,
  visible       boolean not null default true,
  sort_order    int not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Indexes
create index if not exists idx_sections_page_id      on page_sections (page_id);
create index if not exists idx_sections_type         on page_sections (section_type);
create index if not exists idx_sections_sort_order   on page_sections (page_id, sort_order);
create index if not exists idx_sections_visible      on page_sections (page_id, visible) where visible = true;
create index if not exists idx_sections_content_gin  on page_sections using gin (content jsonb_path_ops);
create index if not exists idx_sections_settings_gin on page_sections using gin (settings jsonb_path_ops);
create index if not exists idx_sections_created_at   on page_sections (created_at desc);

-- Triggers
create trigger trg_sections_updated_at
  before update on page_sections
  for each row execute function set_updated_at();

create trigger trg_sections_sort_order
  before insert on page_sections
  for each row execute function set_section_sort_order();

-- ============================================================================
-- 3. MEDIA LIBRARY
-- ============================================================================
create table if not exists media_library (
  id            uuid primary key default uuid_generate_v4(),
  filename      text not null,
  original_name text not null,
  bucket        text not null,
  path          text not null,
  mime_type     text,
  size          bigint,
  width         int,
  height        int,
  alt_text      text,
  uploaded_by   uuid references auth.users(id) on delete set null,
  created_at    timestamptz not null default now()
);

-- Indexes
create index if not exists idx_media_bucket     on media_library (bucket);
create index if not exists idx_media_mime_type  on media_library (mime_type);
create index if not exists idx_media_uploader   on media_library (uploaded_by);
create index if not exists idx_media_created_at on media_library (created_at desc);

-- ============================================================================
-- 4. NAVIGATION
-- ============================================================================
create table if not exists navigation (
  id         uuid primary key default uuid_generate_v4(),
  title      text not null,
  url        text not null,
  parent_id  uuid references navigation(id) on delete set null,
  icon       text,
  sort_order int not null default 0,
  visible    boolean not null default true,
  target     text not null default '_self'
               check (target in ('_self', '_blank')),
  created_at timestamptz not null default now()
);

-- Indexes
create index if not exists idx_nav_parent_id  on navigation (parent_id);
create index if not exists idx_nav_sort_order on navigation (sort_order);
create index if not exists idx_nav_visible    on navigation (visible) where visible = true;

-- ============================================================================
-- 5. REDIRECTS
-- ============================================================================
create table if not exists redirects (
  id          uuid primary key default uuid_generate_v4(),
  from_slug   text not null unique,
  to_slug     text not null,
  status_code int not null default 301
                check (status_code in (301, 302, 307, 308)),
  created_at  timestamptz not null default now()
);

-- Index
create index if not exists idx_redirects_from on redirects (from_slug);

-- ============================================================================
-- 6. GLOBAL SETTINGS
-- ============================================================================
create table if not exists global_settings (
  id          int primary key default 1 check (id = 1),
  site_name   text not null default 'Amare',
  logo        text,
  favicon     text,
  email       text,
  phone       text,
  address     text,
  social_links  jsonb not null default '{}'::jsonb,
  default_seo   jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Seed default row
insert into global_settings (id, site_name)
values (1, 'Amare')
on conflict (id) do nothing;

-- Trigger
create trigger trg_settings_updated_at
  before update on global_settings
  for each row execute function set_updated_at();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

alter table pages           enable row level security;
alter table page_sections   enable row level security;
alter table media_library   enable row level security;
alter table navigation      enable row level security;
alter table redirects       enable row level security;
alter table global_settings enable row level security;

-- ── Helper: check if user has role ──────────────────────────────────────────
create or replace function user_has_role(required_role text)
returns boolean as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid()
    and role = required_role
  );
end;
$$ language plpgsql security definer;

-- ── PAGES RLS ───────────────────────────────────────────────────────────────

-- Admins: full CRUD
create policy "Admins full access on pages"
  on pages for all
  to authenticated
  using (user_has_role('super_admin') or user_has_role('admin'))
  with check (user_has_role('super_admin') or user_has_role('admin'));

-- Editors: read + insert + update
create policy "Editors can read pages"
  on pages for select
  to authenticated
  using (user_has_role('editor'));

create policy "Editors can insert pages"
  on pages for insert
  to authenticated
  with check (user_has_role('editor'));

create policy "Editors can update pages"
  on pages for update
  to authenticated
  using (user_has_role('editor'))
  with check (user_has_role('editor'));

-- Public: read published only
create policy "Public can read published pages"
  on pages for select
  using (status = 'published');

-- ── PAGE SECTIONS RLS ───────────────────────────────────────────────────────

create policy "Admins full access on sections"
  on page_sections for all
  to authenticated
  using (user_has_role('super_admin') or user_has_role('admin'))
  with check (user_has_role('super_admin') or user_has_role('admin'));

create policy "Editors can read sections"
  on page_sections for select
  to authenticated
  using (user_has_role('editor'));

create policy "Editors can insert sections"
  on page_sections for insert
  to authenticated
  with check (user_has_role('editor'));

create policy "Editors can update sections"
  on page_sections for update
  to authenticated
  using (user_has_role('editor'))
  with check (user_has_role('editor'));

create policy "Editors can delete sections"
  on page_sections for delete
  to authenticated
  using (user_has_role('editor'));

create policy "Public can read visible sections"
  on page_sections for select
  using (
    visible = true
    and exists (
      select 1 from pages
      where pages.id = page_sections.page_id
      and pages.status = 'published'
    )
  );

-- ── MEDIA LIBRARY RLS ───────────────────────────────────────────────────────

create policy "Admins full access on media"
  on media_library for all
  to authenticated
  using (user_has_role('super_admin') or user_has_role('admin'))
  with check (user_has_role('super_admin') or user_has_role('admin'));

create policy "Editors can manage media"
  on media_library for all
  to authenticated
  using (user_has_role('editor'))
  with check (user_has_role('editor'));

create policy "Public can read media"
  on media_library for select
  using (true);

-- ── NAVIGATION RLS ──────────────────────────────────────────────────────────

create policy "Admins full access on navigation"
  on navigation for all
  to authenticated
  using (user_has_role('super_admin') or user_has_role('admin'))
  with check (user_has_role('super_admin') or user_has_role('admin'));

create policy "Editors can manage navigation"
  on navigation for all
  to authenticated
  using (user_has_role('editor'))
  with check (user_has_role('editor'));

create policy "Public can read visible navigation"
  on navigation for select
  using (visible = true);

-- ── REDIRECTS RLS ───────────────────────────────────────────────────────────

create policy "Admins full access on redirects"
  on redirects for all
  to authenticated
  using (user_has_role('super_admin') or user_has_role('admin'))
  with check (user_has_role('super_admin') or user_has_role('admin'));

create policy "Editors can manage redirects"
  on redirects for all
  to authenticated
  using (user_has_role('editor'))
  with check (user_has_role('editor'));

create policy "Public can read redirects"
  on redirects for select
  using (true);

-- ── GLOBAL SETTINGS RLS ─────────────────────────────────────────────────────

create policy "Admins full access on settings"
  on global_settings for all
  to authenticated
  using (user_has_role('super_admin') or user_has_role('admin'))
  with check (user_has_role('super_admin') or user_has_role('admin'));

create policy "Public can read settings"
  on global_settings for select
  using (true);

-- ============================================================================
-- STORAGE BUCKETS
-- ============================================================================

-- Insert buckets via storage API (runs in SQL Editor)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('cms-images',    'cms-images',    true,   52428800, '{image/png,image/jpeg,image/gif,image/webp,image/svg+xml,image/avif}'),
  ('cms-documents', 'cms-documents', false,  104857600, '{application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain,text/csv}'),
  ('cms-icons',     'cms-icons',     false,  10485760, '{image/png,image/jpeg,image/svg+xml,image/webp,image/x-icon}')
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- ── Storage RLS Policies ────────────────────────────────────────────────────

-- Helper: user is admin or editor
create or replace function user_is_staff()
returns boolean as $$
begin
  return user_has_role('super_admin') or user_has_role('admin') or user_has_role('editor');
end;
$$ language plpgsql security definer;

-- cms-images (public read, staff upload)
create policy "Public read cms-images"
  on storage.objects for select
  using (bucket_id = 'cms-images');

create policy "Staff upload cms-images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'cms-images' and user_is_staff());

create policy "Staff update cms-images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'cms-images' and user_is_staff());

create policy "Staff delete cms-images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'cms-images' and user_is_staff());

-- cms-documents (staff only)
create policy "Staff read cms-documents"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'cms-documents' and user_is_staff());

create policy "Staff upload cms-documents"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'cms-documents' and user_is_staff());

create policy "Staff update cms-documents"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'cms-documents' and user_is_staff());

create policy "Staff delete cms-documents"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'cms-documents' and user_is_staff());

-- cms-icons (public read, staff upload)
create policy "Public read cms-icons"
  on storage.objects for select
  using (bucket_id = 'cms-icons');

create policy "Staff upload cms-icons"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'cms-icons' and user_is_staff());

create policy "Staff update cms-icons"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'cms-icons' and user_is_staff());

create policy "Staff delete cms-icons"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'cms-icons' and user_is_staff());

-- ============================================================================
-- SEED DATA — Default navigation
-- ============================================================================
insert into navigation (title, url, sort_order, visible) values
  ('Home',       '/',                 1, true),
  ('About',      '/about',            2, true),
  ('Services',   '/services',         3, true),
  ('Activities', '/activities',       4, true),
  ('News',       '/news',             5, true),
  ('Contact',    '/contact',          6, true)
on conflict do nothing;
