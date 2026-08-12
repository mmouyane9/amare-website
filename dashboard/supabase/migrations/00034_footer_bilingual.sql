-- ============================================================================
-- Footer Bilingual Labels — label_ar / label_fr
-- الجمعية المغربية لهواة البحث والاستكشاف (AMARE)
-- ============================================================================

-- 1. Add new bilingual columns (keep old title_ar/title_en for compatibility)
ALTER TABLE public.footer_items
  ADD COLUMN IF NOT EXISTS label_ar text,
  ADD COLUMN IF NOT EXISTS label_fr text;

-- 2. Copy existing data: title_ar → label_ar
UPDATE public.footer_items
SET label_ar = title_ar
WHERE label_ar IS NULL AND title_ar IS NOT NULL;

-- 3. Make label_ar NOT NULL after populating
ALTER TABLE public.footer_items
  ALTER COLUMN label_ar SET NOT NULL;

-- ============================================================================
-- Update seed data with proper bilingual labels
-- ============================================================================

-- Column 2: روابط سريعة (Quick Links)
WITH col_links AS (
  SELECT id FROM public.footer_columns WHERE title_ar = 'روابط سريعة'
)
UPDATE public.footer_items SET label_ar = t.label_ar, label_fr = t.label_fr
FROM (VALUES
  ('الرئيسية',       'Accueil',                      '#home'),
  ('من نحن',         'À propos de nous',             '#about'),
  ('أنشطتنا',         'Nos activités',               '#'),
  ('شركاؤنا',         'Nos partenaires',             '#'),
  ('خدماتنا',         'Nos services',                '#services'),
  ('الفروع الجهوية',   'Branches régionales',         'branch.html'),
  ('انخرط معنا',       'Rejoignez-nous',              'Join%20us/index.html'),
  ('الأخبار',         'Actualités',                  'News/news.html'),
  ('الأرشيف',         'Archives',                    'Archive/archive.html'),
  ('اتصل بنا',        'Contactez-nous',              'contact.html')
) AS t(label_ar, label_fr, url)
WHERE public.footer_items.title_ar = t.label_ar
  AND public.footer_items.url = t.url;

-- Column 3: برامجنا (Our Programs)
WITH col_programs AS (
  SELECT id FROM public.footer_columns WHERE title_ar = 'برامجنا'
)
UPDATE public.footer_items SET label_ar = t.label_ar, label_fr = t.label_fr
FROM (VALUES
  ('SOS AMARE',           'SOS AMARE',               'Our%20services/sos-amare.html'),
  ('متجر AMARE',           'Boutique AMARE',          'amare%20store/index.html'),
  ('بيت المستكشف Amare',    'Maison de l''explorateur', 'Our%20services/explorer-house.html'),
  ('مجلة Amare',           'Magazine Amare',          'Our%20services/amare-magazine.html'),
  ('أكاديمية Amare',        'Académie Amare',          'Our%20services/amare-academy.html'),
  ('النوادي',              'Clubs',                   'clubs/'),
  ('المستشار القانوني',      'Conseiller juridique',    'Our%20services/legal-advisor.html'),
  ('عقد التأمين',           'Contrat d''assurance',     'Our%20services/insurance-contract.html')
) AS t(label_ar, label_fr, url)
WHERE public.footer_items.title_ar = t.label_ar
  AND public.footer_items.url = t.url;

-- Column 4: تواصل معنا (Contact) — update labels only, values stay unchanged
WITH col_contact AS (
  SELECT id FROM public.footer_columns WHERE title_ar = 'تواصل معنا'
)
UPDATE public.footer_items SET label_ar = t.label_ar, label_fr = t.label_fr
FROM (VALUES
  ('العنوان', 'Adresse'),
  ('الهاتف',  'Téléphone'),
  ('البريد',  'E-mail')
) AS t(label_ar, label_fr)
WHERE public.footer_items.title_ar = t.label_ar;

-- Column 5: موقعنا (Our Location)
UPDATE public.footer_items
SET label_ar = 'الموقع',
    label_fr = 'Emplacement'
WHERE title_ar = 'الموقع';

-- ============================================================================
-- Also update footer_columns with bilingual labels
-- ============================================================================

ALTER TABLE public.footer_columns
  ADD COLUMN IF NOT EXISTS label_ar text,
  ADD COLUMN IF NOT EXISTS label_fr text;

UPDATE public.footer_columns
SET label_ar = title_ar
WHERE label_ar IS NULL AND title_ar IS NOT NULL;

ALTER TABLE public.footer_columns
  ALTER COLUMN label_ar SET NOT NULL;

UPDATE public.footer_columns SET label_ar = t.label_ar, label_fr = t.label_fr
FROM (VALUES
  ('حول الجمعية',  'À propos de l''association'),
  ('روابط سريعة',  'Liens rapides'),
  ('برامجنا',      'Nos programmes'),
  ('تواصل معنا',   'Contactez-nous'),
  ('موقعنا',       'Notre localisation')
) AS t(label_ar, label_fr)
WHERE public.footer_columns.title_ar = t.label_ar;
