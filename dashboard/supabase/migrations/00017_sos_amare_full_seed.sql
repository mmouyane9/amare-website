-- ============================================================================
-- SOS AMARE (خدماتنا) — Full CMS seed
-- Page slug '/services/sos-amare' — the public page at /Our services/sos-amare.html
-- resolves this slug via supabase/sos-amare-content.js (dedicated loader).
-- NON-DESTRUCTIVE: UPDATE existing + INSERT missing. Safe to re-run.
-- Content extracted verbatim from /Our services/sos-amare.html (real content).
-- The page has NO content images (SVG icons only) — so no image fields.
-- ONLY touches this page.
-- ============================================================================

DO $$
DECLARE
  v_pid UUID;
BEGIN
  SELECT id INTO v_pid FROM pages WHERE slug = '/services/sos-amare' LIMIT 1;
  IF v_pid IS NULL THEN
    INSERT INTO pages (title, slug, status) VALUES ('SOS AMARE', '/services/sos-amare', 'published') RETURNING id INTO v_pid;
  END IF;
  RAISE NOTICE 'page_id: %', v_pid;

  -- 1. HERO
  UPDATE page_sections SET section_type = 'hero',
    content = '{"heading":"SOS AMARE","subheading":"خدمة المساعدة المجتمعية","description":"نساعدك في العثور على أغراضك المفقودة بسرعة وبمساعدة المجتمع.","backgroundImage":"","buttons":[{"id":"btn-sos-hero-report","label":"الإبلاغ عن غرض مفقود","url":"#sosForm","variant":"primary"}]}'::jsonb,
    settings='{}'::jsonb, styles='{}'::jsonb
    WHERE page_id = v_pid AND sort_order = 1;
  IF NOT FOUND THEN INSERT INTO page_sections (id, page_id, section_type, visible, sort_order, content, settings, styles) VALUES (gen_random_uuid(), v_pid, 'hero', TRUE, 1, '{"heading":"SOS AMARE","subheading":"خدمة المساعدة المجتمعية","description":"نساعدك في العثور على أغراضك المفقودة بسرعة وبمساعدة المجتمع.","backgroundImage":"","buttons":[{"id":"btn-sos-hero-report","label":"الإبلاغ عن غرض مفقود","url":"#sosForm","variant":"primary"}]}'::jsonb, '{}'::jsonb, '{}'::jsonb); END IF;

  -- 2. HOW IT WORKS
  UPDATE page_sections SET section_type = 'custom',
    content = '{"_renderer":"sosHow","eyebrow":"كيف تعمل الخدمة","heading":"خطوات بسيطة لاستعادة أغراضك","description":"نعمل معًا كمجتمع لمساعدتك في العثور على ما فقدته بأسرع وقت ممكن.","steps":[{"title":"الإبلاغ عن الغرض المفقود","description":"قم بملء النموذج بمعلومات دقيقة عن الغرض الذي فقدته."},{"title":"مراجعة البلاغ","description":"يقوم فريقنا بمراجعة وتدقيق المعلومات قبل النشر."},{"title":"نشر البلاغ عبر الجمعية","description":"ننشر البلاغ عبر قنوات الجمعية ليصل إلى أكبر عدد من المجتمع."},{"title":"التواصل مع صاحب الغرض عند العثور عليه","description":"بمجرد العثور على الغرض، نتواصل معك مباشرة لإعادته."}]}'::jsonb,
    settings='{}'::jsonb, styles='{}'::jsonb
    WHERE page_id = v_pid AND sort_order = 2;
  IF NOT FOUND THEN INSERT INTO page_sections (id, page_id, section_type, visible, sort_order, content, settings, styles) VALUES (gen_random_uuid(), v_pid, 'custom', TRUE, 2, '{"_renderer":"sosHow","eyebrow":"كيف تعمل الخدمة","heading":"خطوات بسيطة لاستعادة أغراضك","description":"نعمل معًا كمجتمع لمساعدتك في العثور على ما فقدته بأسرع وقت ممكن.","steps":[{"title":"الإبلاغ عن الغرض المفقود","description":"قم بملء النموذج بمعلومات دقيقة عن الغرض الذي فقدته."},{"title":"مراجعة البلاغ","description":"يقوم فريقنا بمراجعة وتدقيق المعلومات قبل النشر."},{"title":"نشر البلاغ عبر الجمعية","description":"ننشر البلاغ عبر قنوات الجمعية ليصل إلى أكبر عدد من المجتمع."},{"title":"التواصل مع صاحب الغرض عند العثور عليه","description":"بمجرد العثور على الغرض، نتواصل معك مباشرة لإعادته."}]}'::jsonb, '{}'::jsonb, '{}'::jsonb); END IF;

  -- 3. LOST ITEM CATEGORIES
  UPDATE page_sections SET section_type = 'custom',
    content = '{"_renderer":"sosCategories","eyebrow":"فئات الأغراض","heading":"ماذا يمكنك أن تبلغ عنه؟","description":"يمكنك الإبلاغ عن أي غرض مفقود من الفئات التالية أو غيرها.","categories":[{"title":"البطاقات الوطنية"},{"title":"جواز السفر"},{"title":"رخصة السياقة"},{"title":"المحافظ"},{"title":"الهواتف"},{"title":"المفاتيح"},{"title":"الوثائق"},{"title":"أغراض أخرى"}]}'::jsonb,
    settings='{}'::jsonb, styles='{}'::jsonb
    WHERE page_id = v_pid AND sort_order = 3;
  IF NOT FOUND THEN INSERT INTO page_sections (id, page_id, section_type, visible, sort_order, content, settings, styles) VALUES (gen_random_uuid(), v_pid, 'custom', TRUE, 3, '{"_renderer":"sosCategories","eyebrow":"فئات الأغراض","heading":"ماذا يمكنك أن تبلغ عنه؟","description":"يمكنك الإبلاغ عن أي غرض مفقود من الفئات التالية أو غيرها.","categories":[{"title":"البطاقات الوطنية"},{"title":"جواز السفر"},{"title":"رخصة السياقة"},{"title":"المحافظ"},{"title":"الهواتف"},{"title":"المفاتيح"},{"title":"الوثائق"},{"title":"أغراض أخرى"}]}'::jsonb, '{}'::jsonb, '{}'::jsonb); END IF;

  -- 4. REPORT FORM (heading block; the interactive form stays hardcoded in HTML)
  UPDATE page_sections SET section_type = 'custom',
    content = '{"_renderer":"sosForm","eyebrow":"نموذج التبليغ","heading":"أبلغ عن غرض مفقود","description":"املأ النموذج أدناه وسنتواصل معك في أقرب وقت."}'::jsonb,
    settings='{}'::jsonb, styles='{}'::jsonb
    WHERE page_id = v_pid AND sort_order = 4;
  IF NOT FOUND THEN INSERT INTO page_sections (id, page_id, section_type, visible, sort_order, content, settings, styles) VALUES (gen_random_uuid(), v_pid, 'custom', TRUE, 4, '{"_renderer":"sosForm","eyebrow":"نموذج التبليغ","heading":"أبلغ عن غرض مفقود","description":"املأ النموذج أدناه وسنتواصل معك في أقرب وقت."}'::jsonb, '{}'::jsonb, '{}'::jsonb); END IF;

  -- 5. GREEN NUMBER
  UPDATE page_sections SET section_type = 'custom',
    content = '{"_renderer":"sosGreen","heading":"الرقم الأخضر","description":"إذا كنت بحاجة إلى مساعدة عاجلة أو عثرت على غرض مفقود، يمكنك التواصل معنا مباشرة.","number":"0800 00 00 00","hours":"ساعات العمل: من الإثنين إلى السبت | 9:00 - 18:00","buttons":[{"id":"btn-sos-green-call","label":"اتصل الآن","url":"tel:0800000000","variant":"primary"},{"id":"btn-sos-green-wa","label":"واتساب","url":"http://wa.me/+212684869996","variant":"secondary"}]}'::jsonb,
    settings='{}'::jsonb, styles='{}'::jsonb
    WHERE page_id = v_pid AND sort_order = 5;
  IF NOT FOUND THEN INSERT INTO page_sections (id, page_id, section_type, visible, sort_order, content, settings, styles) VALUES (gen_random_uuid(), v_pid, 'custom', TRUE, 5, '{"_renderer":"sosGreen","heading":"الرقم الأخضر","description":"إذا كنت بحاجة إلى مساعدة عاجلة أو عثرت على غرض مفقود، يمكنك التواصل معنا مباشرة.","number":"0800 00 00 00","hours":"ساعات العمل: من الإثنين إلى السبت | 9:00 - 18:00","buttons":[{"id":"btn-sos-green-call","label":"اتصل الآن","url":"tel:0800000000","variant":"primary"},{"id":"btn-sos-green-wa","label":"واتساب","url":"http://wa.me/+212684869996","variant":"secondary"}]}'::jsonb, '{}'::jsonb, '{}'::jsonb); END IF;

  -- 6. FAQ
  UPDATE page_sections SET section_type = 'custom',
    content = '{"_renderer":"sosFaq","eyebrow":"الأسئلة الشائعة","heading":"كل ما تحتاج معرفته","description":"إجابات على أكثر الأسئلة شيوعاً حول خدمة SOS AMARE.","items":[{"question":"كيف أبلغ عن غرض مفقود؟","answer":"يمكنك الإبلاغ عن غرضك المفقود من خلال ملء النموذج أعلاه في هذه الصفحة. كل ما عليك هو إدخال معلوماتك الشخصية ووصف دقيق للغرض المفقود ومكان وزمان فقدانه. بعد ذلك سيقوم فريقنا بمراجعة البلاغ ونشره."},{"question":"كم يستغرق نشر البلاغ؟","answer":"نقوم بمراجعة البلاغات خلال 24 ساعة من استلامها. بعد التأكد من صحة المعلومات، يتم نشر البلاغ فوراً عبر قنوات الجمعية الرسمية ليصل إلى أكبر عدد ممكن من المجتمع."},{"question":"هل الخدمة مجانية؟","answer":"نعم، خدمة SOS AMARE مجانية بالكامل. هي جزء من الخدمات المجتمعية التي تقدمها الجمعية المغربية لهواة البحث والاستكشاف لمساعدة المجتمع دون أي مقابل مادي."},{"question":"ماذا أفعل إذا عثرت على غرض مفقود؟","answer":"إذا عثرت على غرض مفقود، يمكنك التواصل معنا مباشرة عبر الرقم الأخضر أو واتساب. سنقوم بمطابقة الغرض مع البلاغات الموجودة لدينا والتواصل مع صاحبه. كما يمكنك تسليمه لأقرب فرع من فروع الجمعية."}]}'::jsonb,
    settings='{}'::jsonb, styles='{}'::jsonb
    WHERE page_id = v_pid AND sort_order = 6;
  IF NOT FOUND THEN INSERT INTO page_sections (id, page_id, section_type, visible, sort_order, content, settings, styles) VALUES (gen_random_uuid(), v_pid, 'custom', TRUE, 6, '{"_renderer":"sosFaq","eyebrow":"الأسئلة الشائعة","heading":"كل ما تحتاج معرفته","description":"إجابات على أكثر الأسئلة شيوعاً حول خدمة SOS AMARE.","items":[{"question":"كيف أبلغ عن غرض مفقود؟","answer":"يمكنك الإبلاغ عن غرضك المفقود من خلال ملء النموذج أعلاه في هذه الصفحة. كل ما عليك هو إدخال معلوماتك الشخصية ووصف دقيق للغرض المفقود ومكان وزمان فقدانه. بعد ذلك سيقوم فريقنا بمراجعة البلاغ ونشره."},{"question":"كم يستغرق نشر البلاغ؟","answer":"نقوم بمراجعة البلاغات خلال 24 ساعة من استلامها. بعد التأكد من صحة المعلومات، يتم نشر البلاغ فوراً عبر قنوات الجمعية الرسمية ليصل إلى أكبر عدد ممكن من المجتمع."},{"question":"هل الخدمة مجانية؟","answer":"نعم، خدمة SOS AMARE مجانية بالكامل. هي جزء من الخدمات المجتمعية التي تقدمها الجمعية المغربية لهواة البحث والاستكشاف لمساعدة المجتمع دون أي مقابل مادي."},{"question":"ماذا أفعل إذا عثرت على غرض مفقود؟","answer":"إذا عثرت على غرض مفقود، يمكنك التواصل معنا مباشرة عبر الرقم الأخضر أو واتساب. سنقوم بمطابقة الغرض مع البلاغات الموجودة لدينا والتواصل مع صاحبه. كما يمكنك تسليمه لأقرب فرع من فروع الجمعية."}]}'::jsonb, '{}'::jsonb, '{}'::jsonb); END IF;

  -- 7. FINAL CTA
  UPDATE page_sections SET section_type = 'custom',
    content = '{"_renderer":"sosCta","heading":"ساعدنا في إعادة المفقودات إلى أصحابها.","description":"","buttons":[{"id":"btn-sos-cta-report","label":"الإبلاغ عن غرض مفقود","url":"#sosForm","variant":"primary"},{"id":"btn-sos-cta-contact","label":"الاتصال بنا","url":"../contact.html","variant":"secondary"}]}'::jsonb,
    settings='{}'::jsonb, styles='{}'::jsonb
    WHERE page_id = v_pid AND sort_order = 7;
  IF NOT FOUND THEN INSERT INTO page_sections (id, page_id, section_type, visible, sort_order, content, settings, styles) VALUES (gen_random_uuid(), v_pid, 'custom', TRUE, 7, '{"_renderer":"sosCta","heading":"ساعدنا في إعادة المفقودات إلى أصحابها.","description":"","buttons":[{"id":"btn-sos-cta-report","label":"الإبلاغ عن غرض مفقود","url":"#sosForm","variant":"primary"},{"id":"btn-sos-cta-contact","label":"الاتصال بنا","url":"../contact.html","variant":"secondary"}]}'::jsonb, '{}'::jsonb, '{}'::jsonb); END IF;

  RAISE NOTICE 'SOS AMARE: % sections', (SELECT COUNT(*) FROM page_sections WHERE page_id = v_pid);
END $$;
