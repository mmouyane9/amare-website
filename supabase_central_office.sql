-- ============================================================================
-- AMARE Central Office Page Seed Data
-- Inserts all sections into page_sections for slug = '/Who%20are%20we/central-office.html'
-- ============================================================================

DO $$
DECLARE
  target_id UUID;
BEGIN

  SELECT id INTO target_id FROM pages WHERE slug = '/Who%20are%20we/central-office.html' LIMIT 1;

  IF target_id IS NULL THEN
    RAISE EXCEPTION 'Central Office page not found. Ensure pages table has slug = ''/Who%%20are%%20we/central-office.html''.';
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
    'المكتب المركزي',
    'القسم الرئيسي لصفحة المكتب المركزي',
    $CONTENT${
      "heading": "المكتب المركزي للجمعية",
      "subheading": "المكتب المركزي",
      "description": "يشرف المكتب المركزي على إدارة الجمعية، ووضع الخطط الاستراتيجية، وتنسيق الأنشطة الوطنية، وتعزيز الشراكات، وضمان تحقيق أهداف الجمعية ورسالتها في مختلف جهات المملكة.",
      "backgroundImage": "",
      "buttons": [
        {"id": "btn-co-hero-1", "label": "تعرف على المكتب", "url": "#coAbout", "variant": "secondary"},
        {"id": "btn-co-hero-2", "label": "تواصل معنا", "url": "../contact.html", "variant": "primary"}
      ]
    }$CONTENT$::jsonb,
    '{}'::jsonb,
    '{}'::jsonb,
    true,
    1
  );

  -- ==========================================================================
  -- 2. ABOUT THE CENTRAL OFFICE
  -- ==========================================================================
  INSERT INTO page_sections (id, page_id, section_type, section_key, title, description, content, settings, styles, visible, sort_order)
  VALUES (
    gen_random_uuid(),
    target_id,
    'custom',
    NULL,
    'نبذة عن المكتب المركزي',
    'مقدمة عن المكتب المركزي للجمعية',
    $CONTENT${
      "eyebrow": "عن المكتب المركزي",
      "heading": "نبذة عن المكتب المركزي",
      "description": "يُعد المكتب المركزي الهيئة التنفيذية العليا للجمعية المغربية لهواة البحث والاستكشاف؛ فهو المسؤول عن إدارة شؤون الجمعية، ووضع الخطط الاستراتيجية، وتنسيق الأنشطة الوطنية بين الفروع، وتعزيز الشراكات مع المؤسسات، وضمان تحقيق أهداف الجمعية ورسالتها في مختلف جهات المملكة، مع الحرص على الالتزام بالقيم والمبادئ التي تقوم عليها الجمعية."
    }$CONTENT$::jsonb,
    '{}'::jsonb,
    '{}'::jsonb,
    true,
    2
  );

  -- ==========================================================================
  -- 3. TASKS OF THE CENTRAL OFFICE
  -- ==========================================================================
  INSERT INTO page_sections (id, page_id, section_type, section_key, title, description, content, settings, styles, visible, sort_order)
  VALUES (
    gen_random_uuid(),
    target_id,
    'custom',
    NULL,
    'مهام المكتب المركزي',
    'المسؤوليات والاختصاصات',
    $CONTENT${
      "eyebrow": "مسؤوليات المكتب",
      "heading": "مهام المكتب المركزي",
      "description": "مهام متكاملة تضعها الجمعية بين يدي المكتب المركزي لضمان سير العمل وتنفيذ الأهداف الوطنية.",
      "cards": [
        {"heading": "إعداد الاستراتيجية", "description": "رسم الخطط الاستراتيجية للجمعية وتحديد الأولويات الوطنية لكل موسم عمل."},
        {"heading": "تنسيق الفروع", "description": "التنسيق المستمر بين الفروع الجهوية واللجان لضمان تناسق الجهود على المستوى الوطني."},
        {"heading": "إدارة المشاريع", "description": "الإشراف على إنجاز المشاريع والبرامج من التخطيط إلى التنفيذ والمتابعة."},
        {"heading": "بناء الشراكات", "description": "تطوير شبكة من الشراكات مع المؤسسات والجامعات والجمعيات لتعزيز الموارد وتبادل الخبرات."},
        {"heading": "متابعة الأنشطة", "description": "مواكبة الأنشطة والبرامج الميدانية وتقييم مردوديتها وضمان جودة التنفيذ."},
        {"heading": "تطوير الجمعية", "description": "العمل المستمر على تطوير هياكل الجمعية وبرامجها وخدماتها بما يواكب تطلعات الأعضاء."}
      ]
    }$CONTENT$::jsonb,
    '{}'::jsonb,
    '{}'::jsonb,
    true,
    3
  );

  -- ==========================================================================
  -- 4. WORKING PROCESS (TIMELINE)
  -- ==========================================================================
  INSERT INTO page_sections (id, page_id, section_type, section_key, title, description, content, settings, styles, visible, sort_order)
  VALUES (
    gen_random_uuid(),
    target_id,
    'custom',
    NULL,
    'آلية العمل',
    'منهجية عمل المكتب المركزي',
    $CONTENT${
      "eyebrow": "دورة العمل",
      "heading": "آلية العمل",
      "description": "منهجية عملية واضحة يعتمدها المكتب المركزي لتحويل الخطط إلى إنجازات ملموسة.",
      "steps": [
        {"number": "01", "heading": "التخطيط", "description": "نحدد الأهداف والأولويات الوطنية ونرسم خارطة الطريق لكل موسم عمل."},
        {"number": "02", "heading": "التنسيق", "description": "ننسق بين الفروع الجهوية واللجان والمتطوعين لضمان تناسق الجهود."},
        {"number": "03", "heading": "التنفيذ", "description": "ننفذ الخطط عبر برامج ميدانية وتكوينية بإشراف مباشر من المكتب."},
        {"number": "04", "heading": "التقييم", "description": "نقيس الأثر ونستخلص الدروس لتحسين أدائنا ورفع جودة المبادرات باستمرار."}
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
    'رسالة قيادية',
    $CONTENT${
      "quote": "القيادة الناجحة هي التي تحول الرؤية إلى إنجاز يخدم المجتمع والوطن.",
      "attribution": "المكتب المركزي للجمعية المغربية لهواة البحث والاستكشاف"
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
    'ساهم معنا في بناء مستقبل أفضل',
    'دعوة للانخراط والمشاركة',
    $CONTENT${
      "heading": "ساهم معنا في بناء مستقبل أفضل",
      "description": "كن جزءاً من مسيرة الجمعية وساهم في تحقيق أهدافها الوطنية، وشاركنا العمل على خدمة المجتمع وحماية تراث بلادنا.",
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
