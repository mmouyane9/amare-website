-- ============================================================================
-- Branches Bilingual Columns + Data Backfill
-- Safe & idempotent. Regions already have name_ar, name_en.
-- Adds: name_fr, description_ar, description_fr
-- ============================================================================

-- regions: add name_fr, description_ar, description_fr
ALTER TABLE public.regions ADD COLUMN IF NOT EXISTS name_fr         text;
ALTER TABLE public.regions ADD COLUMN IF NOT EXISTS description_ar  text;
ALTER TABLE public.regions ADD COLUMN IF NOT EXISTS description_fr  text;

-- cities: add name_fr, description_ar, description_fr
ALTER TABLE public.cities   ADD COLUMN IF NOT EXISTS name_fr         text;
ALTER TABLE public.cities   ADD COLUMN IF NOT EXISTS description_ar  text;
ALTER TABLE public.cities   ADD COLUMN IF NOT EXISTS description_fr  text;

-- Backfill Arabic from existing legacy fields
UPDATE public.regions SET description_ar = description WHERE description_ar IS NULL AND description IS NOT NULL;
UPDATE public.cities   SET description_ar = description WHERE description_ar IS NULL AND description IS NOT NULL;

-- name_ar already exists on both tables (from schema) — no backfill needed

DO $$ BEGIN RAISE NOTICE 'Branches bilingual columns added + Arabic backfilled.'; END $$;
