-- ============================================================================
-- اتصل بنا (Contact) — Full CMS seed
-- Page slug '/contact.html' — the public page at /contact.html
-- resolves this slug via supabase/contact-content.js (dedicated loader).
-- NON-DESTRUCTIVE: UPDATE existing + INSERT missing. Safe to re-run.
-- Content extracted verbatim from /contact.html (real content:
-- 6 sections: hero, 4 contact cards, contact form + info card, map,
-- 4 FAQ items, final CTA). The page has NO content images (CSS/SVG art),
-- so there are no image fields. Social links are '#' in the source —
-- preserved as-is (editable in the CMS, no invented URLs). Map URL and
-- contact info match the global website_settings values.
-- ONLY touches this page.
-- ============================================================================

DO $$
DECLARE
  v_pid UUID;
BEGIN
  SELECT id INTO v_pid FROM pages WHERE slug = '/contact.html' LIMIT 1;
  IF v_pid IS NULL THEN
    INSERT INTO pages (title, slug, status) VALUES ('اتصل بنا', '/contact.html', 'published') RETURNING id INTO v_pid;
  END IF;
  RAISE NOTICE 'page_id: %', v_pid;

  -- 1. sec-contact-hero
  UPDATE page_sections SET section_type = 'hero',
    content = '{"heading":"يسعدنا التواصل معكم","subheading":"تواصل معنا","description":"إذا كانت لديكم أي استفسارات أو اقتراحات أو ترغبون في الانضمام إلى الجمعية، لا تترددوا في التواصل معنا.","backgroundImage":"","buttons":[{"id":"btn-contact-hero-message","label":"أرسل رسالة","url":"#contactFormSection","variant":"primary"},{"id":"btn-contact-hero-faq","label":"الأسئلة الشائعة","url":"#contactFaq","variant":"secondary"}]}'::jsonb,
    settings='{}'::jsonb, styles='{}'::jsonb
    WHERE page_id = v_pid AND sort_order = 1;
  IF NOT FOUND THEN INSERT INTO page_sections (id, page_id, section_type, visible, sort_order, content, settings, styles) VALUES (gen_random_uuid(), v_pid, 'hero', TRUE, 1, '{"heading":"يسعدنا التواصل معكم","subheading":"تواصل معنا","description":"إذا كانت لديكم أي استفسارات أو اقتراحات أو ترغبون في الانضمام إلى الجمعية، لا تترددوا في التواصل معنا.","backgroundImage":"","buttons":[{"id":"btn-contact-hero-message","label":"أرسل رسالة","url":"#contactFormSection","variant":"primary"},{"id":"btn-contact-hero-faq","label":"الأسئلة الشائعة","url":"#contactFaq","variant":"secondary"}]}'::jsonb, '{}'::jsonb, '{}'::jsonb); END IF;

  -- 2. sec-contact-cards
  UPDATE page_sections SET section_type = 'custom',
    content = '{"_renderer":"contactCards","eyebrow":"معلومات سريعة","heading":"قنوات التواصل","description":"اختر الطريقة الأنسب للتواصل مع فريق الجمعية وسنرد عليكم في أقرب وقت ممكن.","items":[{"id":"address","title":"العنوان","value":"المغرب","detail":"أيت ملول، أكادير"},{"id":"phone","title":"الهاتف","value":"+212 684 869 996","detail":""},{"id":"email","title":"البريد الإلكتروني","value":"association.amare.agadir@gmail.com","detail":""},{"id":"hours","title":"ساعات العمل","value":"الإثنين - الجمعة","detail":"09:00 - 18:00"}]}'::jsonb,
    settings='{}'::jsonb, styles='{}'::jsonb
    WHERE page_id = v_pid AND sort_order = 2;
  IF NOT FOUND THEN INSERT INTO page_sections (id, page_id, section_type, visible, sort_order, content, settings, styles) VALUES (gen_random_uuid(), v_pid, 'custom', TRUE, 2, '{"_renderer":"contactCards","eyebrow":"معلومات سريعة","heading":"قنوات التواصل","description":"اختر الطريقة الأنسب للتواصل مع فريق الجمعية وسنرد عليكم في أقرب وقت ممكن.","items":[{"id":"address","title":"العنوان","value":"المغرب","detail":"أيت ملول، أكادير"},{"id":"phone","title":"الهاتف","value":"+212 684 869 996","detail":""},{"id":"email","title":"البريد الإلكتروني","value":"association.amare.agadir@gmail.com","detail":""},{"id":"hours","title":"ساعات العمل","value":"الإثنين - الجمعة","detail":"09:00 - 18:00"}]}'::jsonb, '{}'::jsonb, '{}'::jsonb); END IF;

  -- 3. sec-contact-form
  UPDATE page_sections SET section_type = 'custom',
    content = '{"_renderer":"contactForm","eyebrow":"أرسل لنا رسالة","heading":"نحن هنا من أجلكم","description":"املأ النموذج التالي وسيتواصل معكم فريقنا في أقرب وقت.","infoTitle":"معلومات التواصل","infoDescription":"فريقنا جاهز للرد على استفساراتكم من الإثنين إلى الجمعة. لا تترددوا في التواصل معنا عبر أي وسيلة تناسبكم.","socialTitle":"تابعونا على","social":[{"id":"fb","label":"فيسبوك","url":"#"},{"id":"ig","label":"إنستغرام","url":"#"},{"id":"in","label":"لينكدإن","url":"#"},{"id":"yt","label":"يوتيوب","url":"#"}],"formTitle":"أرسل لنا رسالة","formDescription":"جميع الحقول إلزامية. سيتم الرد على رسالتك في أقرب وقت ممكن.","fields":[{"id":"name","label":"الاسم الكامل","placeholder":"أدخل اسمك الكامل"},{"id":"email","label":"البريد الإلكتروني","placeholder":"example@email.com"},{"id":"phone","label":"رقم الهاتف","placeholder":"+212 6XX XX XX XX"},{"id":"subject","label":"الموضوع","placeholder":"اختر موضوع الرسالة"},{"id":"message","label":"الرسالة","placeholder":"اكتب رسالتك هنا..."}],"subjects":["استفسار","انضمام إلى الجمعية","اقتراح","تطوع","أخرى"],"submitLabel":"إرسال الرسالة"}'::jsonb,
    settings='{}'::jsonb, styles='{}'::jsonb
    WHERE page_id = v_pid AND sort_order = 3;
  IF NOT FOUND THEN INSERT INTO page_sections (id, page_id, section_type, visible, sort_order, content, settings, styles) VALUES (gen_random_uuid(), v_pid, 'custom', TRUE, 3, '{"_renderer":"contactForm","eyebrow":"أرسل لنا رسالة","heading":"نحن هنا من أجلكم","description":"املأ النموذج التالي وسيتواصل معكم فريقنا في أقرب وقت.","infoTitle":"معلومات التواصل","infoDescription":"فريقنا جاهز للرد على استفساراتكم من الإثنين إلى الجمعة. لا تترددوا في التواصل معنا عبر أي وسيلة تناسبكم.","socialTitle":"تابعونا على","social":[{"id":"fb","label":"فيسبوك","url":"#"},{"id":"ig","label":"إنستغرام","url":"#"},{"id":"in","label":"لينكدإن","url":"#"},{"id":"yt","label":"يوتيوب","url":"#"}],"formTitle":"أرسل لنا رسالة","formDescription":"جميع الحقول إلزامية. سيتم الرد على رسالتك في أقرب وقت ممكن.","fields":[{"id":"name","label":"الاسم الكامل","placeholder":"أدخل اسمك الكامل"},{"id":"email","label":"البريد الإلكتروني","placeholder":"example@email.com"},{"id":"phone","label":"رقم الهاتف","placeholder":"+212 6XX XX XX XX"},{"id":"subject","label":"الموضوع","placeholder":"اختر موضوع الرسالة"},{"id":"message","label":"الرسالة","placeholder":"اكتب رسالتك هنا..."}],"subjects":["استفسار","انضمام إلى الجمعية","اقتراح","تطوع","أخرى"],"submitLabel":"إرسال الرسالة"}'::jsonb, '{}'::jsonb, '{}'::jsonb); END IF;

  -- 4. sec-contact-map
  UPDATE page_sections SET section_type = 'custom',
    content = '{"_renderer":"contactMap","eyebrow":"العثور علينا","heading":"موقعنا","mapUrl":"https://www.google.com/maps?q=30.385528,-9.448611&z=16&output=embed"}'::jsonb,
    settings='{}'::jsonb, styles='{}'::jsonb
    WHERE page_id = v_pid AND sort_order = 4;
  IF NOT FOUND THEN INSERT INTO page_sections (id, page_id, section_type, visible, sort_order, content, settings, styles) VALUES (gen_random_uuid(), v_pid, 'custom', TRUE, 4, '{"_renderer":"contactMap","eyebrow":"العثور علينا","heading":"موقعنا","mapUrl":"https://www.google.com/maps?q=30.385528,-9.448611&z=16&output=embed"}'::jsonb, '{}'::jsonb, '{}'::jsonb); END IF;

  -- 5. sec-contact-faq
  UPDATE page_sections SET section_type = 'custom',
    content = '{"_renderer":"contactFaq","eyebrow":"الأسئلة الشائعة","heading":"لديكم أسئلة؟ لدينا إجابات","description":"جمعنا لكم الإجابات عن أكثر الأسئلة تكرارًا حول الجمعية وطرق التواصل.","items":[{"question":"كيف يمكنني الانضمام للجمعية؟","answer":"يمكنكم الانضمام إلى الجمعية عبر ملء استمارة الانخراط المتوفرة على صفحة \"انخرط معنا\"، أو بزيارة مقر الجمعية مباشرة، أو بمراسلتنا عبر البريد الإلكتروني. تُدرَس جميع الطلبات خلال أسبوع واحد من التوصل بها."},{"question":"كيف أتواصل مع الإدارة؟","answer":"يمكنكم التواصل مع الإدارة عبر الهاتف +212 684 869 996 من الإثنين إلى الجمعة بين 09:00 و18:00، أو عبر البريد الإلكتروني association.amare.agadir@gmail.com، وسنعاود الاتصال بكم في أقرب وقت ممكن."},{"question":"هل يمكنني التطوع؟","answer":"بالتأكيد! نرحب دائمًا بالمتطوعين الجدد. يمكنكم التسجيل عبر نموذج الانخراط أو التواصل معنا مباشرة، وسيتواصل معكم فريق التطوع لتحديد الأنشطة والمجالات التي تناسب مهاراتكم واهتماماتكم."},{"question":"كيف أقدم اقتراحاً؟","answer":"يمكنكم إرسال اقتراحاتكم عبر نموذج التواصل في هذه الصفحة مع تحديد الموضوع \"اقتراح\"، أو عبر البريد الإلكتروني مباشرة. نعتمد على أفكاركم وملاحظاتكم لتطوير برامجنا وتحسين خدماتنا."}]}'::jsonb,
    settings='{}'::jsonb, styles='{}'::jsonb
    WHERE page_id = v_pid AND sort_order = 5;
  IF NOT FOUND THEN INSERT INTO page_sections (id, page_id, section_type, visible, sort_order, content, settings, styles) VALUES (gen_random_uuid(), v_pid, 'custom', TRUE, 5, '{"_renderer":"contactFaq","eyebrow":"الأسئلة الشائعة","heading":"لديكم أسئلة؟ لدينا إجابات","description":"جمعنا لكم الإجابات عن أكثر الأسئلة تكرارًا حول الجمعية وطرق التواصل.","items":[{"question":"كيف يمكنني الانضمام للجمعية؟","answer":"يمكنكم الانضمام إلى الجمعية عبر ملء استمارة الانخراط المتوفرة على صفحة \"انخرط معنا\"، أو بزيارة مقر الجمعية مباشرة، أو بمراسلتنا عبر البريد الإلكتروني. تُدرَس جميع الطلبات خلال أسبوع واحد من التوصل بها."},{"question":"كيف أتواصل مع الإدارة؟","answer":"يمكنكم التواصل مع الإدارة عبر الهاتف +212 684 869 996 من الإثنين إلى الجمعة بين 09:00 و18:00، أو عبر البريد الإلكتروني association.amare.agadir@gmail.com، وسنعاود الاتصال بكم في أقرب وقت ممكن."},{"question":"هل يمكنني التطوع؟","answer":"بالتأكيد! نرحب دائمًا بالمتطوعين الجدد. يمكنكم التسجيل عبر نموذج الانخراط أو التواصل معنا مباشرة، وسيتواصل معكم فريق التطوع لتحديد الأنشطة والمجالات التي تناسب مهاراتكم واهتماماتكم."},{"question":"كيف أقدم اقتراحاً؟","answer":"يمكنكم إرسال اقتراحاتكم عبر نموذج التواصل في هذه الصفحة مع تحديد الموضوع \"اقتراح\"، أو عبر البريد الإلكتروني مباشرة. نعتمد على أفكاركم وملاحظاتكم لتطوير برامجنا وتحسين خدماتنا."}]}'::jsonb, '{}'::jsonb, '{}'::jsonb); END IF;

  -- 6. sec-contact-cta
  UPDATE page_sections SET section_type = 'custom',
    content = '{"_renderer":"contactCta","heading":"نحن هنا للإجابة عن جميع استفساراتكم","description":"انضموا إلى عائلة الجمعية وساهموا معنا في صنع أثر حقيقي في المجتمع.","button":{"label":"انضم إلينا","url":"Join us/join-us-online.html"}}'::jsonb,
    settings='{}'::jsonb, styles='{}'::jsonb
    WHERE page_id = v_pid AND sort_order = 6;
  IF NOT FOUND THEN INSERT INTO page_sections (id, page_id, section_type, visible, sort_order, content, settings, styles) VALUES (gen_random_uuid(), v_pid, 'custom', TRUE, 6, '{"_renderer":"contactCta","heading":"نحن هنا للإجابة عن جميع استفساراتكم","description":"انضموا إلى عائلة الجمعية وساهموا معنا في صنع أثر حقيقي في المجتمع.","button":{"label":"انضم إلينا","url":"Join us/join-us-online.html"}}'::jsonb, '{}'::jsonb, '{}'::jsonb); END IF;

  RAISE NOTICE 'CONTACT: % sections', (SELECT COUNT(*) FROM page_sections WHERE page_id = v_pid);
END $$;
