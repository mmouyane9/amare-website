-- ============================================================
-- Migration: Competition registrations — competition_registrations
-- ============================================================
-- Dedicated table for the national competition registration
-- form (competition.html). Handles personal info + payment
-- receipt upload. Independent from `members` and `membership_renewals`.
--
-- Run this in the Supabase SQL editor (or apply as a migration).
-- Idempotent: safe to run more than once.
--
-- Includes:
--   1. competition_registrations table
--   2. primary key (uuid, gen_random_uuid())
--   3. indexes
--   4. updated_at trigger
--   5. RLS enabled
--   6. INSERT policy (anon + authenticated can submit)
--   7. SELECT policy (admin only — via public.is_admin())
--   8. UPDATE / DELETE policies (admin only)
--   9. competition-receipts storage bucket
--   10. Storage RLS policies
--  11. grants
-- ============================================================

-- ---------------------------------------------------------------------------
-- 0) Shared helpers (idempotent; identical to base migrations)
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

-- ---------------------------------------------------------------------------
-- 1) Table: competition_registrations
-- ---------------------------------------------------------------------------
create table if not exists public.competition_registrations (
  id                  uuid        primary key default gen_random_uuid(),
  first_name          text        not null,
  last_name           text        not null,
  phone               text        not null,
  city                text        not null,
  payment_receipt_url text        not null,
  status              text        not null default 'pending',
  reviewed_at         timestamptz,
  reviewed_by         uuid        references auth.users(id) on delete set null,
  notes               text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 2) Indexes
-- ---------------------------------------------------------------------------
create index if not exists competition_registrations_status_idx
  on public.competition_registrations (status);

create index if not exists competition_registrations_created_at_idx
  on public.competition_registrations (created_at desc);

create index if not exists competition_registrations_phone_idx
  on public.competition_registrations (phone);

create index if not exists competition_registrations_city_idx
  on public.competition_registrations (city);

-- ---------------------------------------------------------------------------
-- 3) updated_at trigger
-- ---------------------------------------------------------------------------
drop trigger if exists set_competition_registrations_updated_at
  on public.competition_registrations;

create trigger set_competition_registrations_updated_at
  before update on public.competition_registrations
  for each row
  execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 4) Row Level Security
-- ---------------------------------------------------------------------------
alter table public.competition_registrations enable row level security;

-- ---------------------------------------------------------------------------
-- 5) INSERT policy — anyone can submit a registration
-- ---------------------------------------------------------------------------
drop policy if exists "competition_registrations_insert" on public.competition_registrations;

create policy "competition_registrations_insert"
  on public.competition_registrations
  for insert
  to anon, authenticated
  with check (true);

-- ---------------------------------------------------------------------------
-- 6) SELECT policy — admins only
-- ---------------------------------------------------------------------------
drop policy if exists "competition_registrations_select_admin" on public.competition_registrations;

create policy "competition_registrations_select_admin"
  on public.competition_registrations
  for select
  to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- 7) UPDATE policy — admins only (approve / reject / add notes)
-- ---------------------------------------------------------------------------
drop policy if exists "competition_registrations_update_admin" on public.competition_registrations;

create policy "competition_registrations_update_admin"
  on public.competition_registrations
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- 8) DELETE policy — admins only
-- ---------------------------------------------------------------------------
drop policy if exists "competition_registrations_delete_admin" on public.competition_registrations;

create policy "competition_registrations_delete_admin"
  on public.competition_registrations
  for delete
  to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- 9) Status check constraint — limited to known values
-- ---------------------------------------------------------------------------
do $$
begin
  alter table public.competition_registrations
    add constraint competition_registrations_status_check
    check (status in ('pending', 'approved', 'rejected'));
exception when duplicate_object then null;
end
$$;

-- ---------------------------------------------------------------------------
-- 10) Grants — least privilege
-- ---------------------------------------------------------------------------
revoke all on public.competition_registrations from anon, authenticated, public;

grant insert on public.competition_registrations to anon, authenticated;
grant select, update, delete on public.competition_registrations to authenticated;

-- ============================================================
-- STORAGE: competition-receipts bucket
-- ============================================================
-- Create the bucket via the Supabase dashboard or SQL.
-- Run this section separately if applying via SQL.

-- Create the bucket (requires superuser / dashboard)
-- If running via SQL editor with admin privileges:
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'competition-receipts',
  'competition-receipts',
  true,
  5242880,  -- 5 MB
  array['image/png', 'image/jpeg', 'image/jpg', 'application/pdf']
)
on conflict (id) do update set
  public            = true,
  file_size_limit   = 5242880,
  allowed_mime_types = array['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];

-- ============================================================
-- STORAGE RLS POLICIES — competition-receipts
-- ============================================================

-- Allow anyone to read from the bucket (public bucket)
drop policy if exists "competition_receipts_select" on storage.objects;

create policy "competition_receipts_select"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'competition-receipts');

-- Allow anyone to upload (insert) into the bucket
drop policy if exists "competition_receipts_insert" on storage.objects;

create policy "competition_receipts_insert"
  on storage.objects
  for insert
  to anon, authenticated
  with check (
    bucket_id = 'competition-receipts'
    and (
      storage.extension(name) = 'png'
      or storage.extension(name) = 'jpg'
      or storage.extension(name) = 'jpeg'
      or storage.extension(name) = 'pdf'
    )
  );

-- Allow admins to delete objects from the bucket
drop policy if exists "competition_receipts_delete_admin" on storage.objects;

create policy "competition_receipts_delete_admin"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'competition-receipts'
    and public.is_admin()
  );
