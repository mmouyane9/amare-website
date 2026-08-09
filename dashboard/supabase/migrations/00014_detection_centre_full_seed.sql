-- ============================================================================
-- AssociationDetectionCentre (الشريك) — Full 8-section CMS seed
-- Page exists: slug '/partners/detection-centre', id 0b9b7663-e8d5-4888-afd4-3b4b3083f6d3
-- REMOVE + RESEED: the previous 4 sections were an older, incomplete format.
-- ONLY touches this page. Other partners are untouched.
-- Idempotent: re-running deletes this page's sections and re-inserts the same 8.
-- ============================================================================

DO $$
DECLARE
  v_pid UUID;
BEGIN
  SELECT id INTO v_pid FROM pages WHERE slug = '/partners/detection-centre' LIMIT 1;
  IF v_pid IS NULL THEN
    INSERT INTO pages (title, slug, status) VALUES ('AssociationDetectionCentre', '/partners/detection-centre', 'published') RETURNING id INTO v_pid;
  END IF;
  RAISE NOTICE 'page_id: %', v_pid;

  -- Remove any pre-existing (old-format) sections for this page only.
  DELETE FROM page_sections WHERE page_id = v_pid;
  RAISE NOTICE 'Removed old sections: %', (SELECT COUNT(*) FROM page_sections WHERE page_id = v_pid);

  -- 1. HERO
  INSERT INTO page_sections (id, page_id, section_type, visible, sort_order, content, settings, styles)
  VALUES (gen_random_uuid(), v_pid, 'hero', TRUE, 1, '{"heading":"AssociationDetectionCentre","subheading":"شريك استراتيجي","description":"شريك استراتيجي للجمعية المغربية لهواة البحث والاستكشاف، مركز متخصص في الكشف والتنقيب والتدريب على استخدام أجهزة الاستكشاف.","backgroundImage":"","buttons":[{"id":"btn-pr-website","label":"زيارة الموقع الإلكتروني","url":"https://www.detection-centre.ma","variant":"primary"},{"id":"btn-pr-contact","label":"تواصل مع الشريك","url":"#prForm","variant":"secondary"}]}'::jsonb, '{}'::jsonb, '{}'::jsonb);

  -- 2. ABOUT
  INSERT INTO page_sections (id, page_id, section_type, visible, sort_order, content, settings, styles)
  VALUES (gen_random_uuid(), v_pid, 'custom', TRUE, 2, '{"_renderer":"partnerAbout","eyebrow":"عن AssociationDetectionCentre","heading":"شريككم الموثوق في مجال التنقيب والاستكشاف","image":"","paragraphs":["AssociationDetectionCentre هو مركز متخصص في الكشف والتنقيب والتدريب على استخدام أحدث أجهزة الاستكشاف. يقدم المركز دورات تكوينية وورشات عملية لتطوير مهارات المنقبين والمستكشفين.","نعمل مع الجمعية المغربية لهواة البحث والاستكشاف في إطار شراكة استراتيجية تهدف إلى توفير التكوين والتدريب المتخصص لأعضاء الجمعية في مجال استخدام أجهزة الكشف والتنقيب."]}'::jsonb, '{}'::jsonb, '{}'::jsonb);

  -- 3. SERVICES
  INSERT INTO page_sections (id, page_id, section_type, visible, sort_order, content, settings, styles)
  VALUES (gen_random_uuid(), v_pid, 'custom', TRUE, 3, '{"_renderer":"partnerServices","eyebrow":"خدماتنا","heading":"ماذا نقدم؟","description":"نقدم مجموعة متكاملة من الخدمات المتخصصة في مجال التنقيب والاستكشاف.","cards":[{"title":"التنقيب المعدني","description":"دراسات جيولوجية متقدمة للتنقيب عن المعادن والثروات الطبيعية في مختلف مناطق المغرب."},{"title":"الدراسات الجيولوجية","description":"تحليل وتوثيق التكوينات الجيولوجية وتقديم استشارات متخصصة للمشاريع الاستكشافية."},{"title":"رسم الخرائط","description":"تصميم وإنتاج خرائط جيولوجية وطبوغرافية دقيقة باستخدام أحدث التقنيات الرقمية."},{"title":"التحاليل المخبرية","description":"تحاليل متطورة للعينات المعدنية والصخرية باستخدام أحدث الأجهزة والتقنيات المخبرية."}]}'::jsonb, '{}'::jsonb, '{}'::jsonb);

  -- 4. WHY PARTNER
  INSERT INTO page_sections (id, page_id, section_type, visible, sort_order, content, settings, styles)
  VALUES (gen_random_uuid(), v_pid, 'custom', TRUE, 4, '{"_renderer":"partnerWhy","eyebrow":"لماذا الشراكة معنا؟","heading":"مميزات شراكتنا","description":"نعمل جنبًا إلى جنب مع شركائنا لتحقيق النجاح المشترك.","cards":[{"title":"خبرة مهنية","description":"نمتلك خبرة تمتد لسنوات في مجال التنقيب والاستكشاف المعدني بالمغرب."},{"title":"شريك موثوق","description":"نلتزم بأعلى معايير الجودة والمهنية في جميع مشاريعنا وخدماتنا."},{"title":"خدمات عالية الجودة","description":"نقدم خدمات متكاملة تلبي احتياجات شركائنا بأعلى مستوى من الدقة والكفاءة."},{"title":"تعاون وطني ودولي","description":"نعمل في إطار تعاون وطني ودولي لتعزيز البحث والاستكشاف المعدني."}]}'::jsonb, '{}'::jsonb, '{}'::jsonb);

  -- 5. GALLERY
  INSERT INTO page_sections (id, page_id, section_type, visible, sort_order, content, settings, styles)
  VALUES (gen_random_uuid(), v_pid, 'custom', TRUE, 5, '{"_renderer":"partnerGallery","eyebrow":"معرض الصور","heading":"صور من أعمالنا","description":"جانب من أنشطتنا ومشاريعنا المشتركة.","images":[{"id":"gimg-0","url":"","alt":""},{"id":"gimg-1","url":"","alt":""},{"id":"gimg-2","url":"","alt":""},{"id":"gimg-3","url":"","alt":""},{"id":"gimg-4","url":"","alt":""},{"id":"gimg-5","url":"","alt":""}]}'::jsonb, '{}'::jsonb, '{}'::jsonb);

  -- 6. CONTACT
  INSERT INTO page_sections (id, page_id, section_type, visible, sort_order, content, settings, styles)
  VALUES (gen_random_uuid(), v_pid, 'custom', TRUE, 6, '{"_renderer":"partnerContact","heading":"تواصل معنا","description":"نحن هنا للإجابة على استفساراتكم.","email":"contact@detection-centre.ma","phone":"+212 539 000 000","website":"www.detection-centre.ma","address":"شارع فلسطين، طنجة، المغرب"}'::jsonb, '{}'::jsonb, '{}'::jsonb);

  -- 7. CONTACT FORM
  INSERT INTO page_sections (id, page_id, section_type, visible, sort_order, content, settings, styles)
  VALUES (gen_random_uuid(), v_pid, 'custom', TRUE, 7, '{"_renderer":"partnerForm","heading":"تواصل مع AssociationDetectionCentre","description":"أرسل لنا استفسارك وسنرد عليك في أقرب وقت."}'::jsonb, '{}'::jsonb, '{}'::jsonb);

  -- 8. CTA
  INSERT INTO page_sections (id, page_id, section_type, visible, sort_order, content, settings, styles)
  VALUES (gen_random_uuid(), v_pid, 'custom', TRUE, 8, '{"_renderer":"partnerCta","heading":"هل أنت مهتم بالعمل مع هذا الشريك؟","description":"","buttons":[{"id":"btn-pr-cta-0","label":"زيارة الموقع الإلكتروني","url":"https://www.detection-centre.ma","variant":"primary"},{"id":"btn-pr-cta-1","label":"تواصل مع الشريك","url":"#prForm","variant":"secondary"}]}'::jsonb, '{}'::jsonb, '{}'::jsonb);

  RAISE NOTICE 'AssociationDetectionCentre: % sections', (SELECT COUNT(*) FROM page_sections WHERE page_id = v_pid);
END $$;
