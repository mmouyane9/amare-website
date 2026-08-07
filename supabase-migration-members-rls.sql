-- ============================================================
-- Migration: RLS policies for authenticated admin access to members
-- ============================================================
-- The members table only had anon-level policies (for public form
-- submissions). The admin dashboard uses the authenticated client
-- which runs as 'authenticated' role -- RLS blocked all writes.
-- This migration adds admin CRUD policies and ensures the is_admin()
-- helper includes super_admin.
-- ============================================================

-- 1. Ensure is_admin() includes both admin and super_admin roles
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

-- 2. Drop existing anon-only policies to replace with broader ones
drop policy if exists "Anyone can insert members" on public.members;
drop policy if exists "Anyone can view members" on public.members;

-- 3. Anon: can still insert (public registration form)
create policy "Anon can insert members"
  on public.members
  for insert
  to anon
  with check (true);

-- 4. Anon: can select (public reads)
create policy "Anon can view members"
  on public.members
  for select
  to anon
  using (true);

-- 5. Authenticated: can select all members
create policy "Authenticated can view members"
  on public.members
  for select
  to authenticated
  using (true);

-- 6. Admin: full CRUD (insert, update, delete)
create policy "Admin full access to members"
  on public.members
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- 7. Ensure members table has RLS enabled
alter table public.members enable row level security;
