-- ============================================================================
-- AMARE Store — Bilingual Product Columns (_ar/_fr)
-- Safe & idempotent. Preserves existing data. No schema changes beyond columns.
-- ============================================================================

-- Add bilingual columns for translatable product fields
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS name_ar                text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS name_fr                text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS short_description_ar   text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS short_description_fr   text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS description_ar         text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS description_fr         text;

-- Backfill Arabic columns from existing legacy fields
UPDATE public.products SET name_ar              = name              WHERE name_ar              IS NULL;
UPDATE public.products SET short_description_ar = short_description WHERE short_description_ar IS NULL;
UPDATE public.products SET description_ar       = description       WHERE description_ar       IS NULL;

DO $$ BEGIN RAISE NOTICE 'Store bilingual columns added + Arabic backfilled.'; END $$;
