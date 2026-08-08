-- ============================================================================
-- AMARE National Vision — Non-Destructive CMS Seed
-- Slug: /Who%20are%20we/national-vision.html
-- Idempotent — safe to run multiple times.
-- Uses INSERT ... WHERE NOT EXISTS on stable section_key values.
-- Never deletes or overwrites existing sections.
-- ============================================================================

DO $$
DECLARE
    target_id UUID;
BEGIN

    SELECT id INTO target_id FROM pages WHERE slug = '/Who%20are%20we/national-vision.html' LIMIT 1;

    IF target_id IS NULL THEN
        RAISE EXCEPTION 'National vision page not found. Ensure pages table has slug = ''/Who%%20are%%20we/national-vision.html''.';
    END IF;

    -- =====================================================================
    -- 1. HERO  (section_key: nv.hero)
    -- =====================================================================
    INSERT INTO page_sections (id, page_id, section_type, section_key, title, description, content, settings, styles, visible, sort_order)
    SELECT gen_random_uuid(), target_id, 'hero', 'nv.hero', 'الرؤية الوطنية', 'القسم الرئيسي لصفحة الرؤية الوطنية',
        $CONTENT${
          "heading": "الرؤية الوطنية للجمعية",
          "subheading": "الرؤية الوطنية",
          "description": "تسعى الجمعية المغربية لهواة البحث والاستكشاف إلى النهوض بمجال الاستكشاف والبحث العلمي، ونشر الثقافة البيئية، والحفاظ على التراث الطبيعي والثقافي، وتعزيز التنمية المستدامة في مختلف جهات المملكة المغربية.",
          "backgroundImage": "",
          "buttons": [
            {"id": "btn-nv-hero-1", "label": "اكتشف رؤيتنا", "url": "#nvVision", "variant": "secondary"},
            {"id": "btn-nv-hero-2", "label": "أثرنا على الميدان", "url": "#nvStats", "variant": "primary"}
          ]
        }$CONTENT$::jsonb,
        '{}'::jsonb, '{}'::jsonb, true, 1
    WHERE NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = target_id AND section_key = 'nv.hero');

    -- =====================================================================
    -- 2. VISION STATEMENT  (section_key: nv.vision)
    -- =====================================================================
    INSERT INTO page_sections (id, page_id, section_type, section_key, title, description, content, settings, styles, visible, sort_order)
    SELECT gen_random_uuid(), target_id, 'custom', 'nv.vision', 'رؤيتنا', 'بيان الرؤية والطموحات',
        $CONTENT${
          "eyebrow": "ماذا نطمح إليه",
          "heading": "رؤيتنا",
          "description": "نطمح إلى أن نكون الجمعية الوطنية الرائدة في توحيد هواة البحث والاستكشاف تحت رؤية مشتركة ترتكز على العلم والمعرفة والوعي البيئي والانتماء الوطني. نؤمن بأن الإنسان المغربي الواعي، حين يُمنح الفرصة والمعرفة، قادر على حماية ثروات بلاده الطبيعية والثقافية وضمان استدامتها للأجيال القادمة، عبر استكشاف مسؤول يزاوج بين شغف المغامرة والالتزام بالأخلاقيات والممارسات المثلى.",
          "cards": [
            {"heading": "أجيال واعية", "description": "نعمل على تكوين أجيال شابة واعية بأهمية العلم والبحث، قادرة على فهم تراثها الوطني والمساهمة في تطويره وحمايته بمسؤولية."},
            {"heading": "تراث مستدام", "description": "نحافظ على التراث الطبيعي والثقافي المغربي ونثمّنه، لضمان انتقاله بكامل قيمته إلى الأجيال القادمة."},
            {"heading": "استكشاف مسؤول", "description": "نلتزم بمدونة أخلاقية صارمة تجعل من كل خرج ميداني فرصة للاستكشاف العلمي الآمن والمحترم للبيئة والمجتمعات المحلية."}
          ]
        }$CONTENT$::jsonb,
        '{}'::jsonb, '{}'::jsonb, true, 2
    WHERE NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = target_id AND section_key = 'nv.vision');

    -- =====================================================================
    -- 3. STRATEGIC OBJECTIVES  (section_key: nv.objectives)
    -- =====================================================================
    INSERT INTO page_sections (id, page_id, section_type, section_key, title, description, content, settings, styles, visible, sort_order)
    SELECT gen_random_uuid(), target_id, 'custom', 'nv.objectives', 'الأهداف الاستراتيجية', 'الأهداف الستة الكبرى للجمعية',
        $CONTENT${
          "eyebrow": "أولويات العمل",
          "heading": "الأهداف الاستراتيجية",
          "description": "حددت الجمعية ستة أهداف استراتيجية كبرى توجّه جميع برامجها وأنشطتها على المستوى الوطني.",
          "cards": [
            {"heading": "تعزيز البحث العلمي", "description": "دعم الدراسات الميدانية والتوثيق العلمي للاكتشافات الجيولوجية والأثرية والطبيعية في مختلف جهات المملكة."},
            {"heading": "حماية التراث الطبيعي", "description": "المساهمة في الحفاظ على المواقع الطبيعية والمحميات، والتصدي لأي استغلال يهدد التوازن البيئي الوطني."},
            {"heading": "نشر الثقافة البيئية", "description": "تنظيم حملات تحسيسية وبرامج تربوية لتعزيز الوعي البيئي وترسيخ سلوكات مستدامة لدى المواطنين."},
            {"heading": "دعم الشباب", "description": "مواكبة الشباب المهتم بالاستكشاف والعلوم عبر تكوينات وورشات وإشراكهم في مشاريع ميدانية هادفة."},
            {"heading": "تعزيز العمل التطوعي", "description": "تحفيز المتطوعين وتأطيرهم ليكونوا فاعلين أساسيين في إنجاح البرامج الوطنية للجمعية."},
            {"heading": "بناء شراكات وطنية", "description": "تطوير شراكات مع الجامعات والمؤسسات والجمعيات لتبادل الخبرات وتوسيع نطاق الأثر على المستوى الوطني."}
          ]
        }$CONTENT$::jsonb,
        '{}'::jsonb, '{}'::jsonb, true, 3
    WHERE NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = target_id AND section_key = 'nv.objectives');

    -- =====================================================================
    -- 4. NATIONAL PRIORITIES (TIMELINE)  (section_key: nv.priorities)
    -- =====================================================================
    INSERT INTO page_sections (id, page_id, section_type, section_key, title, description, content, settings, styles, visible, sort_order)
    SELECT gen_random_uuid(), target_id, 'custom', 'nv.priorities', 'أولوياتنا الوطنية', 'خريطة طريق بأربع أولويات كبرى',
        $CONTENT${
          "eyebrow": "خريطة الطريق",
          "heading": "أولوياتنا الوطنية",
          "description": "خطة عمل وطنية واضحة تقوم على أربع أولويات كبرى تعكس التزام الجمعية بأداء رسالتها.",
          "items": [
            {"number": "01", "heading": "الاستكشاف", "description": "تنظيم خرجات وبعثات ميدانية آمنة ومسؤولة تتيح للهواة اكتشاف الثروات الطبيعية والمواقع التاريخية، مع الالتزام بميثاق الاستكشاف المسؤول."},
            {"number": "02", "heading": "التكوين", "description": "تأهيل الأعضاء عبر برامج تكوينية متدرجة في مجالات الإسعافات الأولية وتقنيات البحث الميداني والسلامة والتوثيق العلمي."},
            {"number": "03", "heading": "البحث العلمي", "description": "إنجاز دراسات ومسوحات ميدانية بالتعاون مع الخبراء والجامعات، ونشر النتائج في مجلة AMARE والمجلات العلمية المتخصصة."},
            {"number": "04", "heading": "الشراكات", "description": "نسج شبكة واسعة من الشراكات مع المؤسسات الوطنية والدولية لتعزيز الموارد وتبادل المعرفة وتوسيع الأثر على الصعيدين الجهوي والوطني."}
          ]
        }$CONTENT$::jsonb,
        '{}'::jsonb, '{}'::jsonb, true, 4
    WHERE NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = target_id AND section_key = 'nv.priorities');

    -- =====================================================================
    -- 5. STATISTICS  (section_key: nv.statistics)
    -- =====================================================================
    INSERT INTO page_sections (id, page_id, section_type, section_key, title, description, content, settings, styles, visible, sort_order)
    SELECT gen_random_uuid(), target_id, 'statistics', 'nv.statistics', 'أثرنا في الأرقام', 'إحصائيات الجمعية الوطنية',
        $CONTENT${
          "heading": "مسيرة وطنية بأرقام معبرة",
          "description": "أثرنا في الأرقام",
          "stats": [
            {"id": "stat-nv-1", "value": "20", "suffix": "+", "label": "شراكة"},
            {"id": "stat-nv-2", "value": "100", "suffix": "+", "label": "نشاط"},
            {"id": "stat-nv-3", "value": "1000", "suffix": "+", "label": "مستفيد"},
            {"id": "stat-nv-4", "value": "12", "suffix": "+", "label": "جهة مستهدفة"}
          ]
        }$CONTENT$::jsonb,
        '{}'::jsonb, '{}'::jsonb, true, 5
    WHERE NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = target_id AND section_key = 'nv.statistics');

    -- =====================================================================
    -- 6. QUOTE  (section_key: nv.quote)
    -- =====================================================================
    INSERT INTO page_sections (id, page_id, section_type, section_key, title, description, content, settings, styles, visible, sort_order)
    SELECT gen_random_uuid(), target_id, 'custom', 'nv.quote', 'اقتباس ملهم', 'رسالة ملهمة من الجمعية',
        $CONTENT${
          "quote": "رؤيتنا هي بناء مجتمع يقدّر المعرفة والاستكشاف ويحافظ على التراث الطبيعي والثقافي للأجيال القادمة.",
          "attribution": "الجمعية المغربية لهواة البحث والاستكشاف"
        }$CONTENT$::jsonb,
        '{}'::jsonb, '{}'::jsonb, true, 6
    WHERE NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = target_id AND section_key = 'nv.quote');

    -- =====================================================================
    -- 7. CTA  (section_key: nv.cta)
    -- =====================================================================
    INSERT INTO page_sections (id, page_id, section_type, section_key, title, description, content, settings, styles, visible, sort_order)
    SELECT gen_random_uuid(), target_id, 'cta', 'nv.cta', 'كن جزءاً من رؤيتنا الوطنية', 'دعوة للانخراط والمشاركة',
        $CONTENT${
          "heading": "كن جزءاً من رؤيتنا الوطنية",
          "description": "انضم إلى آلاف الهواة والباحثين والمتطوعين الذين يشاركوننا الشغف بالاستكشاف والالتزام بحماية تراث المغرب، وساهم معنا في بناء غدٍ أكثر استدامة.",
          "buttonLabel": "انخرط معنا",
          "buttonUrl": "Join us/join-us-online.html",
          "backgroundImage": ""
        }$CONTENT$::jsonb,
        '{}'::jsonb, '{}'::jsonb, true, 7
    WHERE NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = target_id AND section_key = 'nv.cta');

    -- =====================================================================
    -- 8. FOOTER  (section_key: nv.footer)
    -- =====================================================================
    INSERT INTO page_sections (id, page_id, section_type, section_key, title, description, content, settings, styles, visible, sort_order)
    SELECT gen_random_uuid(), target_id, 'custom', 'nv.footer', 'Footer', 'تذييل الصفحة',
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
        '{}'::jsonb, '{}'::jsonb, true, 8
    WHERE NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = target_id AND section_key = 'nv.footer');

END;
$$;
