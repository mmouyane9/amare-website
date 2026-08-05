-- Seed: Home page content
-- Run this in the Supabase SQL editor AFTER the content_pages table migration.
-- Inserts the full Home page JSON content extracted from index.html.

INSERT INTO public.content_pages (
  page_key, title, slug, content, seo_title, seo_description, seo_keywords,
  og_image, status, is_homepage, sort_order, template
) VALUES (
  'home',
  'الرئيسية',
  '/',
  '{
  "sections": [
    {
      "id": "sec-home-hero",
      "type": "hero",
      "enabled": true,
      "order": 1,
      "data": {
        "heading": "اكتشف...\nشارك...\nوانضم إلى الجمعية المغربية",
        "subheading": "لهواة البحث والاستكشاف",
        "description": "شارك في المسابقة الوطنية، وانخرط إلكترونياً في الجمعية، أو جدد عضويتك بسهولة، واطلع على آخر الأنشطة والفعاليات والأخبار عبر المنصة الرسمية.",
        "backgroundImage": "",
        "buttons": [
          {"id": "btn-hero-competition", "label": "شارك في المسابقة", "url": "competition.html", "variant": "primary"},
          {"id": "btn-hero-join", "label": "الانخراط Online", "url": "Join us/join-us-online.html", "variant": "primary"},
          {"id": "btn-hero-renew", "label": "تجديد الانخراط", "url": "Join us/membership-renewal.html", "variant": "outline"}
        ]
      }
    },
    {
      "id": "sec-home-about",
      "type": "custom",
      "enabled": true,
      "order": 2,
      "data": {
        "_renderer": "about",
        "eyebrow": "من نحن",
        "heading": "نبني اليوم غدًا أكثر إشراقًا للأجيال القادمة",
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
          {"id": "btn-about-programs", "label": "تعرف على برامجنا", "url": "#services", "variant": "primary"},
          {"id": "btn-about-contact", "label": "تواصل معنا", "url": "#contact", "variant": "outline"}
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
      }
    },
    {
      "id": "sec-home-features",
      "type": "custom",
      "enabled": true,
      "order": 3,
      "data": {
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
      }
    },
    {
      "id": "sec-home-activities",
      "type": "custom",
      "enabled": true,
      "order": 4,
      "data": {
        "_renderer": "activitiesGrid",
        "heading": "أنشطتنا",
        "description": "اكتشف أبرز الأنشطة والبرامج التي تنظمها الجمعية على مدار السنة.",
        "cards": [
          {"title": "خرجات", "description": "رحلات ميدانية واستكشافية لاكتشاف الطبيعة والتراث المغربي.", "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=900&auto=format&fit=crop", "linkText": "اكتشف المزيد", "linkUrl": "#"},
          {"title": "مسابقات وراليات", "description": "تنظيم مسابقات وتحديات وراليات استكشافية لتعزيز روح الفريق.", "image": "https://www.kechpresse.com/wp-content/uploads/2022/01/%D8%B1%D8%A7%D9%84%D9%8A-%D8%AF%D9%83%D8%A7%D8%B1-%D8%B3%D8%B9%D9%88%D8%AF%D9%8A.jpg", "linkText": "اكتشف المزيد", "linkUrl": "#"},
          {"title": "تكوينات", "description": "دورات وورشات تكوينية في مجالات البحث والاستكشاف والإسعافات الأولية.", "image": "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=900&auto=format&fit=crop", "linkText": "اكتشف المزيد", "linkUrl": "#"},
          {"title": "معارض", "description": "معارض علمية وثقافية للتعريف بالتراث الطبيعي والاستكشاف.", "image": "https://www.aldeereh.com/wp-content/uploads/2024/09/%D8%A7%D9%84%D8%B2%D9%88%D8%A7%D8%B1-%D9%8A%D8%AA%D9%88%D8%A7%D9%81%D8%AF%D9%88%D9%86-%D8%B9%D9%84%D9%89-%D9%85%D8%B9%D8%B1%D8%B6-%D8%A7%D9%84%D8%B1%D9%8A%D8%A7%D8%B6-%D8%A7%D9%84%D8%AF%D9%88%D9%84%D9%8A-%D9%84%D9%84%D9%83%D8%AA%D8%A7%D8%A8-2.jpg", "linkText": "اكتشف المزيد", "linkUrl": "#"},
          {"title": "لقاءات", "description": "لقاءات علمية وتواصلية مع الخبراء والمهتمين بمجال الاستكشاف.", "image": "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=900&auto=format&fit=crop", "linkText": "اكتشف المزيد", "linkUrl": "#"},
          {"title": "حملات بيئية", "description": "حملات للتوعية البيئية وحماية الطبيعة والمحافظة على الموارد.", "image": "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=900&auto=format&fit=crop", "linkText": "اكتشف المزيد", "linkUrl": "#"}
        ]
      }
    },
    {
      "id": "sec-home-news",
      "type": "custom",
      "enabled": true,
      "order": 5,
      "data": {
        "_renderer": "newsGrid",
        "eyebrow": "آخر المستجدات",
        "heading": "أخبار وفعاليات الجمعية",
        "cards": [
          {"title": "إطلاق برنامج المنح الدراسية للموسم الجديد", "date": "12 يوليوز 2026", "badge": "تعليم", "image": "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=700&auto=format&fit=crop", "linkText": "اقرأ المزيد", "linkUrl": "#"},
          {"title": "قافلة طبية مجانية استفاد منها أكثر من 300 شخص", "date": "28 يونيو 2026", "badge": "صحة", "image": "https://images.unsplash.com/photo-1584515933487-779824d29309?q=80&w=700&auto=format&fit=crop", "linkText": "اقرأ المزيد", "linkUrl": "#"},
          {"title": "انطلاق ورشات التكوين المهني لفائدة 40 امرأة", "date": "05 يونيو 2026", "badge": "تمكين", "image": "https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=700&auto=format&fit=crop", "linkText": "اقرأ المزيد", "linkUrl": "#"}
        ]
      }
    },
    {
      "id": "sec-home-store",
      "type": "cta",
      "enabled": true,
      "order": 6,
      "data": {
        "heading": "ادعم رسالتنا\nبمنتجات حصرية",
        "description": "اكتشف مجموعة منتجات AMARE الحصرية. كل عملية شراء تساهم في دعم أنشطة الجمعية، وتمويل برامج البحث والاستكشاف، وحماية التراث الوطني.",
        "buttonLabel": "تسوق الآن",
        "buttonUrl": "#",
        "backgroundImage": "Amare files /amare-shop.png"
      }
    },
    {
      "id": "sec-home-newsletter",
      "type": "cta",
      "enabled": true,
      "order": 7,
      "data": {
        "heading": "اشترك في نشرتنا الإخبارية",
        "description": "كن أول من يعلم بآخر برامجنا وفعالياتنا وقصص النجاح التي نصنعها معًا.",
        "buttonLabel": "اشترك الآن",
        "buttonUrl": "#newsletter",
        "backgroundImage": ""
      }
    },
    {
      "id": "sec-home-footer",
      "type": "custom",
      "enabled": true,
      "order": 8,
      "data": {
        "_renderer": "footer",
        "brandName": "الجمعية المغربية لهواة البحث والاستكشاف",
        "brandLogo": "Amare%20files%20/logo.png",
        "description": "الجمعية المغربية لهواة البحث والاستكشاف هي إطار قانوني وطني يجمع الهواة تحت راية واحدة لصون التراث الوطني المغربي.",
        "socialLinks": [
          {"platform": "facebook", "url": "#"},
          {"platform": "instagram", "url": "#"},
          {"platform": "linkedin", "url": "#"}
        ],
        "quickLinksHeading": "روابط سريعة",
        "quickLinks": [
          {"label": "الرئيسية", "url": "#home"}, {"label": "اتصل بنا", "url": "#about"},
          {"label": "خدماتنا", "url": "#services"}, {"label": "الاخبار", "url": "#news"},
          {"label": "الارشيف", "url": "#newsletter"}, {"label": "الفروع الجهوية", "url": "#home"},
          {"label": "انخرط معنا", "url": "#about"}, {"label": "شركاؤنا", "url": "#services"},
          {"label": "انشطتنا", "url": "#news"}, {"label": "من نحن", "url": "#newsletter"}
        ],
        "programsHeading": "برامجنا",
        "programs": [
          {"label": "SOS Amare", "url": "#services"}, {"label": "متجر Amare", "url": "amare store/index.html"},
          {"label": "بيت المستكشف Amare", "url": "#services"}, {"label": "مجلة Amare", "url": "#services"},
          {"label": "أكاديمية Amare", "url": "#services"}, {"label": "النوادي", "url": "#services"},
          {"label": "المستشار القانوني", "url": "#services"}, {"label": "عقد التأمين", "url": "#services"}
        ],
        "contactHeading": "تواصل معنا",
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
      }
    }
  ]
}'::jsonb,
  'الجمعية المغربية لهواة البحث والاستكشاف | معًا نصنع أثرًا حقيقيًا',
  'الجمعية المغربية لهواة البحث والاستكشاف — جمعية مغربية تعمل على التنمية الاجتماعية والتعليم والتمكين الاقتصادي، بأكثر من 500 مستفيد و12 عامًا من العمل الميداني.',
  'جمعية, تنمية, تطوع, المغرب, عمل خيري, تمكين',
  'Amare%20files%20/logo.png',
  'published',
  true,
  1,
  'default'
)
ON CONFLICT (page_key)
DO UPDATE SET
  content       = EXCLUDED.content,
  seo_title     = EXCLUDED.seo_title,
  seo_description = EXCLUDED.seo_description,
  seo_keywords  = EXCLUDED.seo_keywords,
  og_image      = EXCLUDED.og_image,
  updated_at    = now();
