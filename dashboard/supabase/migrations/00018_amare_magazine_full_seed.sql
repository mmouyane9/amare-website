-- ============================================================================
-- AMARE MAGAZINE (خدماتنا) — Full CMS seed
-- Page slug '/amare-magazine' — the public page at /Our services/amare-magazine.html
-- resolves this slug via supabase/amare-magazine-content.js (dedicated loader).
-- NON-DESTRUCTIVE: UPDATE existing + INSERT missing. Safe to re-run.
-- Content extracted verbatim from /Our services/amare-magazine.html (real content).
-- The page has NO content images (SVG placeholders only) — so 7 editable image
-- fields are seeded EMPTY ('') and the loader keeps the placeholder when empty.
-- ONLY touches this page.
-- ============================================================================

DO $$
DECLARE
  v_pid UUID;
BEGIN
  SELECT id INTO v_pid FROM pages WHERE slug = '/amare-magazine' LIMIT 1;
  IF v_pid IS NULL THEN
    INSERT INTO pages (title, slug, status) VALUES ('مجلة AMARE', '/amare-magazine', 'published') RETURNING id INTO v_pid;
  END IF;
  RAISE NOTICE 'page_id: %', v_pid;

  -- 1. HERO  (#magHero)
  UPDATE page_sections SET section_type = 'hero',
    content = '{"heading":"مجلة AMARE","subheading":"","description":"مجلة رقمية تنشر آخر المقالات والأخبار والدراسات والقصص المرتبطة بالبحث والاستكشاف وأنشطة الجمعية.","backgroundImage":"","buttons":[{"id":"btn-mag-hero-latest","label":"اقرأ أحدث المقالات","url":"#magLatest","variant":"primary"},{"id":"btn-mag-hero-browse","label":"تصفح المجلة","url":"#magCats","variant":"secondary"}]}'::jsonb,
    settings='{}'::jsonb, styles='{}'::jsonb
    WHERE page_id = v_pid AND sort_order = 1;
  IF NOT FOUND THEN INSERT INTO page_sections (id, page_id, section_type, visible, sort_order, content, settings, styles) VALUES (gen_random_uuid(), v_pid, 'hero', TRUE, 1, '{"heading":"مجلة AMARE","subheading":"","description":"مجلة رقمية تنشر آخر المقالات والأخبار والدراسات والقصص المرتبطة بالبحث والاستكشاف وأنشطة الجمعية.","backgroundImage":"","buttons":[{"id":"btn-mag-hero-latest","label":"اقرأ أحدث المقالات","url":"#magLatest","variant":"primary"},{"id":"btn-mag-hero-browse","label":"تصفح المجلة","url":"#magCats","variant":"secondary"}]}'::jsonb, '{}'::jsonb, '{}'::jsonb); END IF;

  -- 2. FEATURED ARTICLE  (#magFeatured)
  UPDATE page_sections SET section_type = 'custom',
    content = '{"_renderer":"magFeatured","badge":"دراسات","heading":"اكتشاف مواقع أثرية جديدة في الجنوب الشرقي للمغرب","excerpt":"في إطار الأنشطة الميدانية للجمعية، تمكن فريق من المستكشفين من توثيق مجموعة من المواقع الأثرية غير المكتشفة سابقاً في منطقة الجنوب الشرقي، مما يفتح آفاقاً جديدة للبحث العلمي.","date":"15 يونيو 2026","readTime":"8 دقائق قراءة","image":"","linkUrl":"#","linkLabel":"اقرأ المزيد"}'::jsonb,
    settings='{}'::jsonb, styles='{}'::jsonb
    WHERE page_id = v_pid AND sort_order = 2;
  IF NOT FOUND THEN INSERT INTO page_sections (id, page_id, section_type, visible, sort_order, content, settings, styles) VALUES (gen_random_uuid(), v_pid, 'custom', TRUE, 2, '{"_renderer":"magFeatured","badge":"دراسات","heading":"اكتشاف مواقع أثرية جديدة في الجنوب الشرقي للمغرب","excerpt":"في إطار الأنشطة الميدانية للجمعية، تمكن فريق من المستكشفين من توثيق مجموعة من المواقع الأثرية غير المكتشفة سابقاً في منطقة الجنوب الشرقي، مما يفتح آفاقاً جديدة للبحث العلمي.","date":"15 يونيو 2026","readTime":"8 دقائق قراءة","image":"","linkUrl":"#","linkLabel":"اقرأ المزيد"}'::jsonb, '{}'::jsonb, '{}'::jsonb); END IF;

  -- 3. LATEST ARTICLES  (#magLatest)
  UPDATE page_sections SET section_type = 'custom',
    content = '{"_renderer":"magLatest","eyebrow":"أحدث المقالات","heading":"آخر ما نشر في المجلة","description":"تصفح أحدث المقالات والدراسات والتقارير التي ينشرها فريق المجلة.","articles":[{"image":"","badge":"التراث","title":"الحفاظ على التراث المادي في القرى الجبلية المغربية","excerpt":"دراسة ميدانية حول أهمية الحفاظ على التراث المعماري التقليدي في القرى الجبلية بالمغرب ودور المجتمع المحلي في ذلك.","date":"10 يوليو 2026","readTime":"6 دقائق","linkUrl":"#"},{"image":"","badge":"البيئة","title":"تأثير التغيرات المناخية على النظم البيئية في الأطلس الكبير","excerpt":"تقرير شامل حول تأثير التغيرات المناخية على التنوع البيولوجي والغطاء النباتي في سلسلة جبال الأطلس الكبير.","date":"5 يوليو 2026","readTime":"7 دقائق","linkUrl":"#"},{"image":"","badge":"الاستكشاف","title":"رحلة استكشافية إلى مغارة فريواطو: اكتشافات جديدة تحت الأرض","excerpt":"فريق من مستكشفي الجمعية يخوض مغامرة استكشافية داخل واحدة من أكبر المغارات في شمال المغرب ويكتشف ممرات جديدة.","date":"28 يونيو 2026","readTime":"5 دقائق","linkUrl":"#"},{"image":"","badge":"الأنشطة","title":"تغطية خاصة: المسابقة الوطنية للبحث والاستكشاف 2026","excerpt":"تغطية شاملة لفعاليات المسابقة الوطنية للبحث والاستكشاف التي نظمتها الجمعية بمشاركة مئات المستكشفين من جميع الجهات.","date":"20 يونيو 2026","readTime":"10 دقائق","linkUrl":"#"},{"image":"","badge":"التقارير","title":"حصيلة أنشطة الجمعية للنصف الأول من سنة 2026","excerpt":"تقرير إحصائي مفصل يلخص أبرز أنشطة وإنجازات الجمعية المغربية لهواة البحث والاستكشاف خلال النصف الأول من العام.","date":"12 يونيو 2026","readTime":"4 دقائق","linkUrl":"#"},{"image":"","badge":"المقالات","title":"دور البحث العلمي في حماية المواقع الأثرية بالمغرب","excerpt":"مقال تحليلي يناقش أهمية البحث العلمي والتوثيق الأثري في حماية المواقع التاريخية من الاندثار والنهب.","date":"1 يونيو 2026","readTime":"6 دقائق","linkUrl":"#"}]}'::jsonb,
    settings='{}'::jsonb, styles='{}'::jsonb
    WHERE page_id = v_pid AND sort_order = 3;
  IF NOT FOUND THEN INSERT INTO page_sections (id, page_id, section_type, visible, sort_order, content, settings, styles) VALUES (gen_random_uuid(), v_pid, 'custom', TRUE, 3, '{"_renderer":"magLatest","eyebrow":"أحدث المقالات","heading":"آخر ما نشر في المجلة","description":"تصفح أحدث المقالات والدراسات والتقارير التي ينشرها فريق المجلة.","articles":[{"image":"","badge":"التراث","title":"الحفاظ على التراث المادي في القرى الجبلية المغربية","excerpt":"دراسة ميدانية حول أهمية الحفاظ على التراث المعماري التقليدي في القرى الجبلية بالمغرب ودور المجتمع المحلي في ذلك.","date":"10 يوليو 2026","readTime":"6 دقائق","linkUrl":"#"},{"image":"","badge":"البيئة","title":"تأثير التغيرات المناخية على النظم البيئية في الأطلس الكبير","excerpt":"تقرير شامل حول تأثير التغيرات المناخية على التنوع البيولوجي والغطاء النباتي في سلسلة جبال الأطلس الكبير.","date":"5 يوليو 2026","readTime":"7 دقائق","linkUrl":"#"},{"image":"","badge":"الاستكشاف","title":"رحلة استكشافية إلى مغارة فريواطو: اكتشافات جديدة تحت الأرض","excerpt":"فريق من مستكشفي الجمعية يخوض مغامرة استكشافية داخل واحدة من أكبر المغارات في شمال المغرب ويكتشف ممرات جديدة.","date":"28 يونيو 2026","readTime":"5 دقائق","linkUrl":"#"},{"image":"","badge":"الأنشطة","title":"تغطية خاصة: المسابقة الوطنية للبحث والاستكشاف 2026","excerpt":"تغطية شاملة لفعاليات المسابقة الوطنية للبحث والاستكشاف التي نظمتها الجمعية بمشاركة مئات المستكشفين من جميع الجهات.","date":"20 يونيو 2026","readTime":"10 دقائق","linkUrl":"#"},{"image":"","badge":"التقارير","title":"حصيلة أنشطة الجمعية للنصف الأول من سنة 2026","excerpt":"تقرير إحصائي مفصل يلخص أبرز أنشطة وإنجازات الجمعية المغربية لهواة البحث والاستكشاف خلال النصف الأول من العام.","date":"12 يونيو 2026","readTime":"4 دقائق","linkUrl":"#"},{"image":"","badge":"المقالات","title":"دور البحث العلمي في حماية المواقع الأثرية بالمغرب","excerpt":"مقال تحليلي يناقش أهمية البحث العلمي والتوثيق الأثري في حماية المواقع التاريخية من الاندثار والنهب.","date":"1 يونيو 2026","readTime":"6 دقائق","linkUrl":"#"}]}'::jsonb, '{}'::jsonb, '{}'::jsonb); END IF;

  -- 4. CATEGORIES  (#magCats)
  UPDATE page_sections SET section_type = 'custom',
    content = '{"_renderer":"magCats","eyebrow":"تصفح حسب التصنيف","heading":"فئات المجلة","description":"استكشف محتوى المجلة حسب الفئة التي تهمك.","categories":[{"title":"الأخبار","count":"12 مقالاً"},{"title":"المقالات","count":"18 مقالاً"},{"title":"الدراسات","count":"9 مقالات"},{"title":"التقارير","count":"7 مقالات"},{"title":"الأنشطة","count":"15 مقالاً"},{"title":"البيئة","count":"10 مقالات"},{"title":"التراث","count":"14 مقالاً"},{"title":"الاستكشاف","count":"16 مقالاً"}]}'::jsonb,
    settings='{}'::jsonb, styles='{}'::jsonb
    WHERE page_id = v_pid AND sort_order = 4;
  IF NOT FOUND THEN INSERT INTO page_sections (id, page_id, section_type, visible, sort_order, content, settings, styles) VALUES (gen_random_uuid(), v_pid, 'custom', TRUE, 4, '{"_renderer":"magCats","eyebrow":"تصفح حسب التصنيف","heading":"فئات المجلة","description":"استكشف محتوى المجلة حسب الفئة التي تهمك.","categories":[{"title":"الأخبار","count":"12 مقالاً"},{"title":"المقالات","count":"18 مقالاً"},{"title":"الدراسات","count":"9 مقالات"},{"title":"التقارير","count":"7 مقالات"},{"title":"الأنشطة","count":"15 مقالاً"},{"title":"البيئة","count":"10 مقالات"},{"title":"التراث","count":"14 مقالاً"},{"title":"الاستكشاف","count":"16 مقالاً"}]}'::jsonb, '{}'::jsonb, '{}'::jsonb); END IF;

  -- 5. NEWSLETTER  (#magNewsletter)
  UPDATE page_sections SET section_type = 'custom',
    content = '{"_renderer":"magNewsletter","heading":"اشترك في مجلة AMARE","description":"توصل بأحدث المقالات والدراسات والأخبار مباشرة على بريدك الإلكتروني.","buttonLabel":"اشترك الآن"}'::jsonb,
    settings='{}'::jsonb, styles='{}'::jsonb
    WHERE page_id = v_pid AND sort_order = 5;
  IF NOT FOUND THEN INSERT INTO page_sections (id, page_id, section_type, visible, sort_order, content, settings, styles) VALUES (gen_random_uuid(), v_pid, 'custom', TRUE, 5, '{"_renderer":"magNewsletter","heading":"اشترك في مجلة AMARE","description":"توصل بأحدث المقالات والدراسات والأخبار مباشرة على بريدك الإلكتروني.","buttonLabel":"اشترك الآن"}'::jsonb, '{}'::jsonb, '{}'::jsonb); END IF;

  -- 6. FINAL CTA  (#magCta)
  UPDATE page_sections SET section_type = 'custom',
    content = '{"_renderer":"magCta","heading":"اكتشف المزيد من المقالات والمواضيع المميزة.","buttons":[{"id":"btn-mag-cta-all","label":"جميع المقالات","url":"#magLatest","variant":"primary"},{"id":"btn-mag-cta-contact","label":"تواصل معنا","url":"../contact.html","variant":"secondary"}]}'::jsonb,
    settings='{}'::jsonb, styles='{}'::jsonb
    WHERE page_id = v_pid AND sort_order = 6;
  IF NOT FOUND THEN INSERT INTO page_sections (id, page_id, section_type, visible, sort_order, content, settings, styles) VALUES (gen_random_uuid(), v_pid, 'custom', TRUE, 6, '{"_renderer":"magCta","heading":"اكتشف المزيد من المقالات والمواضيع المميزة.","buttons":[{"id":"btn-mag-cta-all","label":"جميع المقالات","url":"#magLatest","variant":"primary"},{"id":"btn-mag-cta-contact","label":"تواصل معنا","url":"../contact.html","variant":"secondary"}]}'::jsonb, '{}'::jsonb, '{}'::jsonb); END IF;

  RAISE NOTICE 'AMARE MAGAZINE: % sections', (SELECT COUNT(*) FROM page_sections WHERE page_id = v_pid);
END $$;
