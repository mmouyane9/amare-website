-- ============================================================
-- Migration: Fix Admin / User role system (member default, safe signup)
-- ============================================================
-- PURPOSE
--   Normal public signups were ending up as `super_admin` in the live
--   database. The repo files never assign super_admin on signup, so the
--   live signup trigger / column default was changed directly in the
--   Supabase SQL editor. This migration normalises the live DB:
--
--     1. profiles.role DEFAULT       -> 'member'
--     2. CHECK constraint            -> includes 'member'
--     3. handle_new_user() trigger   -> ALWAYS inserts role 'member',
--                                       NEVER reads role from user metadata
--     4. is_admin() helper           -> super_admin / admin only
--     5. RLS policies                -> users can never self-assign a
--                                       privileged role
--     6. Data fix                    -> ONLY the two admin emails keep
--                                       super_admin; every other
--                                       super_admin / 'user' row -> member
--
-- SAFETY
--   - Idempotent: safe to run more than once.
--   - No tables are dropped, no profiles deleted, no unrelated tables touched.
--   - Wrapped in a transaction; any error rolls everything back.
--
-- RUN THIS IN THE SUPABASE SQL EDITOR
-- ============================================================

begin;

-- ---------------------------------------------------------------------------
-- 1) Role CHECK constraint — allow 'member' (keep all existing valid values)
-- ---------------------------------------------------------------------------
-- Safety net: fold any out-of-spec role value into 'member' FIRST, otherwise
-- the constraint below would reject the existing rows and roll back.
update public.profiles
set role = 'member'
where role not in ('super_admin', 'admin', 'editor', 'moderator', 'member', 'user');

alter table public.profiles
  drop constraint if exists profiles_role_check;

alter table public.profiles
  add constraint profiles_role_check
  check (role in ('super_admin', 'admin', 'editor', 'moderator', 'member', 'user'));

-- ---------------------------------------------------------------------------
-- 2) Column default — every new profile falls back to 'member'
-- ---------------------------------------------------------------------------
alter table public.profiles
  alter column role set default 'member';

-- ---------------------------------------------------------------------------
-- 3) Signup trigger — role is ALWAYS 'member', never from untrusted metadata
-- ---------------------------------------------------------------------------
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
-- 4) is_admin() helper — single source of truth, super_admin / admin only
-- ---------------------------------------------------------------------------
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

-- ---------------------------------------------------------------------------
-- 5) Row Level Security — no self-service privilege escalation
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;

-- Users can read their own profile.
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles
  for select
  using (auth.uid() = id);

-- Client-side safety-net insert (trigger missed): only allowed as 'member'.
drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles
  for insert
  with check (auth.uid() = id and role = 'member');

-- Users can update their own profile but may NOT change their role unless
-- they are already an admin (super_admin / admin manage everything).
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

-- Admins (super_admin / admin) can read every profile.
drop policy if exists "profiles_admin_select" on public.profiles;
create policy "profiles_admin_select"
  on public.profiles
  for select
  using (public.is_admin());

-- Admins can insert profiles (e.g. Dashboard Settings -> المسؤولون).
drop policy if exists "profiles_admin_insert" on public.profiles;
create policy "profiles_admin_insert"
  on public.profiles
  for insert
  with check (public.is_admin());

-- Admins can update profiles (manage roles via المسؤولون).
drop policy if exists "profiles_admin_update" on public.profiles;
create policy "profiles_admin_update"
  on public.profiles
  for update
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- 6) Grants — authenticated can select/insert/update, NEVER delete
-- ---------------------------------------------------------------------------
grant usage on schema public to anon, authenticated;
grant select on public.profiles to authenticated;
grant insert on public.profiles to authenticated;
grant update on public.profiles to authenticated;
revoke delete on public.profiles from anon, authenticated;

-- ---------------------------------------------------------------------------
-- 7) DATA FIX — the ONLY super_admins are these two emails
-- ---------------------------------------------------------------------------
-- Guarantee the two real admins are super_admin (by email, case-insensitive).
update public.profiles
set role = 'super_admin'
where lower(email) in ('mmouyane9@gmail.com', 'redwanaitlhadj16@gmail.com');

-- Demote every OTHER profile that was wrongly created as super_admin.
update public.profiles
set role = 'member'
where role = 'super_admin'
  and lower(email) not in ('mmouyane9@gmail.com', 'redwanaitlhadj16@gmail.com');

-- Unify the old 'user' role name to the new 'member' role name.
update public.profiles
set role = 'member'
where role = 'user';

-- ---------------------------------------------------------------------------
-- 8) Sanity check — should show EXACTLY 2 super_admin rows
-- ---------------------------------------------------------------------------
select
  count(*) filter (where role = 'super_admin') as super_admin_count,
  count(*) filter (where role = 'member') as member_count,
  count(*) filter (where role in ('admin', 'editor', 'moderator')) as staff_count
from public.profiles;

select email, full_name, role, created_at
from public.profiles
where role = 'super_admin'
order by email;

commit;
