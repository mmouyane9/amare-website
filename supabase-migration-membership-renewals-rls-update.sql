-- ============================================================
-- Migration: Fix membership_renewals RLS — allow super_admin
-- ============================================================
-- PROBLEM:
--   The is_admin() function defined in the membership_renewals
--   migration only checks for role = 'admin', but the dashboard
--   authenticates as super_admin. This causes all SELECT queries
--   on membership_renewals to return zero rows (silently blocked
--   by RLS).
--
-- FIX:
--   1. Redefine is_admin() to include both 'admin' and 'super_admin'
--   2. Add UPDATE / DELETE policies (idempotent)
--   3. Add grants
--
-- Run this in the Supabase SQL editor.
-- ============================================================

-- Fix is_admin() — must include super_admin (dashboard uses super_admin role)
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

-- UPDATE policy — admins only
drop policy if exists "membership_renewals_update_admin" on public.membership_renewals;
create policy "membership_renewals_update_admin"
  on public.membership_renewals
  for update
  to authenticated
  using (public.is_admin());

-- DELETE policy — admins only
drop policy if exists "membership_renewals_delete_admin" on public.membership_renewals;
create policy "membership_renewals_delete_admin"
  on public.membership_renewals
  for delete
  to authenticated
  using (public.is_admin());

-- Grants
grant update on public.membership_renewals to authenticated;
grant delete on public.membership_renewals to authenticated;
