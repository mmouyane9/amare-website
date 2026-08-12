-- ============================================================================
-- Footer Management System v2 — 5-Column Structure
-- الجمعية المغربية لهواة البحث والاستكشاف (AMARE)
-- Safe re-run: drops and recreates tables, then seeds all data.
-- ============================================================================

-- ============================================================================
-- Drop old tables (safe — seed data repopulates everything)
-- ============================================================================
DROP TABLE IF EXISTS public.footer_items CASCADE;
DROP TABLE IF EXISTS public.footer_columns CASCADE;

-- ============================================================================
-- 1. footer_columns
-- ============================================================================
CREATE TABLE public.footer_columns (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title_ar    text,
  title_en    text,
  label_ar    text NOT NULL,
  label_fr    text,
  icon        text,
  type        text NOT NULL DEFAULT 'links'
              CHECK (type IN ('about', 'links', 'contact', 'map')),
  sort_order  integer NOT NULL DEFAULT 0,
  is_visible  boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- ============================================================================
-- 2. footer_items
-- ============================================================================
CREATE TABLE public.footer_items (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  column_id       uuid REFERENCES public.footer_columns(id) ON DELETE CASCADE,
  parent_id       uuid REFERENCES public.footer_items(id) ON DELETE CASCADE,
  title_ar        text,
  title_en        text,
  label_ar        text NOT NULL,
  label_fr        text,
  url             text,
  value           text,
  link_type       text NOT NULL DEFAULT 'url'
                  CHECK (link_type IN ('url', 'tel', 'mailto', 'map', 'none')),
  icon            text,
  sort_order      integer NOT NULL DEFAULT 0,
  is_visible      boolean NOT NULL DEFAULT true,
  open_in_new_tab boolean NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE  public.footer_items IS 'عناصر القائمة السفلية';
COMMENT ON COLUMN public.footer_items.value     IS 'قيمة العرض لنوع contact';
COMMENT ON COLUMN public.footer_items.link_type IS 'نوع الرابط: url, tel, mailto, map, none';
COMMENT ON COLUMN public.footer_items.column_id IS 'العمود الذي ينتمي إليه العنصر';

-- ============================================================================
-- Indexes
-- ============================================================================
CREATE INDEX idx_footer_items_column_id  ON public.footer_items(column_id);
CREATE INDEX idx_footer_items_parent_id  ON public.footer_items(parent_id);
CREATE INDEX idx_footer_items_sort_order ON public.footer_items(sort_order);
CREATE INDEX idx_footer_items_is_visible ON public.footer_items(is_visible);
CREATE INDEX idx_footer_columns_sort      ON public.footer_columns(sort_order);

-- ============================================================================
-- updated_at triggers
-- ============================================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_footer_columns_updated_at'
  ) THEN
    CREATE TRIGGER trg_footer_columns_updated_at
      BEFORE UPDATE ON public.footer_columns
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_footer_items_updated_at'
  ) THEN
    CREATE TRIGGER trg_footer_items_updated_at
      BEFORE UPDATE ON public.footer_items
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
END $$;

-- ============================================================================
-- RLS
-- ============================================================================
ALTER TABLE public.footer_columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.footer_items  ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read footer_columns" ON public.footer_columns;
CREATE POLICY "Allow public read footer_columns"
  ON public.footer_columns FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow authenticated insert footer_columns" ON public.footer_columns;
CREATE POLICY "Allow authenticated insert footer_columns"
  ON public.footer_columns FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow authenticated update footer_columns" ON public.footer_columns;
CREATE POLICY "Allow authenticated update footer_columns"
  ON public.footer_columns FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow authenticated delete footer_columns" ON public.footer_columns;
CREATE POLICY "Allow authenticated delete footer_columns"
  ON public.footer_columns FOR DELETE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow public read footer_items" ON public.footer_items;
CREATE POLICY "Allow public read footer_items"
  ON public.footer_items FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow authenticated insert footer_items" ON public.footer_items;
CREATE POLICY "Allow authenticated insert footer_items"
  ON public.footer_items FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow authenticated update footer_items" ON public.footer_items;
CREATE POLICY "Allow authenticated update footer_items"
  ON public.footer_items FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow authenticated delete footer_items" ON public.footer_items;
CREATE POLICY "Allow authenticated delete footer_items"
  ON public.footer_items FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================================================
-- Realtime
-- ============================================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'footer_columns'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.footer_columns;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'footer_items'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.footer_items;
  END IF;
END $$;

-- ============================================================================
-- Seed data — 5 columns matching the website
-- ============================================================================

-- Column 1: حول الجمعية
INSERT INTO public.footer_columns (title_ar, title_en, label_ar, label_fr, type, sort_order, is_visible)
VALUES ('حول الجمعية', 'About the Association', 'حول الجمعية', 'À propos de l''association', 'about', 1, true);

-- Column 2: روابط سريعة
WITH col_links AS (
  INSERT INTO public.footer_columns (title_ar, title_en, label_ar, label_fr, type, sort_order, is_visible)
  VALUES ('روابط سريعة', 'Quick Links', 'روابط سريعة', 'Liens rapides', 'links', 2, true)
  RETURNING id
)
INSERT INTO public.footer_items (column_id, title_ar, title_en, label_ar, label_fr, url, sort_order, is_visible)
SELECT id, name_ar, name_en, label_ar, label_fr, url, sort, true
FROM (
  VALUES
    ('الرئيسية',       'Home',         'الرئيسية',       'Accueil',              'index.html',                           1),
    ('من نحن',         'About Us',     'من نحن',         'À propos de nous',     'Who%20are%20we/index.html',            2),
    ('أنشطتنا',         'Activities',   'أنشطتنا',         'Nos activités',        'Our%20activities/index.html',          3),
    ('شركاؤنا',         'Partners',     'شركاؤنا',         'Nos partenaires',      'Our%20partners/lefouilleurma.html',    4),
    ('خدماتنا',         'Services',     'خدماتنا',         'Nos services',         'Our%20services/sos-amare.html',        5),
    ('الفروع الجهوية',   'Branches',     'الفروع الجهوية',   'Branches régionales',  'branch.html',                          6),
    ('انخرط معنا',       'Join Us',      'انخرط معنا',       'Rejoignez-nous',       'Join%20us/join-us-online.html',        7),
    ('الأخبار',         'News',         'الأخبار',         'Actualités',           'News/news.html',                       8),
    ('الأرشيف',         'Archive',      'الأرشيف',         'Archives',             'Archive/archive.html',                 9),
    ('اتصل بنا',        'Contact Us',   'اتصل بنا',        'Contactez-nous',       'contact.html',                         10)
) AS t(name_ar, name_en, label_ar, label_fr, url, sort), col_links;

-- Column 3: برامجنا
WITH col_programs AS (
  INSERT INTO public.footer_columns (title_ar, title_en, label_ar, label_fr, type, sort_order, is_visible)
  VALUES ('برامجنا', 'Our Programs', 'برامجنا', 'Nos programmes', 'links', 3, true)
  RETURNING id
)
INSERT INTO public.footer_items (column_id, title_ar, title_en, label_ar, label_fr, url, sort_order, is_visible)
SELECT id, name_ar, name_en, label_ar, label_fr, url, sort, true
FROM (
  VALUES
    ('SOS AMARE',           'SOS AMARE',           'SOS AMARE',              'SOS AMARE',               'Our%20services/sos-amare.html',           1),
    ('متجر AMARE',           'AMARE Store',         'متجر AMARE',              'Boutique AMARE',          'amare%20store/index.html',                2),
    ('بيت المستكشف Amare',    'Explorer House',      'بيت المستكشف Amare',       'Maison de l''explorateur', 'Our%20services/explorer-house.html',      3),
    ('مجلة Amare',           'AMARE Magazine',      'مجلة Amare',              'Magazine Amare',          'Our%20services/amare-magazine.html',      4),
    ('أكاديمية Amare',        'AMARE Academy',       'أكاديمية Amare',           'Académie Amare',          'Our%20services/amare-academy.html',       5),
    ('النوادي',              'Clubs',               'النوادي',                 'Clubs',                   'clubs/',                                   6),
    ('المستشار القانوني',      'Legal Advisor',       'المستشار القانوني',         'Conseiller juridique',    'Our%20services/legal-advisor.html',       7),
    ('عقد التأمين',           'Insurance Contract',  'عقد التأمين',              'Contrat d''assurance',     'Our%20services/insurance-contract.html',   8)
) AS t(name_ar, name_en, label_ar, label_fr, url, sort), col_programs;

-- Column 4: تواصل معنا
WITH col_contact AS (
  INSERT INTO public.footer_columns (title_ar, title_en, label_ar, label_fr, type, sort_order, is_visible)
  VALUES ('تواصل معنا', 'Contact Us', 'تواصل معنا', 'Contactez-nous', 'contact', 4, true)
  RETURNING id
)
INSERT INTO public.footer_items (column_id, title_ar, label_ar, label_fr, icon, value, url, link_type, sort_order, is_visible)
SELECT id, label_ar, label_ar, label_fr, icon, val, url, ltype, sort, true
FROM (
  VALUES
    ('العنوان', 'العنوان',   'Adresse',   'map-pin', 'ص.ب 749 أيت ملول 86150',           NULL,                                        'none',   1),
    ('الهاتف',  'الهاتف',    'Téléphone', 'phone',   '+212 684869996',                   'tel:+212684869996',                         'tel',    2),
    ('البريد',  'البريد',    'E-mail',    'mail',    'association.amare.agadir@gmail.com','mailto:association.amare.agadir@gmail.com', 'mailto', 3)
) AS t(label_ar, label_ar2, label_fr, icon, val, url, ltype, sort), col_contact;

-- Column 5: موقعنا
WITH col_map AS (
  INSERT INTO public.footer_columns (title_ar, title_en, label_ar, label_fr, type, sort_order, is_visible)
  VALUES ('موقعنا', 'Our Location', 'موقعنا', 'Notre localisation', 'map', 5, true)
  RETURNING id
)
INSERT INTO public.footer_items (column_id, title_ar, label_ar, label_fr, value, url, link_type, sort_order, is_visible)
SELECT id, label_ar, label_ar, label_fr, val, url, ltype, sort, true
FROM (
  VALUES
    ('الموقع', 'الموقع', 'Emplacement', '📍 Ait Melloul, Agadir', 'https://www.google.com/maps?q=30.385528,-9.448611&z=16&output=embed', 'map', 1)
) AS t(label_ar, label_ar2, label_fr, val, url, ltype, sort), col_map;
""