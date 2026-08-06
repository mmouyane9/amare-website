-- ============================================================================
-- AMARE Our Mission Page Seed Data
-- Inserts all sections into page_sections for slug = '/Who%20are%20we/our-mission.html'
-- ============================================================================

DO $$
DECLARE
  target_id UUID;
BEGIN

  SELECT id INTO target_id FROM pages WHERE slug = '/Who%20are%20we/our-mission.html' LIMIT 1;

  IF target_id IS NULL THEN
    RAISE EXCEPTION 'Mission page not found. Ensure pages table has slug = ''/Who%%20are%%20we/our-mission.html''.';
  END IF;

  DELETE FROM page_sections WHERE page_id = target_id;

  -- ==========================================================================
  -- 1. HERO
  -- ==========================================================================
  INSERT INTO page_sections (id, page_id, section_type, section_key, title, description, content, settings, styles, visible, sort_order)
  VALUES (
    gen_random_uuid(),
    target_id,
    'hero',
    NULL,
    'رسالتنا',
    'القسم الرئيسي لصفحة الرسالة',
    $CONTENT${
      "heading": "رسالة الجمعية",
      "subheading": "رسالتنا",
      "description": "تتمثل رسالة الجمعية المغربية لهواة البحث والاستكشاف في نشر ثقافة البحث والاستكشاف، وتشجيع الشباب على المشاركة في المبادرات العلمية والبيئية، والمساهمة في حماية التراث الطبيعي والثقافي، وبناء مجتمع واعٍ يعتمد على المعرفة والعمل التطوعي.",
      "backgroundImage": "",
      "buttons": [
        {"id": "btn-ms-hero-1", "label": "اكتشف رسالتنا", "url": "#omMission", "variant": "secondary"},
        {"id": "btn-ms-hero-2", "label": "أنشطتنا", "url": "../index.html#services", "variant": "primary"}
      ]
    }$CONTENT$::jsonb,
    '{}'::jsonb,
    '{}'::jsonb,
    true,
    1
  );

  -- ==========================================================================
  -- 2. MISSION STATEMENT
  -- ==========================================================================
  INSERT INTO page_sections (id, page_id, section_type, section_key, title, description, content, settings, styles, visible, sort_order)
  VALUES (
    gen_random_uuid(),
    target_id,
    'custom',
    NULL,
    'رسالتنا',
    'بيان الرسالة والغاية',
    $CONTENT${
      "eyebrow": "غايتنا",
      "heading": "رسالتنا",
      "description": "تتمثل رسالتنا في نشر ثقافة البحث والاستكشاف وتشجيع الشباب على المشاركة في المبادرات العلمية والبيئية، والمساهمة في حماية التراث الطبيعي والثقافي المغربي، وبناء مجتمع واعٍ يعتمد على المعرفة والعمل التطوعي. نعمل على تجسيد هذه الرسالة عبر برامج ميدانية وأنشطة توثيقية وتكوينية ترافق الهواة من مختلف الفئات والأعمار، وتكرّس القيم العلمية والأخلاقية في كل خطوة نقوم بها."
    }$CONTENT$::jsonb,
    '{}'::jsonb,
    '{}'::jsonb,
    true,
    2
  );

  -- ==========================================================================
  -- 3. PILLARS (WE WORK FOR)
  -- ==========================================================================
  INSERT INTO page_sections (id, page_id, section_type, section_key, title, description, content, settings, styles, visible, sort_order)
  VALUES (
    gen_random_uuid(),
    target_id,
    'custom',
    NULL,
    'نعمل من أجل',
    'محاور العمل الأربعة',
    $CONTENT${
      "eyebrow": "محاور عملنا",
      "heading": "نعمل من أجل",
      "description": "أربعة محاور أساسية تترجم رسالتنا إلى مبادرات وبرامج ملموسة على أرض الواقع.",
      "cards": [
        {"heading": "نشر المعرفة", "description": "نوظف العلم والمعرفة لتثقيف المجتمع حول ثراء التراث الطبيعي والثقافي المغربي وأهمية الحفاظ عليه."},
        {"heading": "العمل التطوعي", "description": "نؤطر المتطوعين ونحفزهم على الانخراط في مبادرات ميدانية تساهم في خدمة المجتمع وحماية البيئة."},
        {"heading": "حماية التراث", "description": "نساهم في الحفاظ على المواقع التاريخية والطبيعية وتوثيقها، لتبقى شاهدًا حيًا على هويتنا الوطنية."},
        {"heading": "تنمية المجتمع", "description": "نعمل على تحقيق التنمية المحلية المستدامة عبر إشراك السكان في مشاريع ذات أثر اجتماعي وبيئي حقيقي."}
      ]
    }$CONTENT$::jsonb,
    '{}'::jsonb,
    '{}'::jsonb,
    true,
    3
  );

  -- ==========================================================================
  -- 4. HOW WE ACHIEVE OUR MISSION
  -- ==========================================================================
  INSERT INTO page_sections (id, page_id, section_type, section_key, title, description, content, settings, styles, visible, sort_order)
  VALUES (
    gen_random_uuid(),
    target_id,
    'custom',
    NULL,
    'كيف نحقق رسالتنا؟',
    'منهجية العمل والبرامج',
    $CONTENT${
      "eyebrow": "منهجية العمل",
      "heading": "كيف نحقق رسالتنا؟",
      "description": "نعتمد على مقاربة عملية واضحة تجمع بين العلم الميداني والتكوين والشراكة المجتمعية.",
      "image": {
        "url": "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=1000&auto=format&fit=crop",
        "alt": "طبيعة وجبال الأطلس"
      },
      "highlights": [
        {"label": "تكوين الشباب"},
        {"label": "حماية البيئة"},
        {"label": "عمل تطوعي"}
      ],
      "checklist": [
        {"heading": "تنظيم الأنشطة العلمية", "description": "ورشات ومحاضرات وملتقيات علمية تفتح المجال للهواة والباحثين لتبادل المعرفة."},
        {"heading": "تكوين الشباب", "description": "برامج تكوينية متدرجة في تقنيات البحث الميداني والسلامة والإسعافات الأولية."},
        {"heading": "حملات التوعية", "description": "حملات تحسيسية حول الثقافة البيئية وأهمية الحفاظ على التراث الطبيعي والثقافي."},
        {"heading": "البحث الميداني", "description": "مسوحات ودراسات ميدانية موثقة بالتعاون مع الخبراء والجامعات والمؤسسات المتخصصة."},
        {"heading": "بناء الشراكات", "description": "شبكة من الشراكات مع المؤسسات والجمعيات لتعزيز الموارد وتبادل الخبرات."}
      ]
    }$CONTENT$::jsonb,
    '{}'::jsonb,
    '{}'::jsonb,
    true,
    4
  );

  -- ==========================================================================
  -- 5. QUOTE
  -- ==========================================================================
  INSERT INTO page_sections (id, page_id, section_type, section_key, title, description, content, settings, styles, visible, sort_order)
  VALUES (
    gen_random_uuid(),
    target_id,
    'custom',
    NULL,
    'اقتباس ملهم',
    'رسالة ملهمة من الجمعية',
    $CONTENT${
      "quote": "رسالتنا هي تحويل حب الاستكشاف إلى عمل يخدم الإنسان والوطن ويحافظ على تراثه للأجيال القادمة.",
      "attribution": "الجمعية المغربية لهواة البحث والاستكشاف"
    }$CONTENT$::jsonb,
    '{}'::jsonb,
    '{}'::jsonb,
    true,
    5
  );

  -- ==========================================================================
  -- 6. CTA
  -- ==========================================================================
  INSERT INTO page_sections (id, page_id, section_type, section_key, title, description, content, settings, styles, visible, sort_order)
  VALUES (
    gen_random_uuid(),
    target_id,
    'cta',
    NULL,
    'ساهم معنا في تحقيق رسالتنا',
    'دعوة للانخراط والمشاركة',
    $CONTENT${
      "heading": "ساهم معنا في تحقيق رسالتنا",
      "description": "انضم إلى شبكة الهواة والباحثين والمتطوعين، وساهم بوقتك أو معرفتك أو مبادرتك في نشر ثقافة الاستكشاف وحماية تراث بلادنا.",
      "buttonLabel": "انخرط معنا",
      "buttonUrl": "Join us/join-us-online.html",
      "backgroundImage": ""
    }$CONTENT$::jsonb,
    '{}'::jsonb,
    '{}'::jsonb,
    true,
    6
  );

  -- ==========================================================================
  -- 7. FOOTER
  -- ==========================================================================
  INSERT INTO page_sections (id, page_id, section_type, section_key, title, description, content, settings, styles, visible, sort_order)
  VALUES (
    gen_random_uuid(),
    target_id,
    'custom',
    NULL,
    'Footer',
    'تذييل الصفحة',
    $CONTENT${
      "_renderer": "footer",
      "brandName": "الجمعية المغربية لهواة البحث والاستكشاف",
      "brandLogo": "Amare files /logo.png",
      "description": "الجمعية المغربية لهواة البحث والاستكشاف هي إطار قانوني وطني يجمع الهواة تحت راية واحدة لصون التراث الوطني المغربي.",
      "socialLinks": [
        {"platform": "فيسبوك", "url": "#"},
        {"platform": "إنستغرام", "url": "#"},
        {"platform": "لينكدإن", "url": "#"}
      ],
      "quickLinksHeading": "روابط سريعة",
      "quickLinks": [
        {"label": "الرئيسية", "url": "../index.html"},
        {"label": "اتصل بنا", "url": "../contact.html"},
        {"label": "خدماتنا", "url": "../index.html#services"},
        {"label": "الاخبار", "url": "../index.html#news"},
        {"label": "الارشيف", "url": "../index.html#newsletter"},
        {"label": "الفروع الجهوية", "url": "../index.html#home"},
        {"label": "انخرط معنا", "url": "../Join us/join-us-online.html"},
        {"label": "شركاؤنا", "url": "../index.html#services"},
        {"label": "انشطتنا", "url": "../index.html#services"},
        {"label": "من نحن", "url": "../index.html#about"}
      ],
      "programsHeading": "برامجنا",
      "programs": [
        {"label": "SOS Amare", "url": "../index.html#services"},
        {"label": "متجر Amare", "url": "../amare store/index.html"},
        {"label": "بيت المستكشف Amare", "url": "../index.html#services"},
        {"label": "مجلة Amare", "url": "../index.html#services"},
        {"label": "أكاديمية Amare", "url": "../index.html#services"},
        {"label": "النوادي", "url": "../index.html#services"},
        {"label": "المستشار القانوني", "url": "../index.html#services"},
        {"label": "عقد التأمين", "url": "../index.html#services"}
      ],
      "contact": {
        "address": "ص.ب 749 أيت ملول 86150",
        "phone": "+212 684869996",
        "email": "association.amare.agadir@gmail.com"
      },
      "mapHeading": "موقعنا",
      "mapLabel": "📍 Ait Melloul, Agadir",
      "mapLat": "30.385528",
      "mapLon": "-9.448611",
      "copyright": "© 2026 الجمعية المغربية لهواة البحث والاستكشاف. جميع الحقوق محفوظة.",
      "bottomLinks": [
        {"label": "سياسة الخصوصية", "url": "#"},
        {"label": "الشروط والأحكام", "url": "#"}
      ]
    }$CONTENT$::jsonb,
    '{}'::jsonb,
    '{}'::jsonb,
    true,
    7
  );

END;
$$;
