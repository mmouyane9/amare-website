-- ============================================================
-- Migration: Extend profiles.role to support new admin roles
-- ============================================================
-- Run this in the Supabase SQL editor.
-- Idempotent: safe to run more than once.
--
-- Adds super_admin, editor, moderator, and member to the allowed role
-- values while keeping the existing 'admin' and 'user' values.
-- 'member' is the default role for all normal/public signups.
-- ============================================================

alter table public.profiles
  drop constraint if exists profiles_role_check;

alter table public.profiles
  add constraint profiles_role_check
  check (role in ('super_admin', 'admin', 'editor', 'moderator', 'member', 'user'));

alter table public.profiles
  alter column role set default 'member';
