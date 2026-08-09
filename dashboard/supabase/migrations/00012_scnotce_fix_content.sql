-- Fix /partners/scnotce page — change LeFouilleurma content to SENOTEC
DO $$
DECLARE
  v_pid UUID;
BEGIN
  SELECT id INTO v_pid FROM pages WHERE slug = '/partners/scnotce' LIMIT 1;
  IF v_pid IS NULL THEN
    RAISE EXCEPTION 'Page /partners/scnotce not found';
  END IF;

  UPDATE pages SET title = 'SENOTEC' WHERE id = v_pid;

  -- 1. HERO
  UPDATE page_sections SET
    content = '{"heading":"SENOTEC","subheading":"شريك دولي","description":"شريك دولي للجمعية المغربية لهواة البحث والاستكشاف، متخصص في الحلول التقنية والأمنية المتطورة على المستوى الدولي.","backgroundImage":"","buttons":[{"id":"btn-pr-website","label":"زيارة الموقع الإلكتروني","url":"https://www.senotec.com","variant":"primary"},{"id":"btn-pr-contact","label":"تواصل مع الشريك","url":"#prForm","variant":"secondary"}]}'::jsonb
    WHERE page_id = v_pid AND sort_order = 1;

  -- 2. ABOUT
  UPDATE page_sections SET
    content = '{"_renderer":"partnerAbout","eyebrow":"عن SENOTEC","heading":"شريككم الموثوق في مجال التنقيب والاستكشاف","image":"","paragraphs":["SENOTEC هي شركة دولية متخصصة في تقديم الحلول التقنية والأمنية المتطورة. تمتلك الشركة خبرة واسعة في مجال أنظمة المراقبة والحماية الإلكترونية للمؤسسات والمنشآت.","نعمل مع الجمعية المغربية لهواة البحث والاستكشاف في إطار شراكة دولية تهدف إلى تعزيز الأمن والسلامة في الأنشطة الميدانية والاستكشافية."]}'::jsonb
    WHERE page_id = v_pid AND sort_order = 2;

  -- 3. SERVICES
  UPDATE page_sections SET
    content = '{"_renderer":"partnerServices","eyebrow":"خدماتنا","heading":"ماذا نقدم؟","description":"نقدم مجموعة متكاملة من الخدمات المتخصصة في مجال التنقيب والاستكشاف.","cards":[{"title":"التنقيب المعدني","description":"دراسات جيولوجية متقدمة للتنقيب عن المعادن والثروات الطبيعية في مختلف مناطق المغرب."},{"title":"الدراسات الجيولوجية","description":"تحليل وتوثيق التكوينات الجيولوجية وتقديم استشارات متخصصة للمشاريع الاستكشافية."},{"title":"رسم الخرائط","description":"تصميم وإنتاج خرائط جيولوجية وطبوغرافية دقيقة باستخدام أحدث التقنيات الرقمية."},{"title":"التحاليل المخبرية","description":"تحاليل متطورة للعينات المعدنية والصخرية باستخدام أحدث الأجهزة والتقنيات المخبرية."}]}'::jsonb
    WHERE page_id = v_pid AND sort_order = 3;

  -- 4. WHY
  UPDATE page_sections SET
    content = '{"_renderer":"partnerWhy","eyebrow":"لماذا الشراكة معنا؟","heading":"مميزات شراكتنا","description":"نعمل جنبًا إلى جنب مع شركائنا لتحقيق النجاح المشترك.","cards":[{"title":"خبرة مهنية","description":"نمتلك خبرة تمتد لسنوات في مجال التنقيب والاستكشاف المعدني بالمغرب."},{"title":"شريك موثوق","description":"نلتزم بأعلى معايير الجودة والمهنية في جميع مشاريعنا وخدماتنا."},{"title":"خدمات عالية الجودة","description":"نقدم خدمات متكاملة تلبي احتياجات شركائنا بأعلى مستوى من الدقة والكفاءة."},{"title":"تعاون وطني ودولي","description":"نعمل في إطار تعاون وطني ودولي لتعزيز البحث والاستكشاف المعدني."}]}'::jsonb
    WHERE page_id = v_pid AND sort_order = 4;

  -- 5. GALLERY
  UPDATE page_sections SET
    content = '{"_renderer":"partnerGallery","eyebrow":"معرض الصور","heading":"صور من أعمالنا","description":"جانب من أنشطتنا ومشاريعنا المشتركة.","images":[{"id":"gimg-0","url":"","alt":""},{"id":"gimg-1","url":"","alt":""},{"id":"gimg-2","url":"","alt":""},{"id":"gimg-3","url":"","alt":""},{"id":"gimg-4","url":"","alt":""},{"id":"gimg-5","url":"","alt":""}]}'::jsonb
    WHERE page_id = v_pid AND sort_order = 5;

  -- 6. CONTACT
  UPDATE page_sections SET
    content = '{"_renderer":"partnerContact","heading":"تواصل معنا","description":"نحن هنا للإجابة على استفساراتكم.","email":"contact@senotec.com","phone":"+212 522 000 000","website":"www.senotec.com","address":"شارع الحسن الثاني، الرباط، المغرب"}'::jsonb
    WHERE page_id = v_pid AND sort_order = 6;

  -- 7. FORM
  UPDATE page_sections SET
    content = '{"_renderer":"partnerForm","heading":"تواصل مع SENOTEC","description":"أرسل لنا استفسارك وسنرد عليك في أقرب وقت."}'::jsonb
    WHERE page_id = v_pid AND sort_order = 7;

  -- 8. CTA
  UPDATE page_sections SET
    content = '{"_renderer":"partnerCta","heading":"هل أنت مهتم بالعمل مع هذا الشريك؟","description":"","buttons":[{"id":"btn-pr-cta-0","label":"زيارة الموقع الإلكتروني","url":"https://www.senotec.com","variant":"primary"},{"id":"btn-pr-cta-1","label":"تواصل مع الشريك","url":"#prForm","variant":"secondary"}]}'::jsonb
    WHERE page_id = v_pid AND sort_order = 8;

  RAISE NOTICE 'SCNOTCE page fixed: % SENOTEC sections', (SELECT COUNT(*) FROM page_sections WHERE page_id = v_pid);
END $$;
