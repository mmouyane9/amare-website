-- ============================================================================
-- Website Settings — Bilingual Address (address_ar / address_fr)
-- الجمعية المغربية لهواة البحث والاستكشاف (AMARE)
-- ============================================================================

-- 1. Add bilingual address columns (keep legacy `address` for compatibility)
ALTER TABLE public.website_settings
  ADD COLUMN IF NOT EXISTS address_ar text,
  ADD COLUMN IF NOT EXISTS address_fr text;

-- 2. Preserve existing Arabic address into address_ar
UPDATE public.website_settings
SET address_ar = address
WHERE address_ar IS NULL AND address IS NOT NULL;

-- 3. Backfill the French translation for the known current address
--    (الطابق الأول ... أكادير → 1er étage ... Agadir)
UPDATE public.website_settings
SET address_fr = '1er étage, Appartement 4, Complexe Commercial Tiwizi, Takadirt, Agadir'
WHERE address_fr IS NULL
  AND address_ar IS NOT NULL
  AND address_ar LIKE '%الطابق%'
  AND address_ar LIKE '%أكادير%';
