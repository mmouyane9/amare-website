-- ============================================================================
-- LeFouilleurma (الشريك) — Full 8-section CMS seed
-- NON-DESTRUCTIVE: UPDATE existing 4 + INSERT missing 4. Safe to re-run.
-- ============================================================================

DO $$
DECLARE
  v_pid UUID;
BEGIN
  SELECT id INTO v_pid FROM pages WHERE slug = '/partners/lefouilleurma' LIMIT 1;
  IF v_pid IS NULL THEN
    INSERT INTO pages (title, slug, status) VALUES ('LeFouilleurma', '/partners/lefouilleurma', 'published') RETURNING id INTO v_pid;
  END IF;
  RAISE NOTICE 'page_id: %', v_pid;

  -- 1. HERO (update existing sort_order=1)
  UPDATE page_sections SET section_type = 'hero',
    content = '{"heading":"LeFouilleurma","subheading":"شريك وطني","description":"شريك وطني للجمعية المغربية لهواة البحث والاستكشاف، متخصص في بيع وشراء أجهزة الكشف عن المعادن والكنوز على المستوى الوطني.","backgroundImage":"","buttons":[{"id":"btn-pr-website","label":"زيارة الموقع الإلكتروني","url":"https://www.lefouilleurma.ma","variant":"primary"},{"id":"btn-pr-contact","label":"تواصل مع الشريك","url":"#prForm","variant":"secondary"}]}'::jsonb,
    settings='{}'::jsonb, styles='{}'::jsonb
    WHERE page_id = v_pid AND sort_order = 1;
  IF NOT FOUND THEN INSERT INTO page_sections (id, page_id, section_type, visible, sort_order, content, settings, styles) VALUES (gen_random_uuid(), v_pid, 'hero', TRUE, 1, '{"heading":"LeFouilleurma","subheading":"شريك وطني","description":"شريك وطني للجمعية المغربية لهواة البحث والاستكشاف، متخصص في بيع وشراء أجهزة الكشف عن المعادن والكنوز على المستوى الوطني.","backgroundImage":"","buttons":[{"id":"btn-pr-website","label":"زيارة الموقع الإلكتروني","url":"https://www.lefouilleurma.ma","variant":"primary"},{"id":"btn-pr-contact","label":"تواصل مع الشريك","url":"#prForm","variant":"secondary"}]}'::jsonb, '{}'::jsonb, '{}'::jsonb); END IF;

  -- 2. ABOUT (update existing sort_order=2)
  UPDATE page_sections SET section_type = 'custom',
    content = '{"_renderer":"partnerAbout","eyebrow":"عن LeFouilleurma","heading":"شريككم الموثوق في مجال التنقيب والاستكشاف","image":"","paragraphs":["LeFouilleurma هي شركة مغربية متخصصة في بيع وشراء أجهزة الكشف عن المعادن والكنوز. تقدم الشركة مجموعة واسعة من الأجهزة المتطورة لتلبية احتياجات الهواة والمحترفين على حد سواء.","نعمل مع الجمعية المغربية لهواة البحث والاستكشاف في إطار شراكة وطنية تهدف إلى توفير أحدث أجهزة الكشف والتنقيب لأعضاء الجمعية بأسعار تفضيلية."]}'::jsonb,
    settings='{}'::jsonb, styles='{}'::jsonb
    WHERE page_id = v_pid AND sort_order = 2;
  IF NOT FOUND THEN INSERT INTO page_sections (id, page_id, section_type, visible, sort_order, content, settings, styles) VALUES (gen_random_uuid(), v_pid, 'custom', TRUE, 2, '{"_renderer":"partnerAbout","eyebrow":"عن LeFouilleurma","heading":"شريككم الموثوق في مجال التنقيب والاستكشاف","image":"","paragraphs":["LeFouilleurma هي شركة مغربية متخصصة في بيع وشراء أجهزة الكشف عن المعادن والكنوز. تقدم الشركة مجموعة واسعة من الأجهزة المتطورة لتلبية احتياجات الهواة والمحترفين على حد سواء.","نعمل مع الجمعية المغربية لهواة البحث والاستكشاف في إطار شراكة وطنية تهدف إلى توفير أحدث أجهزة الكشف والتنقيب لأعضاء الجمعية بأسعار تفضيلية."]}'::jsonb, '{}'::jsonb, '{}'::jsonb); END IF;

  -- 3. SERVICES (update existing sort_order=3 OR insert)
  UPDATE page_sections SET section_type = 'custom',
    content = '{"_renderer":"partnerServices","eyebrow":"خدماتنا","heading":"ماذا نقدم؟","description":"نقدم مجموعة متكاملة من الخدمات المتخصصة في مجال التنقيب والاستكشاف.","cards":[{"title":"التنقيب المعدني","description":"دراسات جيولوجية متقدمة للتنقيب عن المعادن والثروات الطبيعية في مختلف مناطق المغرب."},{"title":"الدراسات الجيولوجية","description":"تحليل وتوثيق التكوينات الجيولوجية وتقديم استشارات متخصصة للمشاريع الاستكشافية."},{"title":"رسم الخرائط","description":"تصميم وإنتاج خرائط جيولوجية وطبوغرافية دقيقة باستخدام أحدث التقنيات الرقمية."},{"title":"التحاليل المخبرية","description":"تحاليل متطورة للعينات المعدنية والصخرية باستخدام أحدث الأجهزة والتقنيات المخبرية."}]}'::jsonb,
    settings='{}'::jsonb, styles='{}'::jsonb
    WHERE page_id = v_pid AND sort_order = 3;
  IF NOT FOUND THEN INSERT INTO page_sections (id, page_id, section_type, visible, sort_order, content, settings, styles) VALUES (gen_random_uuid(), v_pid, 'custom', TRUE, 3, '{"_renderer":"partnerServices","eyebrow":"خدماتنا","heading":"ماذا نقدم؟","description":"نقدم مجموعة متكاملة من الخدمات المتخصصة في مجال التنقيب والاستكشاف.","cards":[{"title":"التنقيب المعدني","description":"دراسات جيولوجية متقدمة للتنقيب عن المعادن والثروات الطبيعية في مختلف مناطق المغرب."},{"title":"الدراسات الجيولوجية","description":"تحليل وتوثيق التكوينات الجيولوجية وتقديم استشارات متخصصة للمشاريع الاستكشافية."},{"title":"رسم الخرائط","description":"تصميم وإنتاج خرائط جيولوجية وطبوغرافية دقيقة باستخدام أحدث التقنيات الرقمية."},{"title":"التحاليل المخبرية","description":"تحاليل متطورة للعينات المعدنية والصخرية باستخدام أحدث الأجهزة والتقنيات المخبرية."}]}'::jsonb, '{}'::jsonb, '{}'::jsonb); END IF;

  -- 4. WHY PARTNER (update existing sort_order=4 OR insert)
  UPDATE page_sections SET section_type = 'custom',
    content = '{"_renderer":"partnerWhy","eyebrow":"لماذا الشراكة معنا؟","heading":"مميزات شراكتنا","description":"نعمل جنبًا إلى جنب مع شركائنا لتحقيق النجاح المشترك.","cards":[{"title":"خبرة مهنية","description":"نمتلك خبرة تمتد لسنوات في مجال التنقيب والاستكشاف المعدني بالمغرب."},{"title":"شريك موثوق","description":"نلتزم بأعلى معايير الجودة والمهنية في جميع مشاريعنا وخدماتنا."},{"title":"خدمات عالية الجودة","description":"نقدم خدمات متكاملة تلبي احتياجات شركائنا بأعلى مستوى من الدقة والكفاءة."},{"title":"تعاون وطني ودولي","description":"نعمل في إطار تعاون وطني ودولي لتعزيز البحث والاستكشاف المعدني."}]}'::jsonb,
    settings='{}'::jsonb, styles='{}'::jsonb
    WHERE page_id = v_pid AND sort_order = 4;
  IF NOT FOUND THEN INSERT INTO page_sections (id, page_id, section_type, visible, sort_order, content, settings, styles) VALUES (gen_random_uuid(), v_pid, 'custom', TRUE, 4, '{"_renderer":"partnerWhy","eyebrow":"لماذا الشراكة معنا؟","heading":"مميزات شراكتنا","description":"نعمل جنبًا إلى جنب مع شركائنا لتحقيق النجاح المشترك.","cards":[{"title":"خبرة مهنية","description":"نمتلك خبرة تمتد لسنوات في مجال التنقيب والاستكشاف المعدني بالمغرب."},{"title":"شريك موثوق","description":"نلتزم بأعلى معايير الجودة والمهنية في جميع مشاريعنا وخدماتنا."},{"title":"خدمات عالية الجودة","description":"نقدم خدمات متكاملة تلبي احتياجات شركائنا بأعلى مستوى من الدقة والكفاءة."},{"title":"تعاون وطني ودولي","description":"نعمل في إطار تعاون وطني ودولي لتعزيز البحث والاستكشاف المعدني."}]}'::jsonb, '{}'::jsonb, '{}'::jsonb); END IF;

  -- 5. GALLERY (insert new)
  IF NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = v_pid AND sort_order = 5) THEN
    INSERT INTO page_sections (id, page_id, section_type, section_key, visible, sort_order, content, settings, styles)
    VALUES (gen_random_uuid(), v_pid, 'custom', NULL, TRUE, 5,
      '{"_renderer":"partnerGallery","eyebrow":"معرض الصور","heading":"صور من أعمالنا","description":"جانب من أنشطتنا ومشاريعنا المشتركة.","images":[{"id":"gimg-0","url":"","alt":""},{"id":"gimg-1","url":"","alt":""},{"id":"gimg-2","url":"","alt":""},{"id":"gimg-3","url":"","alt":""},{"id":"gimg-4","url":"","alt":""},{"id":"gimg-5","url":"","alt":""}]}'::jsonb, '{}'::jsonb, '{}'::jsonb);
  END IF;

  -- 6. CONTACT (update existing sort_order=6 OR insert)
  UPDATE page_sections SET section_type = 'custom',
    content = '{"_renderer":"partnerContact","heading":"تواصل معنا","description":"نحن هنا للإجابة على استفساراتكم.","email":"contact@lefouilleurma.ma","phone":"+212 666 000 000","website":"www.lefouilleurma.ma","address":"شارع الزرقطوني، أكادير، المغرب"}'::jsonb,
    settings='{}'::jsonb, styles='{}'::jsonb
    WHERE page_id = v_pid AND sort_order = 6;
  IF NOT FOUND THEN INSERT INTO page_sections (id, page_id, section_type, visible, sort_order, content, settings, styles) VALUES (gen_random_uuid(), v_pid, 'custom', TRUE, 6, '{"_renderer":"partnerContact","heading":"تواصل معنا","description":"نحن هنا للإجابة على استفساراتكم.","email":"contact@lefouilleurma.ma","phone":"+212 666 000 000","website":"www.lefouilleurma.ma","address":"شارع الزرقطوني، أكادير، المغرب"}'::jsonb, '{}'::jsonb, '{}'::jsonb); END IF;

  -- 7. CONTACT FORM (insert new)
  IF NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = v_pid AND sort_order = 7) THEN
    INSERT INTO page_sections (id, page_id, section_type, section_key, visible, sort_order, content, settings, styles)
    VALUES (gen_random_uuid(), v_pid, 'custom', NULL, TRUE, 7,
      '{"_renderer":"partnerForm","heading":"تواصل مع LeFouilleurma","description":"أرسل لنا استفسارك وسنرد عليك في أقرب وقت."}'::jsonb, '{}'::jsonb, '{}'::jsonb);
  END IF;

  -- 8. CTA (update existing sort_order=8 OR insert)
  UPDATE page_sections SET section_type = 'custom',
    content = '{"_renderer":"partnerCta","heading":"هل أنت مهتم بالعمل مع هذا الشريك؟","description":"","buttons":[{"id":"btn-pr-cta-0","label":"زيارة الموقع الإلكتروني","url":"https://www.lefouilleurma.ma","variant":"primary"},{"id":"btn-pr-cta-1","label":"تواصل مع الشريك","url":"#prForm","variant":"secondary"}]}'::jsonb,
    settings='{}'::jsonb, styles='{}'::jsonb
    WHERE page_id = v_pid AND sort_order = 8;
  IF NOT FOUND THEN INSERT INTO page_sections (id, page_id, section_type, visible, sort_order, content, settings, styles) VALUES (gen_random_uuid(), v_pid, 'custom', TRUE, 8, '{"_renderer":"partnerCta","heading":"هل أنت مهتم بالعمل مع هذا الشريك؟","description":"","buttons":[{"id":"btn-pr-cta-0","label":"زيارة الموقع الإلكتروني","url":"https://www.lefouilleurma.ma","variant":"primary"},{"id":"btn-pr-cta-1","label":"تواصل مع الشريك","url":"#prForm","variant":"secondary"}]}'::jsonb, '{}'::jsonb, '{}'::jsonb); END IF;

  RAISE NOTICE 'LeFouilleurma: % sections', (SELECT COUNT(*) FROM page_sections WHERE page_id = v_pid);
END $$;
