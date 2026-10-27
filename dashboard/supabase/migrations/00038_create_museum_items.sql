-- ============================================================================
-- AMARE — Digital Museum (المتحف الرقمي)
-- Migration: 00038_create_museum_items.sql
-- ----------------------------------------------------------------------------
-- Standalone migration for the Digital Museum feature. Run the whole file in
-- the Supabase SQL Editor (Project → SQL Editor → New query → Run).
--
-- Assumptions (already present in this project):
--   * public.profiles(id uuid, role text) exists and stores the authoritative
--     role of every user. Roles used by the dashboard: super_admin, admin,
--     editor, moderator.
--   * public.is_admin() helper exists (supabase-migration-roles-fix.sql) and
--     returns true only for super_admin / admin. A safe fallback definition is
--     included below for older databases.
--     The dashboard's protected routes only allow super_admin, while the
--     existing CMS grants content management to super_admin + admin. This
--     migration follows the same convention.
--   * public.navigation_items exists (001_navigation.sql) and contains the
--     root "خدماتنا" item.
--   * auth.users exists (Supabase Auth).
--
-- What this migration creates:
--   1. public.museum_items              — museum collection records
--   2. Updated-at trigger + indexes
--   3. Row Level Security               — public reads published rows only,
--                                         super_admin/admin manage all rows
--   4. Storage bucket "museum-media"    — public read, admin write
--   5. Storage RLS policies
--   6. A "المتحف الرقمي" child item under "خدماتنا" in the navigation
--
-- Safe to re-run: tables, indexes, buckets and navigation inserts are guarded;
-- policies and triggers are dropped and recreated.
-- ============================================================================

begin;

-- Needed for gen_random_uuid() on older Postgres versions. On Postgres 13+
-- gen_random_uuid() is built in; CREATE EXTENSION IF NOT EXISTS is harmless.
create extension if not exists "pgcrypto";

-- Reuse the project's existing admin helper. If this database predates
-- supabase-migration-roles-fix.sql, create the same helper so the policies
-- below stay self-contained. The role is always read from public.profiles,
-- never from client-supplied metadata.
do $$
begin
  if not exists (
    select 1
      from pg_proc p
      join pg_namespace n on n.oid = p.pronamespace
     where n.nspname = 'public'
       and p.proname = 'is_admin'
       and pg_get_function_identity_arguments(p.oid) = ''
  ) then
    execute $fn$
      create function public.is_admin()
      returns boolean
      language sql
      security definer
      set search_path = ''
      as $body$
        select exists (
          select 1
            from public.profiles
           where id = auth.uid()
             and role in ('admin', 'super_admin')
        );
      $body$;
    $fn$;
  end if;
end $$;

-- ============================================================================
-- 1. TABLE
-- ============================================================================

create table if not exists public.museum_items (
  id             uuid primary key default gen_random_uuid(),
  title          text not null,
  description    text,
  media_type     text not null,
  media_url      text not null,
  thumbnail_url  text,
  category       text,
  is_published   boolean not null default false,
  display_order  integer not null default 0,
  created_by     uuid default auth.uid() references auth.users(id) on delete set null,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- If an earlier/manual version of the table already exists, make sure every
-- column this feature expects is present (non-destructive).
alter table public.museum_items add column if not exists description   text;
alter table public.museum_items add column if not exists thumbnail_url text;
alter table public.museum_items add column if not exists category      text;
alter table public.museum_items add column if not exists is_published  boolean not null default false;
alter table public.museum_items add column if not exists display_order integer not null default 0;
alter table public.museum_items add column if not exists created_by    uuid default auth.uid() references auth.users(id) on delete set null;
alter table public.museum_items add column if not exists created_at    timestamptz not null default now();
alter table public.museum_items add column if not exists updated_at    timestamptz not null default now();

-- ----------------------------------------------------------------------------
-- Constraints (added by name so the script stays idempotent)
-- ----------------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'museum_items_media_type_check'
      and conrelid = 'public.museum_items'::regclass
  ) then
    alter table public.museum_items
      add constraint museum_items_media_type_check
      check (media_type in ('image', 'video'));
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'museum_items_title_check'
      and conrelid = 'public.museum_items'::regclass
  ) then
    alter table public.museum_items
      add constraint museum_items_title_check
      check (btrim(title) <> '');
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'museum_items_media_url_check'
      and conrelid = 'public.museum_items'::regclass
  ) then
    alter table public.museum_items
      add constraint museum_items_media_url_check
      check (btrim(media_url) <> '');
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'museum_items_display_order_check'
      and conrelid = 'public.museum_items'::regclass
  ) then
    alter table public.museum_items
      add constraint museum_items_display_order_check
      check (display_order >= 0);
  end if;
end $$;

-- ----------------------------------------------------------------------------
-- Updated-at trigger (reuses the project-wide set_updated_at function)
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_museum_items_updated_at on public.museum_items;
create trigger trg_museum_items_updated_at
  before update on public.museum_items
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- Indexes for public queries and dashboard ordering
-- ----------------------------------------------------------------------------
create index if not exists idx_museum_items_public_order
  on public.museum_items (display_order asc, created_at desc)
  where is_published = true;

create index if not exists idx_museum_items_category
  on public.museum_items (category);

create index if not exists idx_museum_items_media_type
  on public.museum_items (media_type);

create index if not exists idx_museum_items_published
  on public.museum_items (is_published);

-- ============================================================================
-- 2. ROW LEVEL SECURITY
-- ============================================================================

alter table public.museum_items enable row level security;

-- Table privileges. RLS still decides which rows are visible/writable.
grant select on public.museum_items to anon, authenticated;
grant insert, update, delete on public.museum_items to authenticated;

-- Public visitors (and signed-in non-admins) only see published items.
drop policy if exists "museum_items_public_read_published" on public.museum_items;
create policy "museum_items_public_read_published"
  on public.museum_items
  for select
  to anon, authenticated
  using (is_published = true);

-- Only super_admin / admin may manage the collection.
-- public.is_admin() is the project's existing authorization helper and reads
-- the role from public.profiles — never from client-supplied metadata.
drop policy if exists "museum_items_admin_manage" on public.museum_items;
create policy "museum_items_admin_manage"
  on public.museum_items
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ============================================================================
-- 3. STORAGE BUCKET + POLICIES
-- ----------------------------------------------------------------------------
-- A dedicated bucket is used for museum media because the existing
-- "cms-images" bucket only allows image MIME types. Both photos and videos are
-- stored here (public read, admin write). Limit: 100 MB per object.
-- ============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'museum-media',
  'museum-media',
  true,
  104857600,
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/avif',
    'video/mp4',
    'video/webm',
    'video/ogg'
  ]
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "museum_media_public_read" on storage.objects;
create policy "museum_media_public_read"
  on storage.objects
  for select
  using (bucket_id = 'museum-media');

drop policy if exists "museum_media_admin_insert" on storage.objects;
create policy "museum_media_admin_insert"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'museum-media'
    and public.is_admin()
  );

drop policy if exists "museum_media_admin_update" on storage.objects;
create policy "museum_media_admin_update"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'museum-media'
    and public.is_admin()
  )
  with check (
    bucket_id = 'museum-media'
    and public.is_admin()
  );

drop policy if exists "museum_media_admin_delete" on storage.objects;
create policy "museum_media_admin_delete"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'museum-media'
    and public.is_admin()
  );

-- ============================================================================
-- 4. NAVIGATION — add "المتحف الرقمي" under "خدماتنا"
-- ----------------------------------------------------------------------------
-- The live navbar is rendered from public.navigation_items. The lookup is done
-- by title instead of a hard-coded UUID so the script works across
-- environments. If the navbar is managed manually instead, add this link from
-- the dashboard: القائمة العلوية → خدماتنا → child "المتحف الرقمي"
-- → /Our%20services/digital-museum.html
-- ============================================================================

do $$
declare
  v_services_id uuid;
  v_next_order  integer;
begin
  select id
    into v_services_id
    from public.navigation_items
   where parent_id is null
     and title_ar = 'خدماتنا'
   order by sort_order asc
   limit 1;

  if v_services_id is null then
    raise notice 'Root navigation item "خدماتنا" was not found. Add the museum link manually.';
  elsif not exists (
    select 1
      from public.navigation_items
     where url in (
       '/Our%20services/digital-museum.html',
       '/Our services/digital-museum.html'
     )
  ) then
    select coalesce(max(sort_order), 0) + 1
      into v_next_order
      from public.navigation_items
     where parent_id = v_services_id;

    insert into public.navigation_items (
      parent_id,
      title_ar,
      title_en,
      description_ar,
      description_en,
      url,
      type,
      sort_order,
      is_visible
    ) values (
      v_services_id,
      'المتحف الرقمي',
      'Digital Museum',
      'اكتشف مقتنيات الجمعية والتراث الثقافي رقميًا.',
      'Explore the association''s collections and cultural heritage online.',
      '/Our%20services/digital-museum.html',
      'link',
      v_next_order,
      true
    );
  end if;
end $$;

-- Refresh PostgREST's schema cache so the new table is immediately queryable.
notify pgrst, 'reload schema';

commit;
