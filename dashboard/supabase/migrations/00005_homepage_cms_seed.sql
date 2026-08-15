-- ============================================================================
-- AMARE Homepage CMS Migration
-- Purpose: Populate the homepage (slug='/') with the correct page_sections
--          matching the actual index.html structure, using valid section types.
--
-- SAFE: Idempotent. Running it multiple times will first delete old sections
--       for the homepage then re-insert. Other pages are NOT affected.
--
-- Run this in Supabase SQL Editor.
-- ============================================================================

DO $$
DECLARE
    home_id UUID;
BEGIN

    -- =====================================================================
    -- 1. Find the homepage page
    -- =====================================================================
    SELECT id INTO home_id FROM pages WHERE slug = '/' LIMIT 1;

    IF home_id IS NULL THEN
        RAISE EXCEPTION 'Homepage page not found. Run 00002_pages_manager.sql seed first to create the pages table rows.';
    END IF;

    -- =====================================================================
    -- 2. Remove ALL existing homepage sections (idempotent — safe to re-run)
    -- =====================================================================
    DELETE FROM page_sections WHERE page_id = home_id;

    -- =====================================================================
    -- 3. Insert sections with VALID section_types matching the Content Editor
    --
    -- Valid types: hero, heading, text, image, buttons, statistics,
    --              gallery, cta, faq, video, custom
    --
    -- For complex sections, we use 'custom' with a _renderer key in content
    -- that maps to the appropriate custom editor.
    -- =====================================================================

    -- =====================================================================
    -- S1 — HERO
    -- =====================================================================
    INSERT INTO page_sections (id, page_id, section_type, section_key, title, description, content, settings, styles, visible, sort_order)
    VALUES (
        gen_random_uuid(), home_id,
        'hero', NULL,
        'Hero', 'القسم الرئيسي للصفحة',
        $CONTENT${
          "heading": "اكتشف...\nشارك...\nوانضم إلى الجمعية المغربية\nلهواة البحث والاستكشاف",
          "subheading": "التسجيل في المسابقة الوطنية مفتوح الآن",
          "description": "شارك في المسابقة الوطنية، وانخرط إلكترونياً في الجمعية، أو جدد عضويتك بسهولة، واطلع على آخر الأنشطة والفعاليات والأخبار عبر المنصة الرسمية.",
          "backgroundImage": "",
          "buttons": [
            {"id": "btn-hero-1", "label": "شارك في المسابقة", "url": "competition.html", "variant": "secondary"},
            {"id": "btn-hero-2", "label": "الانخراط Online", "url": "Join us/join-us-online.html", "variant": "primary"},
            {"id": "btn-hero-3", "label": "تجديد الانخراط", "url": "Join us/membership-renewal.html", "variant": "outline"}
          ]
        }$CONTENT$::jsonb,
        '{}'::jsonb, '{}'::jsonb,
        true, 1
    );

    -- =====================================================================
    -- S2 — ABOUT / من نحن  (custom, _renderer: "about")
    -- =====================================================================
    INSERT INTO page_sections (id, page_id, section_type, section_key, title, description, content, settings, styles, visible, sort_order)
    VALUES (
        gen_random_uuid(), home_id,
        'custom', NULL,
        'من نحن', 'قسم التعريف بالجمعية',
        $CONTENT${
          "_renderer": "about",
          "eyebrow": "من نحن",
          "heading": "نبني اليوم",
          "headingHighlight": "غدًا",
          "description": "منذ 2014 ونحن نصنع الفرق في حياة آلاف الأسر المغربية",
          "paragraphs": [
            "تأسست الجمعية المغربية لهواة البحث والاستكشاف سنة 2014 على يد مجموعة من الفاعلين المدنيين، بهدف الاستجابة للاحتياجات الحقيقية للمجتمعات المحلية عبر برامج ميدانية في التعليم والصحة والتمكين الاقتصادي.",
            "نؤمن بأن التغيير المستدام يبدأ من الأفراد، لذلك نعمل جنبًا إلى جنب مع السكان المحليين والمتطوعين والشركاء لبناء حلول تدوم أثرها لسنوات قادمة."
          ],
          "features": [
            {"title": "برامج تعليمية", "description": "دعم مدرسي ومحو أمية لتمكين الأطفال والكبار من فرص تعليمية عادلة."},
            {"title": "رعاية صحية", "description": "قوافل طبية مجانية دورية لفائدة الأسر في المناطق النائية."},
            {"title": "تمكين اقتصادي", "description": "تكوين مهني ودعم المشاريع المدرة للدخل للنساء والشباب."}
          ],
          "buttons": [
            {"id": "btn-about-1", "label": "تعرف على برامجنا", "url": "#services", "variant": "primary"},
            {"id": "btn-about-2", "label": "تواصل معنا", "url": "#contact", "variant": "outline"}
          ],
          "image": {
            "url": "https://images.unsplash.com/photo-1593113630400-ea4288922497?q=80&w=1000&auto=format&fit=crop",
            "alt": "متطوعون ميدانيون"
          },
          "stats": [
            {"value": "500", "suffix": "+", "label": "مستفيد"},
            {"value": "120", "suffix": "+", "label": "متطوع"},
            {"value": "12", "suffix": "+", "label": "سنة"}
          ]
        }$CONTENT$::jsonb,
        '{}'::jsonb, '{}'::jsonb,
        true, 2
    );

    -- =====================================================================
    -- S3 — FEATURES / ما يميز عملنا  (custom, _renderer: "featuresGrid")
    -- =====================================================================
    INSERT INTO page_sections (id, page_id, section_type, section_key, title, description, content, settings, styles, visible, sort_order)
    VALUES (
        gen_random_uuid(), home_id,
        'custom', NULL,
        'ما يميز عملنا', 'قسم المميزات',
        $CONTENT${
          "_renderer": "featuresGrid",
          "eyebrow": "لماذا الجمعية المغربية لهواة البحث والاستكشاف",
          "heading": "ما يميز عملنا",
          "description": "نجمع بين الخبرة الميدانية والشفافية الكاملة لضمان أثر حقيقي وملموس في كل مشروع ننفذه.",
          "cards": [
            {"heading": "برامج تعليمية", "description": "دعم مدرسي ومحو أمية لتمكين الأطفال والكبار من فرص تعليمية عادلة."},
            {"heading": "رعاية صحية", "description": "قوافل طبية مجانية دورية لفائدة الأسر في المناطق النائية."},
            {"heading": "تمكين اقتصادي", "description": "تكوين مهني ودعم للمشاريع المدرة للدخل للنساء والشباب."},
            {"heading": "شفافية كاملة", "description": "تقارير مالية وميدانية دورية متاحة لجميع الداعمين والشركاء."}
          ]
        }$CONTENT$::jsonb,
        '{}'::jsonb, '{}'::jsonb,
        true, 3
    );

    -- =====================================================================
    -- S4 — ACTIVITIES / أنشطتنا  (custom, _renderer: "activitiesGrid")
    -- =====================================================================
    INSERT INTO page_sections (id, page_id, section_type, section_key, title, description, content, settings, styles, visible, sort_order)
    VALUES (
        gen_random_uuid(), home_id,
        'custom', NULL,
        'أنشطتنا', 'قسم الأنشطة والبرامج',
        $CONTENT${
          "_renderer": "activitiesGrid",
          "heading": "أنشطتنا",
          "description": "اكتشف أبرز الأنشطة والبرامج التي تنظمها الجمعية على مدار السنة.",
          "cards": [
            {
              "title": "خرجات",
              "description": "رحلات ميدانية واستكشافية لاكتشاف الطبيعة والتراث المغربي.",
              "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=900&auto=format&fit=crop",
              "linkText": "اكتشف المزيد",
              "linkUrl": "#"
            },
            {
              "title": "مسابقات وراليات",
              "description": "تنظيم مسابقات وتحديات وراليات استكشافية لتعزيز روح الفريق.",
              "image": "https://www.kechpresse.com/wp-content/uploads/2022/01/%D8%B1%D8%A7%D9%84%D9%8A-%D8%AF%D9%83%D8%A7%D8%B1-%D8%B3%D8%B9%D9%88%D8%AF%D9%8A.jpg",
              "linkText": "اكتشف المزيد",
              "linkUrl": "#"
            },
            {
              "title": "تكوينات",
              "description": "دورات وورشات تكوينية في مجالات البحث والاستكشاف والإسعافات الأولية.",
              "image": "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=900&auto=format&fit=crop",
              "linkText": "اكتشف المزيد",
              "linkUrl": "#"
            },
            {
              "title": "معارض",
              "description": "معارض علمية وثقافية للتعريف بالتراث الطبيعي والاستكشاف.",
              "image": "https://www.aldeereh.com/wp-content/uploads/2024/09/%D8%A7%D9%84%D8%B2%D9%88%D8%A7%D8%B1-%D9%8A%D8%AA%D9%88%D8%A7%D9%81%D8%AF%D9%88%D9%86-%D8%B9%D9%84%D9%89-%D9%85%D8%B9%D8%B1%D8%B6-%D8%A7%D9%84%D8%B1%D9%8A%D8%A7%D8%B6-%D8%A7%D9%84%D8%AF%D9%88%D9%84%D9%8A-%D9%84%D9%84%D9%83%D8%AA%D8%A7%D8%A8-2.jpg",
              "linkText": "اكتشف المزيد",
              "linkUrl": "#"
            },
            {
              "title": "لقاءات",
              "description": "لقاءات علمية وتواصلية مع الخبراء والمهتمين بمجال الاستكشاف.",
              "image": "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=900&auto=format&fit=crop",
              "linkText": "اكتشف المزيد",
              "linkUrl": "#"
            },
            {
              "title": "حملات بيئية",
              "description": "حملات للتوعية البيئية وحماية الطبيعة والمحافظة على الموارد.",
              "image": "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=900&auto=format&fit=crop",
              "linkText": "اكتشف المزيد",
              "linkUrl": "#"
            }
          ]
        }$CONTENT$::jsonb,
        '{}'::jsonb, '{}'::jsonb,
        true, 4
    );

    -- =====================================================================
    -- S5 — NEWS / آخر المستجدات  (custom, _renderer: "newsGrid")
    -- =====================================================================
    INSERT INTO page_sections (id, page_id, section_type, section_key, title, description, content, settings, styles, visible, sort_order)
    VALUES (
        gen_random_uuid(), home_id,
        'custom', NULL,
        'آخر المستجدات', 'قسم الأخبار والفعاليات',
        $CONTENT${
          "_renderer": "newsGrid",
          "eyebrow": "آخر المستجدات",
          "heading": "أخبار وفعاليات الجمعية",
          "cards": [
            {
              "title": "إطلاق برنامج المنح الدراسية للموسم الجديد",
              "date": "12 يوليوز 2026",
              "badge": "تعليم",
              "image": "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=700&auto=format&fit=crop",
              "linkText": "اقرأ المزيد",
              "linkUrl": "#"
            },
            {
              "title": "قافلة طبية مجانية استفاد منها أكثر من 300 شخص",
              "date": "28 يونيو 2026",
              "badge": "صحة",
              "image": "https://images.unsplash.com/photo-1584515933487-779824d29309?q=80&w=700&auto=format&fit=crop",
              "linkText": "اقرأ المزيد",
              "linkUrl": "#"
            },
            {
              "title": "انطلاق ورشات التكوين المهني لفائدة 40 امرأة",
              "date": "05 يونيو 2026",
              "badge": "تمكين",
              "image": "https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=700&auto=format&fit=crop",
              "linkText": "اقرأ المزيد",
              "linkUrl": "#"
            }
          ]
        }$CONTENT$::jsonb,
        '{}'::jsonb, '{}'::jsonb,
        true, 5
    );

    -- =====================================================================
    -- S6 — STORE CTA / متجر AMARE  (cta)
    -- =====================================================================
    INSERT INTO page_sections (id, page_id, section_type, section_key, title, description, content, settings, styles, visible, sort_order)
    VALUES (
        gen_random_uuid(), home_id,
        'cta', NULL,
        'متجر AMARE', 'قسم دعوة لزيارة المتجر',
        $CONTENT${
          "heading": "ادعم رسالتنا\nبمنتجات حصرية",
          "description": "اكتشف مجموعة منتجات AMARE الحصرية. كل عملية شراء تساهم في دعم أنشطة الجمعية، وتمويل برامج البحث والاستكشاف، وحماية التراث الوطني.",
          "buttonLabel": "تسوق الآن",
          "buttonUrl": "amare store/index.html",
          "backgroundImage": "Amare files /amare-shop.png"
        }$CONTENT$::jsonb,
        '{}'::jsonb, '{}'::jsonb,
        true, 6
    );

    -- =====================================================================
    -- S7 — NEWSLETTER CTA / النشرة الإخبارية  (cta)
    -- =====================================================================
    INSERT INTO page_sections (id, page_id, section_type, section_key, title, description, content, settings, styles, visible, sort_order)
    VALUES (
        gen_random_uuid(), home_id,
        'cta', NULL,
        'النشرة الإخبارية', 'قسم الاشتراك في النشرة الإخبارية',
        $CONTENT${
          "heading": "اشترك في نشرتنا الإخبارية",
          "description": "كن أول من يعلم بآخر برامجنا وفعالياتنا وقصص النجاح التي نصنعها معًا.",
          "buttonLabel": "اشترك الآن",
          "buttonUrl": "#newsletter",
          "backgroundImage": ""
        }$CONTENT$::jsonb,
        '{}'::jsonb, '{}'::jsonb,
        true, 7
    );

    -- =====================================================================
    -- S8 — FOOTER  (custom, _renderer: "footer")
    -- =====================================================================
    INSERT INTO page_sections (id, page_id, section_type, section_key, title, description, content, settings, styles, visible, sort_order)
    VALUES (
        gen_random_uuid(), home_id,
        'custom', NULL,
        'Footer', 'تذييل الصفحة',
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
            {"label": "الرئيسية", "url": "/index.html"},
            {"label": "اتصل بنا", "url": "#about"},
            {"label": "خدماتنا", "url": "#services"},
            {"label": "الاخبار", "url": "#news"},
            {"label": "الارشيف", "url": "#newsletter"},
            {"label": "الفروع الجهوية", "url": "#home"},
            {"label": "انخرط معنا", "url": "#about"},
            {"label": "شركاؤنا", "url": "#services"},
            {"label": "انشطتنا", "url": "#news"},
            {"label": "من نحن", "url": "#newsletter"}
          ],
          "programsHeading": "برامجنا",
          "programs": [
            {"label": "SOS Amare", "url": "#services"},
            {"label": "متجر Amare", "url": "amare store/index.html"},
            {"label": "بيت المستكشف Amare", "url": "#services"},
            {"label": "مجلة Amare", "url": "#services"},
            {"label": "أكاديمية Amare", "url": "#services"},
            {"label": "النوادي", "url": "#services"},
            {"label": "المستشار القانوني", "url": "#services"},
            {"label": "عقد التأمين", "url": "#services"}
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
        '{}'::jsonb, '{}'::jsonb,
        true, 8
    );

END;
$$;

-- ============================================================================
-- VALIDATION QUERIES — Run after the migration to verify
-- ============================================================================

-- 1. Confirm homepage exists
SELECT id, slug, title, status, template, is_homepage
FROM pages
WHERE slug = '/';

-- 2. Confirm section count and types
SELECT
    ps.section_type,
    ps.title,
    ps.sort_order,
    ps.visible,
    CASE
        WHEN section_type = 'custom' THEN ps.content->>'_renderer'
        ELSE NULL
    END AS renderer,
    -- Show first few content keys for quick verification
    (SELECT string_agg(key, ', ') FROM jsonb_object_keys(ps.content) AS key) AS content_fields
FROM page_sections ps
JOIN pages p ON p.id = ps.page_id
WHERE p.slug = '/'
ORDER BY ps.sort_order;

-- 3. Total section count
SELECT COUNT(*) AS total_sections
FROM page_sections ps
JOIN pages p ON p.id = ps.page_id
WHERE p.slug = '/';

-- 4. Verify hero heading (quick content check)
SELECT ps.content->>'heading' AS hero_heading
FROM page_sections ps
JOIN pages p ON p.id = ps.page_id
WHERE p.slug = '/' AND ps.section_type = 'hero';

-- 5. Verify activity card count
SELECT
    ps.section_type,
    ps.content->>'_renderer' AS renderer,
    jsonb_array_length(ps.content->'cards') AS card_count
FROM page_sections ps
JOIN pages p ON p.id = ps.page_id
WHERE p.slug = '/' AND ps.section_type = 'custom';
