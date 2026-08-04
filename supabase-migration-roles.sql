-- ============================================================
-- Migration: Extend profiles.role to support new admin roles
-- ============================================================
-- Run this in the Supabase SQL editor.
-- Idempotent: safe to run more than once.
--
-- Adds super_admin, editor, and moderator to the allowed role
-- values while keeping the existing 'user' and 'admin' values.
-- ============================================================

alter table public.profiles
  drop constraint if exists profiles_role_check;

alter table public.profiles
  add constraint profiles_role_check
  check (role in ('super_admin', 'admin', 'editor', 'moderator', 'user'));
