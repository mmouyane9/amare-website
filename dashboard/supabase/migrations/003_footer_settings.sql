-- ============================================================================
-- Footer About Section — add fields to website_settings
-- الجمعية المغربية لهواة البحث والاستكشاف (AMARE)
-- ============================================================================

ALTER TABLE public.website_settings ADD COLUMN IF NOT EXISTS organization_description text;
ALTER TABLE public.website_settings ADD COLUMN IF NOT EXISTS show_logo boolean DEFAULT true;

UPDATE public.website_settings
SET organization_description = 'الجمعية المغربية لهواة البحث والاستكشاف هي إطار قانوني وطني يجمع الهواة تحت راية واحدة لصون التراث الوطني المغربي.',
    show_logo = true
WHERE id = '00000000-0000-0000-0000-000000000001'
  AND organization_description IS NULL;
