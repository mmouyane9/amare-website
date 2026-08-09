-- ====================================================================
-- Migration: hero_updates — optional scheduling (start / end date)
--
-- ADDITIVE ONLY. Does NOT drop or recreate the table.
-- Existing rows, triggers, RLS policies, and indexes are untouched.
-- The Dashboard (المستجدات) and the public hero-service remain fully
-- compatible: new columns are nullable and optional.
--
-- Run this in the Supabase SQL Editor to enable date-window scheduling
-- for promotional heroes. The public fix works with or without it.
-- ====================================================================

ALTER TABLE hero_updates
  ADD COLUMN IF NOT EXISTS start_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS end_date   TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_hero_updates_start_date ON hero_updates (start_date);
CREATE INDEX IF NOT EXISTS idx_hero_updates_end_date   ON hero_updates (end_date);
