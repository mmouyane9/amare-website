-- ============================================================
-- Migration: Membership renewal requests — membership_renewals
-- ============================================================
-- Dedicated table for EXISTING members to request a membership
-- renewal. Completely independent from the `members` table and
-- the online membership registration workflow (join-us-online).
--
-- Run this in the Supabase SQL editor (or apply as a migration).
-- Idempotent: safe to run more than once.
--
-- Includes:
--   1. membership_renewals table
--   2. primary key (uuid, gen_random_uuid())
--   3. indexes
--   4. updated_at trigger
--   5. RLS enabled
--   6. INSERT policy  (anon + authenticated can submit a request)
--   7. SELECT policy  (admin only — via public.is_admin())
--   8. grants
-- ============================================================

-- ---------------------------------------------------------------------------
-- 0) Shared helpers (idempotent; identical to supabase-migration-auth.sql)
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
-- 1) Table
-- ---------------------------------------------------------------------------
create table if not exists public.membership_renewals (
  id                uuid        primary key default gen_random_uuid(),
  first_name        text        not null,
  last_name         text        not null,
  membership_number text        not null,
  status            text        not null default 'pending',
  notes             text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 2) Indexes
-- ---------------------------------------------------------------------------
create index if not exists membership_renewals_membership_number_idx
  on public.membership_renewals (membership_number);

create index if not exists membership_renewals_status_idx
  on public.membership_renewals (status);

create index if not exists membership_renewals_created_at_idx
  on public.membership_renewals (created_at);

-- ---------------------------------------------------------------------------
-- 3) updated_at trigger
-- ---------------------------------------------------------------------------
drop trigger if exists set_membership_renewals_updated_at on public.membership_renewals;
create trigger set_membership_renewals_updated_at
  before update on public.membership_renewals
  for each row
  execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 4) Row Level Security
-- ---------------------------------------------------------------------------
alter table public.membership_renewals enable row level security;

-- ---------------------------------------------------------------------------
-- 5) INSERT policy — public form submission
-- ---------------------------------------------------------------------------
drop policy if exists "membership_renewals_insert" on public.membership_renewals;
create policy "membership_renewals_insert"
  on public.membership_renewals
  for insert
  to anon, authenticated
  with check (true);

-- ---------------------------------------------------------------------------
-- 6) SELECT policy — admins only (from profiles.role)
-- ---------------------------------------------------------------------------
drop policy if exists "membership_renewals_select_admin" on public.membership_renewals;
create policy "membership_renewals_select_admin"
  on public.membership_renewals
  for select
  to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- 7) Grants — least privilege: only what the app needs
-- ---------------------------------------------------------------------------
revoke all on public.membership_renewals from anon, authenticated, public;

grant insert on public.membership_renewals to anon, authenticated;
grant select on public.membership_renewals to authenticated;
