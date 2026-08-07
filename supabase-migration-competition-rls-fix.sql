-- ============================================================
-- COMPREHENSIVE FIX: competition_registrations RLS
-- ============================================================
-- PROBLEM:
--   403 Forbidden (42501) on UPDATE/DELETE despite SELECT working.
--   SELECT succeeds → is_admin() works for the dashboard user.
--   UPDATE/DELETE fail  → those specific RLS policies are missing
--                         or were never applied.
--
--   The original migration script redefines is_admin() to only
--   role = 'admin' (excluding super_admin). But SELECT works,
--   meaning a prior fix already expanded is_admin(). However the
--   UPDATE/DELETE policies themselves may be absent.
--
-- FIX:
--   1. Redefine is_admin() to include super_admin (idempotent)
--   2. Drop + recreate ALL four RLS policies
--   3. Re-grant all required privileges
--   4. Show current policies for verification
-- ============================================================

-- 1) Fix is_admin() — support both admin and super_admin roles
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
      and role in ('admin', 'super_admin')
  );
$$;

-- 2) Ensure RLS is enabled
alter table public.competition_registrations enable row level security;

-- 3) SELECT policy — admins only
drop policy if exists "competition_registrations_select_admin" on public.competition_registrations;
create policy "competition_registrations_select_admin"
  on public.competition_registrations
  for select
  to authenticated
  using (public.is_admin());

-- 4) INSERT policy — anyone can submit
drop policy if exists "competition_registrations_insert" on public.competition_registrations;
create policy "competition_registrations_insert"
  on public.competition_registrations
  for insert
  to anon, authenticated
  with check (true);

-- 5) UPDATE policy — admins only
drop policy if exists "competition_registrations_update_admin" on public.competition_registrations;
create policy "competition_registrations_update_admin"
  on public.competition_registrations
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- 6) DELETE policy — admins only
drop policy if exists "competition_registrations_delete_admin" on public.competition_registrations;
create policy "competition_registrations_delete_admin"
  on public.competition_registrations
  for delete
  to authenticated
  using (public.is_admin());

-- 7) Grants — ensure authenticated users have all required privileges
grant select, insert, update, delete on public.competition_registrations to authenticated;
grant insert on public.competition_registrations to anon;

-- 8) Verify: show all current policies on the table
select
  policyname,
  cmd,
  roles,
  qual,
  with_check
from pg_policies
where tablename = 'competition_registrations'
  and schemaname = 'public'
order by cmd;
