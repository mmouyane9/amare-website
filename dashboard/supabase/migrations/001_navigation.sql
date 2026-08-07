-- ============================================================================
-- Navigation Management System — Complete Seed
-- الجمعية المغربية لهواة البحث والاستكشاف (AMARE)
-- Exact website navigation hierarchy match.
-- ============================================================================

-- 1. navigation_groups
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.navigation_groups (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name_ar     text NOT NULL,
  name_en     text,
  sort_order  integer NOT NULL DEFAULT 0,
  is_visible  boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE  public.navigation_groups IS 'مجموعات روابط القائمة العلوية';

-- 2. navigation_items
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.navigation_items (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id        uuid REFERENCES public.navigation_groups(id) ON DELETE SET NULL,
  parent_id       uuid REFERENCES public.navigation_items(id) ON DELETE CASCADE,
  title_ar        text NOT NULL,
  title_en        text,
  description_ar  text,
  description_en  text,
  url             text,
  icon            text,
  type            text NOT NULL DEFAULT 'link' CHECK (type IN ('link', 'button', 'header')),
  target_blank    boolean NOT NULL DEFAULT false,
  sort_order      integer NOT NULL DEFAULT 0,
  is_visible      boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE  public.navigation_items IS 'عناصر القائمة العلوية';

-- Add columns that might be missing from a previous migration run
ALTER TABLE public.navigation_items ADD COLUMN IF NOT EXISTS description_ar text;
ALTER TABLE public.navigation_items ADD COLUMN IF NOT EXISTS description_en text;

-- ============================================================================
-- Indexes
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_navigation_items_parent_id   ON public.navigation_items(parent_id);
CREATE INDEX IF NOT EXISTS idx_navigation_items_group_id    ON public.navigation_items(group_id);
CREATE INDEX IF NOT EXISTS idx_navigation_items_sort_order  ON public.navigation_items(sort_order);
CREATE INDEX IF NOT EXISTS idx_navigation_items_is_visible  ON public.navigation_items(is_visible);
CREATE INDEX IF NOT EXISTS idx_navigation_groups_sort_order ON public.navigation_groups(sort_order);
CREATE INDEX IF NOT EXISTS idx_navigation_groups_is_visible ON public.navigation_groups(is_visible);

-- ============================================================================
-- updated_at trigger
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
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_navigation_groups_updated_at'
  ) THEN
    CREATE TRIGGER trg_navigation_groups_updated_at
      BEFORE UPDATE ON public.navigation_groups
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_navigation_items_updated_at'
  ) THEN
    CREATE TRIGGER trg_navigation_items_updated_at
      BEFORE UPDATE ON public.navigation_items
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
END $$;

-- ============================================================================
-- RLS
-- ============================================================================
ALTER TABLE public.navigation_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.navigation_items  ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read navigation_groups" ON public.navigation_groups;
CREATE POLICY "Allow public read navigation_groups"
  ON public.navigation_groups FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow authenticated insert navigation_groups" ON public.navigation_groups;
CREATE POLICY "Allow authenticated insert navigation_groups"
  ON public.navigation_groups FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow authenticated update navigation_groups" ON public.navigation_groups;
CREATE POLICY "Allow authenticated update navigation_groups"
  ON public.navigation_groups FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow authenticated delete navigation_groups" ON public.navigation_groups;
CREATE POLICY "Allow authenticated delete navigation_groups"
  ON public.navigation_groups FOR DELETE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow public read navigation_items" ON public.navigation_items;
CREATE POLICY "Allow public read navigation_items"
  ON public.navigation_items FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow authenticated insert navigation_items" ON public.navigation_items;
CREATE POLICY "Allow authenticated insert navigation_items"
  ON public.navigation_items FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow authenticated update navigation_items" ON public.navigation_items;
CREATE POLICY "Allow authenticated update navigation_items"
  ON public.navigation_items FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow authenticated delete navigation_items" ON public.navigation_items;
CREATE POLICY "Allow authenticated delete navigation_items"
  ON public.navigation_items FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================================================
-- Realtime (safe for re-run — skips if already added)
-- ============================================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'navigation_groups'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.navigation_groups;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'navigation_items'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.navigation_items;
  END IF;
END $$;

-- ============================================================================
-- Seed data -- complete website navigation (exact match)
-- ============================================================================

DELETE FROM public.navigation_items  WHERE true;
DELETE FROM public.navigation_groups WHERE true;

-- 1. الرئيسية
INSERT INTO public.navigation_items (title_ar, title_en, url, type, sort_order, is_visible)
VALUES ('الرئيسية', 'Home', '#home', 'link', 1, true);

-- 2. من نحن (dropdown -- 5 children)
WITH parent_about AS (
  INSERT INTO public.navigation_items (title_ar, title_en, url, type, sort_order, is_visible)
  VALUES ('من نحن', 'About Us', '#about', 'link', 2, true)
  RETURNING id
)
INSERT INTO public.navigation_items (parent_id, title_ar, title_en, description_ar, url, icon, type, sort_order, is_visible)
SELECT id, name_ar, name_en, desc_ar, url, icon, 'link', sort, true
FROM (
  VALUES
    ('الرئية الوطنية', 'National Presidency', 'تعرف على تاريخ ومسيرة الجمعية', '/Who%20are%20we/national-vision.html', 'org', 1),
    ('الرسالة', 'Our Mission', 'رؤيتنا نحو مستقبل أفضل', '/Who%20are%20we/our-mission.html', 'eye', 2),
    ('القيم', 'Our Values', 'الأهداف الاستراتيجية للجمعية', '/Who%20are%20we/our-values.html', 'target', 3),
    ('المكتب المركزي', 'Central Office', 'الهيكل الإداري للجمعية', '/Who%20are%20we/central-office.html', 'users', 4),
    ('خارطة التوسع', 'Expansion Map', 'القانون الأساسي للجمعية', '/Who%20are%20we/expansion-map.html', 'file', 5)
) AS t(name_ar, name_en, desc_ar, url, icon, sort), parent_about;

-- 3. أنشطتنا (dropdown -- 6 children)
WITH parent_activities AS (
  INSERT INTO public.navigation_items (title_ar, title_en, url, type, sort_order, is_visible)
  VALUES ('أنشطتنا', 'Our Activities', '#', 'link', 3, true)
  RETURNING id
)
INSERT INTO public.navigation_items (parent_id, title_ar, title_en, description_ar, url, icon, type, sort_order, is_visible)
SELECT id, name_ar, name_en, desc_ar, url, icon, 'link', sort, true
FROM (
  VALUES
    ('خرجات', 'Outings', 'أنشطة وفعاليات ميدانية', '/Our%20activities/outings.html', 'map', 1),
    ('مسابقات وراليات', 'Competitions & Rallies', 'حملات تطوعية من أجل المجتمع', '/Our%20activities/competitions-trips.html', 'heart', 2),
    ('تكوينات', 'Training', 'استكشاف تراثنا الطبيعي', '/Our%20activities/training.html', 'compass', 3),
    ('معارض', 'Exhibitions', 'ورشات تكوينية وتأهيلية', '/Our%20activities/exhibitions.html', 'tool', 4),
    ('لقاءات', 'Meetings', 'معارض وفعاليات ثقافية', '/Our%20activities/meetings.html', 'image', 5),
    ('حملات بيئية', 'Environmental Campaigns', 'تعرف على فعالياتنا القادمة', '/Our%20activities/environmental-campaigns.html', 'calendar', 6)
) AS t(name_ar, name_en, desc_ar, url, icon, sort), parent_activities;

-- 4. شركاؤنا (dropdown -- 6 children)
WITH parent_partners AS (
  INSERT INTO public.navigation_items (title_ar, title_en, url, type, sort_order, is_visible)
  VALUES ('شركاؤنا', 'Our Partners', '#', 'link', 4, true)
  RETURNING id
)
INSERT INTO public.navigation_items (parent_id, title_ar, title_en, description_ar, url, icon, type, sort_order, is_visible)
SELECT id, name_ar, name_en, desc_ar, url, icon, 'link', sort, true
FROM (
  VALUES
    ('LeFouilleurma', 'LeFouilleurma', 'شركاؤنا على المستوى الوطني', '/Our%20partners/lefouilleurma.html', 'map', 1),
    ('SENOTEC', 'SENOTEC', 'شركاؤنا على المستوى الدولي', '/Our%20partners/senotec.html', 'globe', 2),
    ('ASTROMET', 'ASTROMET', 'انضم إلى قائمة شركائنا', '/Our%20partners/astromet.html', 'userPlus', 3),
    ('AssociationDetectionCentre', 'AssociationDetectionCentre', 'اتفاقيات الشراكة والتعاون', '/Our%20partners/association-detection-centre.html', 'file', 4),
    ('ANCPP', 'ANCPP', 'قصص نجاح شراكاتنا', '/Our%20partners/ancpp.html', 'star', 5),
    ('OMSDS', 'OMSDS', 'قصص نجاح شراكاتنا', '/Our%20partners/omsds.html', 'star', 6)
) AS t(name_ar, name_en, desc_ar, url, icon, sort), parent_partners;

-- 5. خدماتنا (dropdown -- 8 children)
WITH parent_services AS (
  INSERT INTO public.navigation_items (title_ar, title_en, url, type, sort_order, is_visible)
  VALUES ('خدماتنا', 'Our Services', '#services', 'link', 5, true)
  RETURNING id
)
INSERT INTO public.navigation_items (parent_id, title_ar, title_en, description_ar, url, icon, type, sort_order, is_visible)
SELECT id, name_ar, name_en, desc_ar, url, icon, 'link', sort, true
FROM (
  VALUES
    ('SOS AMARE', 'SOS AMARE', 'دورات وورشات تكوينية', '/Our%20services/sos-amare.html', 'book', 1),
    ('متجر AMARE', 'AMARE Store', 'منتجات تدعم أنشطة الجمعية', 'amare store/index.html', 'bag', 2),
    ('بيت المستكشف Amare', 'Explorer House', 'انضم إلى مجتمع AMARE', '/Our%20services/explorer-house.html', 'userPlus', 3),
    ('مجلة Amare', 'AMARE Magazine', 'برامج تدريبية متخصصة', '/Our%20services/amare-magazine.html', 'clipboard', 4),
    ('اكاديمية Amare', 'AMARE Academy', 'استشارات في المجال البيئي', '/Our%20services/amare-academy.html', 'leaf', 5),
    ('النوادي', 'Clubs', 'دعم للباحثين والمستكشفين', '/clubs/', 'search', 6),
    ('المستشار القانوني', 'Legal Advisor', 'استشارات في المجال البيئي', '/Our%20services/legal-advisor.html', 'leaf', 7),
    ('عقد التأمين',           'Insurance Contract',  'دعم للباحثين والمستكشفين',          '/Our%20services/insurance-contract.html',  'search',    8)
) AS t(name_ar, name_en, desc_ar, url, icon, sort), parent_services;

-- 6. الفروع الجهوية (dropdown -- all 12 regions, same order as website)
WITH parent_branches AS (
  INSERT INTO public.navigation_items (title_ar, title_en, url, type, sort_order, is_visible)
  VALUES ('الفروع الجهوية', 'Regional Branches', 'branch.html', 'link', 6, true)
  RETURNING id
)
INSERT INTO public.navigation_items (parent_id, title_ar, title_en, description_ar, url, icon, type, sort_order, is_visible)
SELECT id, name_ar, name_en, desc_ar, url, icon, 'link', sort, true
FROM (
  VALUES
    ('جهة طنجة - تطوان - الحسيمة', 'Tanger-Tetouan-Al Hoceima', 'الجهة الشمالية للمملكة المغربية', 'branch.html?slug=tanger-tetouan-al-hoceima', 'map', 1),
    ('جهة الشرق', 'Oriental', 'الجهة الشرقية من المتوسط إلى الصحراء', 'branch.html?slug=oriental', 'map', 2),
    ('جهة فاس - مكناس', 'Fes-Meknes', 'الجهة الروحية والعلمية للمغرب', 'branch.html?slug=fes-meknes', 'map', 3),
    ('جهة الرباط - سلا - القنيطرة', 'Rabat-Sale-Kenitra', 'الجهة الإدارية والحكومية', 'branch.html?slug=rabat-sale-kenitra', 'map', 4),
    ('جهة بني ملال - خنيفرة', 'Beni Mellal-Khenifra', 'الجهة الوسطى بين السهول والأطلس', 'branch.html?slug=beni-mellal-khenifra', 'map', 5),
    ('جهة الدار البيضاء - سطات', 'Casablanca-Settat', 'القطب الاقتصادي والتجاري الأول', 'branch.html?slug=casablanca-settat', 'map', 6),
    ('جهة مراكش - آسفي', 'Marrakech-Safi', 'الجهة السياحية الأولى للمغرب', 'branch.html?slug=marrakech-safi', 'map', 7),
    ('جهة درعة - تافيلالت', 'Draa-Tafilalet', 'مهد الدولة العلوية ومنبع التمور', 'branch.html?slug=draa-tafilalet', 'map', 8),
    ('جهة سوس - ماسة', 'Souss-Massa', 'قطب فلاحي وسياحي جنوبي غربي', 'branch.html?slug=souss-massa', 'map', 9),
    ('جهة كلميم - واد نون', 'Guelmim-Oued Noun', 'بوابة الصحراء المغربية', 'branch.html?slug=guelmim-oued-noun', 'map', 10),
    ('جهة العيون - الساقية الحمراء', 'Laayoune-Sakia El Hamra', 'كبرى جهات الجنوب المغربي', 'branch.html?slug=laayoune-sakia-el-hamra', 'map', 11),
    ('جهة الداخلة - وادي الذهب', 'Dakhla-Oued Eddahab', 'جنة الرياضات المائية والصيد البحري', 'branch.html?slug=dakhla-oued-eddahab', 'map', 12)
) AS t(name_ar, name_en, desc_ar, url, icon, sort), parent_branches;

-- 7. انخرط معنا (dropdown -- 9 children)
WITH parent_join AS (
  INSERT INTO public.navigation_items (title_ar, title_en, url, type, sort_order, is_visible)
  VALUES ('انخرط معنا', 'Join Us', '/Join%20us/index.html', 'link', 7, true)
  RETURNING id
)
INSERT INTO public.navigation_items (parent_id, title_ar, title_en, description_ar, url, icon, type, sort_order, is_visible)
SELECT id, name_ar, name_en, desc_ar, url, icon, 'link', sort, true
FROM (
  VALUES
    ('الانخراط online', 'Join Online', 'كن عضوا في الجمعية', '/Join%20us/join-us-online.html', 'userPlus', 1),
    ('تجديد الانخراط', 'Membership Renewal', 'تعبئة طلب تجديد الانخراط', '/Join%20us/membership-renewal.html', 'calendar', 2),
    ('وثائق الانخراط', 'Membership Documents', 'حمل وثائق الانخراط', '/Join%20us/documents.html', 'file', 3),
    ('القانون الأساسي', 'Bylaws', 'النظام الأساسي للجمعية', '/Join%20us/bylaws.html', 'book', 4),
    ('القانون الداخلي', 'Internal Regulations', 'القانون الداخلي للجمعية', '/Join%20us/internal-regulations.html', 'book', 5),
    ('وثائق مقر الجمعية', 'Association Charter', 'ميثاق المستكشف المسؤول', '/Join%20us/charter.html', 'compass', 6),
    ('وصل الايداع النهائي', 'Final Deposit Receipt', 'إيداع الملفات الخارجية', '/Join%20us/external-deposit-receipt.html', 'folder', 7),
    ('وصل الايداع المؤقت', 'Temporary Deposit Receipt', 'إيداع الملفات الداخلية', '/Join%20us/deposit-receipt.html', 'folder', 8),
    ('الإشعار بالخرجات', 'Activity Notifications', 'الإشعارات الخاصة بالخرجات', '/Join%20us/activity-notifications.html', 'bell', 9)
) AS t(name_ar, name_en, desc_ar, url, icon, sort), parent_join;

-- 8. الأخبار (simple)
INSERT INTO public.navigation_items (title_ar, title_en, url, type, sort_order, is_visible)
VALUES ('الأخبار', 'News', 'News/news.html', 'link', 8, true);

-- 9. الأرشيف (simple)
INSERT INTO public.navigation_items (title_ar, title_en, url, type, sort_order, is_visible)
VALUES ('الأرشيف', 'Archive', 'Archive/archive.html', 'link', 9, true);

-- 10. اتصل بنا (simple)
INSERT INTO public.navigation_items (title_ar, title_en, url, type, sort_order, is_visible)
VALUES ('اتصل بنا', 'Contact Us', 'contact.html', 'link', 10, true);
