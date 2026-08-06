-- ============================================================================
-- AMARE Expansion Map Page Seed Data
-- Inserts all sections into page_sections for slug = '/Who%20are%20we/expansion-map.html'
-- ============================================================================

DO $$
DECLARE
  target_id UUID;
BEGIN

  SELECT id INTO target_id FROM pages WHERE slug = '/Who%20are%20we/expansion-map.html' LIMIT 1;

  IF target_id IS NULL THEN
    RAISE EXCEPTION 'Expansion Map page not found. Ensure pages table has slug = ''/Who%%20are%%20we/expansion-map.html''.';
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
    'خارطة التوسع',
    'القسم الرئيسي لصفحة خارطة التوسع',
    $CONTENT${
      "heading": "خارطة التوسع الوطني للجمعية",
      "subheading": "خارطة التوسع",
      "description": "تسعى الجمعية المغربية لهواة البحث والاستكشاف إلى توسيع حضورها في مختلف جهات المملكة، من خلال إنشاء فروع جديدة، وتعزيز الشراكات، وتقريب أنشطتها من جميع المهتمين بالبحث والاستكشاف.",
      "backgroundImage": "",
      "buttons": [
        {"id": "btn-em-hero-1", "label": "استكشف الخارطة", "url": "#emMap", "variant": "secondary"},
        {"id": "btn-em-hero-2", "label": "انضم إلينا", "url": "../Join us/join-us-online.html", "variant": "primary"}
      ]
    }$CONTENT$::jsonb,
    '{}'::jsonb,
    '{}'::jsonb,
    true,
    1
  );

  -- ==========================================================================
  -- 2. EXPANSION VISION
  -- ==========================================================================
  INSERT INTO page_sections (id, page_id, section_type, section_key, title, description, content, settings, styles, visible, sort_order)
  VALUES (
    gen_random_uuid(),
    target_id,
    'custom',
    NULL,
    'رؤيتنا للتوسع',
    'استراتيجية التوسع الوطني',
    $CONTENT${
      "eyebrow": "رؤيتنا",
      "heading": "رؤيتنا للتوسع",
      "description": "تنبني استراتيجية التوسع لدى الجمعية على مبدأ التقريب: تقريب الهيكل التنظيمي من الهواة أينما كانوا، وتمكينهم من الانخراط في العمل الجمعوي دون عناء التنقل، مع الحرص على توحيد معايير العمل وجودة البرامج عبر جميع الفروع، وتعزيز الشراكات المحلية والجهوية، والاستثمار في قيادات محلية مؤهلة قادرة على ترجمة رسالة الجمعية داخل جهاتها، بما يضمن توسعاً متوازناً ومستداماً يخدم أهداف الجمعية الوطنية."
    }$CONTENT$::jsonb,
    '{}'::jsonb,
    '{}'::jsonb,
    true,
    2
  );

  -- ==========================================================================
  -- 3. INTERACTIVE MOROCCO MAP
  -- ==========================================================================
  INSERT INTO page_sections (id, page_id, section_type, section_key, title, description, content, settings, styles, visible, sort_order)
  VALUES (
    gen_random_uuid(),
    target_id,
    'custom',
    NULL,
    'خريطة المملكة المغربية',
    'الخريطة التفاعلية للتوسع الوطني',
    $CONTENT${
      "eyebrow": "الخريطة التفاعلية",
      "heading": "خريطة المملكة المغربية",
      "description": "انقر على أي جهة لاستكشاف حالة التوسع، وعدد الفروع النشطة أو المرتقبة في كل جهة من جهات المملكة.",
      "legend": [
        {"status": "active", "label": "فروع نشطة"},
        {"status": "upcoming", "label": "فروع مرتقبة"},
        {"status": "future", "label": "توسع مستقبلي"}
      ],
      "regions": [
        {"id": "MA01", "name": "طنجة - تطوان - الحسيمة", "status": "active", "branches": 1},
        {"id": "MA02", "name": "الشرق", "status": "upcoming", "branches": 0},
        {"id": "MA03", "name": "فاس - مكناس", "status": "active", "branches": 2},
        {"id": "MA04", "name": "الرباط - سلا - القنيطرة", "status": "active", "branches": 2},
        {"id": "MA05", "name": "بني ملال - خنيفرة", "status": "upcoming", "branches": 1},
        {"id": "MA06", "name": "الدار البيضاء - سطات", "status": "active", "branches": 3},
        {"id": "MA07", "name": "مراكش - آسفي", "status": "upcoming", "branches": 1},
        {"id": "MA08", "name": "درعة - تافيلالت", "status": "upcoming", "branches": 0},
        {"id": "MA09", "name": "سوس - ماسة", "status": "active", "branches": 4},
        {"id": "MA10", "name": "كلميم - واد نون", "status": "future", "branches": 0},
        {"id": "MA11", "name": "العيون - الساقية الحمراء", "status": "future", "branches": 0},
        {"id": "MA12", "name": "الداخلة - وادي الذهب", "status": "future", "branches": 0}
      ]
    }$CONTENT$::jsonb,
    '{}'::jsonb,
    '{}'::jsonb,
    true,
    3
  );

  -- ==========================================================================
  -- 4. EXPANSION PHASES TIMELINE
  -- ==========================================================================
  INSERT INTO page_sections (id, page_id, section_type, section_key, title, description, content, settings, styles, visible, sort_order)
  VALUES (
    gen_random_uuid(),
    target_id,
    'custom',
    NULL,
    'مراحل التوسع',
    'خطة التوسع المرحلية',
    $CONTENT${
      "eyebrow": "المراحل",
      "heading": "مراحل التوسع",
      "description": "خطة عمل مرحلية واضحة تقود الجمعية من التأسيس إلى التغطية الوطنية الشاملة.",
      "steps": [
        {"number": "01", "heading": "إطلاق الجمعية", "description": "تأسست الجمعية ووضعت أسس عملها وقيمها، وانطلقت رحلتها الوطنية من أيت ملول وأكادير."},
        {"number": "02", "heading": "تأسيس الفروع", "description": "أُنشئت الفروع الأولى في المدن الكبرى مع توطين الهياكل التسييرية المحلية."},
        {"number": "03", "heading": "التوسع الجهوي", "description": "امتد الحضور إلى باقي جهات المملكة عبر شراكات جهوية وأنشطة ميدانية منتظمة."},
        {"number": "04", "heading": "التغطية الوطنية", "description": "اكتملت التغطية لتشمل جميع جهات المغرب بفروع نشطة وخدمات موحدة الجودة."}
      ]
    }$CONTENT$::jsonb,
    '{}'::jsonb,
    '{}'::jsonb,
    true,
    4
  );

  -- ==========================================================================
  -- 5. STATISTICS
  -- ==========================================================================
  INSERT INTO page_sections (id, page_id, section_type, section_key, title, description, content, settings, styles, visible, sort_order)
  VALUES (
    gen_random_uuid(),
    target_id,
    'statistics',
    NULL,
    'مؤشرات النمو الوطني',
    'إحصائيات التوسع',
    $CONTENT${
      "heading": "مؤشرات النمو الوطني",
      "description": "التوسع في أرقام",
      "stats": [
        {"id": "stat-em-1", "value": "12", "suffix": "", "label": "جهة مستهدفة"},
        {"id": "stat-em-2", "value": "25", "suffix": "", "label": "فرع مستقبلي"},
        {"id": "stat-em-3", "value": "10", "suffix": "", "label": "شراكات"},
        {"id": "stat-em-4", "value": "5000", "suffix": "+", "label": "مستفيد"}
      ]
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
    'كن ممثل الجمعية في مدينتك',
    'دعوة لإنشاء فروع محلية',
    $CONTENT${
      "heading": "كن ممثل الجمعية في مدينتك",
      "description": "إذا كنت ترغب في المساهمة في نشر رسالة الجمعية داخل مدينتك، يمكنك التقدم بطلب إنشاء فرع محلي.",
      "buttonLabel": "قدم طلب إنشاء فرع",
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
