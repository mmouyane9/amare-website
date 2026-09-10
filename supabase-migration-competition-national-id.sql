-- ============================================================
-- Migration: Add national_id to competition_registrations
-- ============================================================
-- Adds the National ID card number field collected on the
-- competition registration form (competition.html panel 1).
--
-- Run this in the Supabase SQL editor (or apply as a migration).
-- Idempotent: safe to run more than once.
-- ============================================================

do $$
begin
  alter table public.competition_registrations
    add column if not exists national_id text;
end
$$;

-- Keep the index conventions of the table
create index if not exists competition_registrations_national_id_idx
  on public.competition_registrations (national_id);

-- ============================================================
-- Backfill note:
-- Existing rows will have NULL national_id. If you want to make
-- this column mandatory going forward, once it is populated you
-- can tighten the constraint with:
--
--   alter table public.competition_registrations
--     alter column national_id set not null;
--
-- (Do NOT run until all existing rows carry a value.)
-- ============================================================