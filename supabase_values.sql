-- ============================================================================
-- AMARE Our Values — Non-Destructive CMS Seed
-- Slug: /Who%20are%20we/our-values.html
-- Idempotent — safe to run multiple times.
-- Uses INSERT ... WHERE NOT EXISTS on stable section_key values.
-- Never deletes or overwrites existing sections.
-- ============================================================================

DO $$
DECLARE
    target_id UUID;
BEGIN

    SELECT id INTO target_id FROM pages WHERE slug = '/Who%20are%20we/our-values.html' LIMIT 1;

    IF target_id IS NULL THEN
        RAISE EXCEPTION 'Our Values page not found. Ensure pages table has slug = ''/Who%%20are%%20we/our-values.html''.';
    END IF;

    -- =====================================================================
    -- 1. HERO  (section_key: ov.hero)
    -- =====================================================================
    INSERT INTO page_sections (id, page_id, section_type, section_key, title, description, content, settings, styles, visible, sort_order)
    SELECT gen_random_uuid(), target_id, 'hero', 'ov.hero', 'قيمنا', 'القسم الرئيسي لصفحة القيم',
        $CONTENT${
          "heading": "القيم التي تقود مسيرتنا",
          "subheading": "قيمنا",
          "description": "تؤمن الجمعية المغربية لهواة البحث والاستكشاف بأن النجاح الحقيقي يبدأ بقيم راسخة توجه أعمالها ومبادراتها، وتعزز روح المسؤولية، والتعاون، وخدمة المجتمع، والحفاظ على التراث الوطني.",
          "backgroundImage": "",
          "buttons": [
            {"id": "btn-ov-hero-1", "label": "اكتشف قيمنا", "url": "#ovValues", "variant": "secondary"},
            {"id": "btn-ov-hero-2", "label": "أنشطتنا", "url": "../index.html#services", "variant": "primary"}
          ]
        }$CONTENT$::jsonb,
        '{}'::jsonb, '{}'::jsonb, true, 1
    WHERE NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = target_id AND section_key = 'ov.hero');

    -- =====================================================================
    -- 2. CORE VALUES INTRO  (section_key: ov.intro)
    -- =====================================================================
    INSERT INTO page_sections (id, page_id, section_type, section_key, title, description, content, settings, styles, visible, sort_order)
    SELECT gen_random_uuid(), target_id, 'custom', 'ov.intro', 'قيمنا الأساسية', 'مقدمة عن القيم الأساسية للجمعية',
        $CONTENT${
          "eyebrow": "أسس عملنا",
          "heading": "قيمنا الأساسية",
          "description": "تعتبر قيم الجمعية المغربية لهواة البحث والاستكشاف الأساس الذي تبنى عليه جميع أنشطتها ومبادراتها؛ فهي الموجه الحقيقي لسلوك أعضائها، والمعيار الذي يضمن جودة العمل ويبني الثقة بين الهواة والمتطوعين والشركاء، وتمثل العهد الأخلاقي الذي يلتزم به كل منخرط في الجمعية في كل خطوة يقوم بها."
        }$CONTENT$::jsonb,
        '{}'::jsonb, '{}'::jsonb, true, 2
    WHERE NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = target_id AND section_key = 'ov.intro');

    -- =====================================================================
    -- 3. VALUES GRID (8 CARDS)  (section_key: ov.values)
    -- =====================================================================
    INSERT INTO page_sections (id, page_id, section_type, section_key, title, description, content, settings, styles, visible, sort_order)
    SELECT gen_random_uuid(), target_id, 'custom', 'ov.values', 'قيم نؤمن بها', 'ثماني قيم جوهرية توجه عمل الجمعية',
        $CONTENT${
          "eyebrow": "ماذا نؤمن به",
          "heading": "قيم نؤمن بها",
          "description": "ثماني قيم جوهرية تترجم مبادئنا إلى سلوك يومي ملموس في كل ما نقوم به داخل الجمعية وخارجها.",
          "cards": [
            {"heading": "النزاهة", "description": "الالتزام بالشفافية والصدق في جميع أعمال الجمعية."},
            {"heading": "العمل الجماعي", "description": "نؤمن بأن النجاح يتحقق من خلال التعاون وروح الفريق."},
            {"heading": "الابتكار", "description": "تشجيع الأفكار الجديدة والحلول الإبداعية في البحث والاستكشاف."},
            {"heading": "المسؤولية", "description": "تحمل المسؤولية تجاه المجتمع والبيئة والتراث الوطني."},
            {"heading": "الاحترام", "description": "احترام الجميع وتعزيز ثقافة الحوار والتعاون."},
            {"heading": "التطوع", "description": "غرس روح المبادرة وخدمة المجتمع دون مقابل."},
            {"heading": "الاستدامة", "description": "المحافظة على الموارد الطبيعية للأجيال القادمة."},
            {"heading": "التميز", "description": "السعي المستمر نحو الجودة والاحترافية في جميع المبادرات."}
          ]
        }$CONTENT$::jsonb,
        '{}'::jsonb, '{}'::jsonb, true, 3
    WHERE NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = target_id AND section_key = 'ov.values');

    -- =====================================================================
    -- 4. HOW WE APPLY VALUES  (section_key: ov.apply)
    -- =====================================================================
    INSERT INTO page_sections (id, page_id, section_type, section_key, title, description, content, settings, styles, visible, sort_order)
    SELECT gen_random_uuid(), target_id, 'custom', 'ov.apply', 'كيف نطبق هذه القيم؟', 'تطبيق القيم في الميدان',
        $CONTENT${
          "eyebrow": "القيم في الميدان",
          "heading": "كيف نطبق هذه القيم؟",
          "description": "نحرص على أن تتجسد قيمنا في كل محطة من محطات عملنا، من التكوين إلى الشراكات الوطنية.",
          "image": {
            "url": "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?q=80&w=1000&auto=format&fit=crop",
            "alt": "فريق من المتطوعين يعملون معًا"
          },
          "highlights": [
            {"label": "عمل جماعي"},
            {"label": "احترام البيئة"},
            {"label": "أمانة وشفافية"}
          ],
          "steps": [
            {"heading": "في برامج التكوين", "description": "نرسّخ في كل تكوين قيم المسؤولية والنزاهة والمثابرة لدى المتدربين عبر منهجيات عملية تحاكي الواقع الميداني."},
            {"heading": "في الأنشطة الميدانية", "description": "نمارس قيمنا في الميدان من خلال احترام البيئة والتعاون بين الفرق والتوثيق المسؤول أثناء الخرجات الاستكشافية."},
            {"heading": "في حماية التراث", "description": "نحافظ على المواقع الطبيعية والثقافية بكل أمانة ومسؤولية، ونساهم في توثيقها وإبراز قيمتها للأجيال القادمة."},
            {"heading": "في العمل التطوعي", "description": "نغرس روح المبادرة والعطاء في المتطوعين من خلال إشراكهم الفعلي في خدمة المجتمع دون مقابل."},
            {"heading": "في الشراكات الوطنية", "description": "نبني شراكات تقوم على الصدق والشفافية والاحترام المتبادل مع جميع المؤسسات والجمعيات الشريكة."}
          ]
        }$CONTENT$::jsonb,
        '{}'::jsonb, '{}'::jsonb, true, 4
    WHERE NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = target_id AND section_key = 'ov.apply');

    -- =====================================================================
    -- 5. STATISTICS  (section_key: ov.statistics)
    -- =====================================================================
    INSERT INTO page_sections (id, page_id, section_type, section_key, title, description, content, settings, styles, visible, sort_order)
    SELECT gen_random_uuid(), target_id, 'statistics', 'ov.statistics', 'قيم تتحول إلى إنجازات', 'إحصائيات تعكس أثر القيم',
        $CONTENT${
          "heading": "قيم تتحول إلى إنجازات",
          "description": "أثرنا في الأرقام",
          "stats": [
            {"id": "stat-ov-1", "value": "25", "suffix": "+", "label": "مبادرة"},
            {"id": "stat-ov-2", "value": "150", "suffix": "+", "label": "متطوع"},
            {"id": "stat-ov-3", "value": "40", "suffix": "+", "label": "شريك"},
            {"id": "stat-ov-4", "value": "3000", "suffix": "+", "label": "مستفيد"}
          ]
        }$CONTENT$::jsonb,
        '{}'::jsonb, '{}'::jsonb, true, 5
    WHERE NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = target_id AND section_key = 'ov.statistics');

    -- =====================================================================
    -- 6. QUOTE  (section_key: ov.quote)
    -- =====================================================================
    INSERT INTO page_sections (id, page_id, section_type, section_key, title, description, content, settings, styles, visible, sort_order)
    SELECT gen_random_uuid(), target_id, 'custom', 'ov.quote', 'اقتباس ملهم', 'رسالة القيم',
        $CONTENT${
          "quote": "قيمنا ليست مجرد مبادئ مكتوبة، بل هي أسلوب عمل يرافق كل مبادرة وكل مشروع نقوم به.",
          "attribution": "الجمعية المغربية لهواة البحث والاستكشاف"
        }$CONTENT$::jsonb,
        '{}'::jsonb, '{}'::jsonb, true, 6
    WHERE NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = target_id AND section_key = 'ov.quote');

    -- =====================================================================
    -- 7. CTA  (section_key: ov.cta)
    -- =====================================================================
    INSERT INTO page_sections (id, page_id, section_type, section_key, title, description, content, settings, styles, visible, sort_order)
    SELECT gen_random_uuid(), target_id, 'cta', 'ov.cta', 'شاركنا هذه القيم', 'دعوة للانخراط والمشاركة',
        $CONTENT${
          "heading": "شاركنا هذه القيم وكن جزءاً من التغيير",
          "description": "انضم إلى شبكة الهواة والباحثين والمتطوعين الذين يجمعهم الإيمان بالقيم نفسها، وشارك معنا في بناء مستقبل أكثر مسؤولية واستدامة لبلادنا.",
          "buttonLabel": "انخرط معنا",
          "buttonUrl": "Join us/join-us-online.html",
          "backgroundImage": ""
        }$CONTENT$::jsonb,
        '{}'::jsonb, '{}'::jsonb, true, 7
    WHERE NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = target_id AND section_key = 'ov.cta');

    -- =====================================================================
    -- 8. FOOTER  (section_key: ov.footer)
    -- =====================================================================
    INSERT INTO page_sections (id, page_id, section_type, section_key, title, description, content, settings, styles, visible, sort_order)
    SELECT gen_random_uuid(), target_id, 'custom', 'ov.footer', 'Footer', 'تذييل الصفحة',
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
    WHERE NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = target_id AND section_key = 'ov.footer');

END;
$$;
