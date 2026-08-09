-- ============================================================
-- Migration: Authentication — profiles table + triggers + RLS
-- ============================================================
-- Run this in the Supabase SQL editor (or apply as a migration).
-- Idempotent: safe to run more than once.
--
-- Creates the single `profiles` table used by the auth system:
--   - id         references auth.users(id)  (ON DELETE CASCADE)
--   - email      unique, NOT NULL
--   - full_name  display name
--   - avatar_url avatar image
--   - role       'member' | admin roles   (read only from this table)
--   - created_at / updated_at timestamps
--
-- Includes:
--   1. profiles table
--   2. indexes
--   3. updated_at trigger
--   4. automatic profile creation on first authentication
--   5. is_admin() helper (server-side, RLS-safe)
--   6. Row Level Security policies
--   7. permissions (grants)
--
-- SECURITY:
--   New signups ALWAYS get role 'member' (see handle_new_user() below).
--   A client-supplied role is never trusted during signup.
--
-- Administration is driven ONLY by the `role` column. To promote a user,
-- an authorized admin updates the profile role (Dashboard -> المسؤولون).
-- ============================================================

-- ---------------------------------------------------------------------------
-- 1) Profiles table
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  email      text not null unique,
  full_name  text,
  avatar_url text,
  role       text not null default 'member' check (role in ('member', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Ensure an existing live table also defaults to 'member' on re-run.
alter table public.profiles
  alter column role set default 'member';

-- ---------------------------------------------------------------------------
-- 2) Indexes
-- ---------------------------------------------------------------------------
-- id (PK) and email (UNIQUE) are indexed automatically by PostgreSQL.
create index if not exists profiles_role_idx on public.profiles (role);
create index if not exists profiles_created_at_idx on public.profiles (created_at);

-- ---------------------------------------------------------------------------
-- 3) updated_at trigger
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

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row
  execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 4) Automatic profile creation on first authentication
-- ---------------------------------------------------------------------------
-- Creates a profile whenever a new auth.users row appears (email sign-up,
-- Google OAuth, invite, ...). ON CONFLICT ... DO NOTHING guarantees we never
-- create a second profile for the same user.
--
-- SECURITY: role is hard-coded to 'member'. A role received from untrusted
-- user metadata is NEVER used, so a normal signup can never become an admin.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url, role)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      ''
    ),
    coalesce(
      new.raw_user_meta_data->>'avatar_url',
      new.raw_user_meta_data->>'picture',
      ''
    ),
    'member'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- 5) is_admin() helper
-- ---------------------------------------------------------------------------
-- Single source of truth for admin checks. Reads the role ONLY from the
-- profiles table (never from client-side values or JWT claims).
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
-- 6) Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;

-- Users can read their own profile.
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles
  for select
  using (auth.uid() = id);

-- Safety net: an authenticated user may create their own profile if the
-- trigger missed it (e.g. users created before this migration).
-- role is forced to 'member' so nobody can self-assign an admin role.
drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles
  for insert
  with check (auth.uid() = id and role = 'member');

-- Users can update their own profile but may NOT change their role
-- (unless they are already an admin, who manages everything).
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    and (
      public.is_admin()
      or role = (select role from public.profiles where id = auth.uid())
    )
  );

-- Admins can read/create/update every profile. Deletion is deliberately
-- left out: profile rows are removed by the auth.users ON DELETE CASCADE,
-- never by a client.
--
-- NOTE: PostgreSQL requires ONE command per CREATE POLICY — a single
-- `FOR SELECT, INSERT, UPDATE` clause is invalid syntax. Each command
-- gets its own policy below.
drop policy if exists "profiles_admin_select" on public.profiles;
create policy "profiles_admin_select"
  on public.profiles
  for select
  using (public.is_admin());

drop policy if exists "profiles_admin_insert" on public.profiles;
create policy "profiles_admin_insert"
  on public.profiles
  for insert
  with check (public.is_admin());

drop policy if exists "profiles_admin_update" on public.profiles;
create policy "profiles_admin_update"
  on public.profiles
  for update
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- 7) Permissions (grants)
-- ---------------------------------------------------------------------------
grant usage on schema public to anon, authenticated;
grant select on public.profiles to authenticated;
grant insert on public.profiles to authenticated;
grant update on public.profiles to authenticated;

-- No public delete: profile deletion is handled by the auth.users
-- ON DELETE CASCADE (service-side), never by a client.
revoke delete on public.profiles from anon, authenticated;

-- is_admin() is only needed server-side/RLS; keep its execute restricted.
revoke execute on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;
