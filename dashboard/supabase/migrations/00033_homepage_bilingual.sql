-- ============================================================================
-- AMARE Homepage Bilingual Migration
-- Purpose: Convert all homepage page_sections from mono-lingual Arabic to
--          bilingual _ar/_fr format for all translatable text fields.
--
-- IDEMPOTENT: Safe to re-run. Uses UPDATE with sort_order matching.
-- ============================================================================

DO $$
DECLARE
    v_page_id UUID;
BEGIN

    SELECT id INTO v_page_id
    FROM pages
    WHERE slug = '/'
      AND status = 'published'
    LIMIT 1;

    IF v_page_id IS NULL THEN
        RAISE EXCEPTION 'Homepage page with slug=/ and status=published not found.';
    END IF;

    -- =====================================================================
    -- S1 — HERO (sort_order = 1)
    -- =====================================================================
    UPDATE page_sections
    SET content = $CONTENT${
      "heading_ar": "اكتشف...\nشارك...\nوانضم إلى الجمعية المغربية\nلهواة البحث والاستكشاف",
      "heading_fr": "Découvrez...\nParticipez...\nRejoignez l'association marocaine\ndes amateurs de recherche et d'exploration",
      "subheading_ar": "التسجيل في المسابقة الوطنية مفتوح الآن",
      "subheading_fr": "Les inscriptions au concours national sont ouvertes",
      "description_ar": "شارك في المسابقة الوطنية، وانخرط إلكترونياً في الجمعية، أو جدد عضويتك بسهولة، واطلع على آخر الأنشطة والفعاليات والأخبار عبر المنصة الرسمية.",
      "description_fr": "Participez au concours national, adhérez en ligne à l'association ou renouvelez facilement votre adhésion, et suivez les dernières activités, événements et actualités via la plateforme officielle.",
      "backgroundImage": "",
      "buttons": [
        {"id": "btn-hero-1", "label_ar": "شارك في المسابقة", "label_fr": "Participer au concours", "url": "competition.html", "variant": "secondary"},
        {"id": "btn-hero-2", "label_ar": "الانخراط Online", "label_fr": "Rejoindre l'association", "url": "Join us/join-us-online.html", "variant": "primary"},
        {"id": "btn-hero-3", "label_ar": "تجديد الانخراط", "label_fr": "Renouveler l'adhésion", "url": "Join us/membership-renewal.html", "variant": "outline"}
      ]
    }$CONTENT$::jsonb
    WHERE page_id = v_page_id AND sort_order = 1;

    -- =====================================================================
    -- S2 — ABOUT (sort_order = 2)
    -- =====================================================================
    UPDATE page_sections
    SET content = $CONTENT${
      "_renderer": "about",
      "eyebrow_ar": "من نحن",
      "eyebrow_fr": "À propos",
      "heading_ar": "نبني اليوم",
      "heading_fr": "Nous bâtissons aujourd'hui",
      "headingHighlight_ar": "غدًا",
      "headingHighlight_fr": "un avenir",
      "description_ar": "منذ 2014 ونحن نصنع الفرق في حياة آلاف الأسر المغربية",
      "description_fr": "Depuis 2014, nous faisons la différence dans la vie de milliers de familles marocaines",
      "paragraphs_ar": [
        "تأسست الجمعية المغربية لهواة البحث والاستكشاف سنة 2014 على يد مجموعة من الفاعلين المدنيين، بهدف الاستجابة للاحتياجات الحقيقية للمجتمعات المحلية عبر برامج ميدانية في التعليم والصحة والتمكين الاقتصادي.",
        "نؤمن بأن التغيير المستدام يبدأ من الأفراد، لذلك نعمل جنبًا إلى جنب مع السكان المحليين والمتطوعين والشركاء لبناء حلول تدوم أثرها لسنوات قادمة."
      ],
      "paragraphs_fr": [
        "L'association marocaine des amateurs de recherche et d'exploration a été fondée en 2014 par un groupe d'acteurs de la société civile, afin de répondre aux besoins réels des communautés locales à travers des programmes de terrain dans l'éducation, la santé et l'autonomisation économique.",
        "Nous croyons que le changement durable commence par les individus. C'est pourquoi nous travaillons main dans la main avec les populations locales, les bénévoles et les partenaires pour construire des solutions dont l'impact perdure pendant des années."
      ],
      "features": [
        {"title_ar": "برامج تعليمية", "title_fr": "Programmes éducatifs", "description_ar": "دعم مدرسي ومحو أمية لتمكين الأطفال والكبار من فرص تعليمية عادلة.", "description_fr": "Soutien scolaire et alphabétisation pour offrir aux enfants et aux adultes des chances éducatives équitables."},
        {"title_ar": "رعاية صحية", "title_fr": "Soins de santé", "description_ar": "قوافل طبية مجانية دورية لفائدة الأسر في المناطق النائية.", "description_fr": "Caravanes médicales gratuites et régulières au profit des familles des zones reculées."},
        {"title_ar": "تمكين اقتصادي", "title_fr": "Autonomisation économique", "description_ar": "تكوين مهني ودعم المشاريع المدرة للدخل للنساء والشباب.", "description_fr": "Formation professionnelle et soutien aux projets générateurs de revenus pour les femmes et les jeunes."}
      ],
      "buttons": [
        {"id": "btn-about-1", "label_ar": "تعرف على برامجنا", "label_fr": "Découvrir nos programmes", "url": "#services", "variant": "primary"},
        {"id": "btn-about-2", "label_ar": "تواصل معنا", "label_fr": "Contactez-nous", "url": "#contact", "variant": "outline"}
      ],
      "image": {
        "url": "https://images.unsplash.com/photo-1593113630400-ea4288922497?q=80&w=1000&auto=format&fit=crop",
        "alt_ar": "متطوعون ميدانيون",
        "alt_fr": "Bénévoles sur le terrain"
      },
      "stats": [
        {"value": "500", "suffix": "+", "label_ar": "مستفيد", "label_fr": "bénéficiaires"},
        {"value": "120", "suffix": "+", "label_ar": "متطوع", "label_fr": "bénévoles"},
        {"value": "12", "suffix": "+", "label_ar": "سنة", "label_fr": "années"}
      ]
    }$CONTENT$::jsonb
    WHERE page_id = v_page_id AND sort_order = 2;

    -- =====================================================================
    -- S3 — FEATURES GRID (sort_order = 3)
    -- =====================================================================
    UPDATE page_sections
    SET content = $CONTENT${
      "_renderer": "featuresGrid",
      "eyebrow_ar": "لماذا الجمعية المغربية لهواة البحث والاستكشاف",
      "eyebrow_fr": "Pourquoi l'association marocaine des amateurs de recherche et d'exploration",
      "heading_ar": "ما يميز عملنا",
      "heading_fr": "Ce qui nous distingue",
      "description_ar": "نجمع بين الخبرة الميدانية والشفافية الكاملة لضمان أثر حقيقي وملموس في كل مشروع ننفذه.",
      "description_fr": "Nous allions expertise de terrain et transparence totale pour garantir un impact réel et concret dans chaque projet.",
      "cards": [
        {"heading_ar": "برامج تعليمية", "heading_fr": "Programmes éducatifs", "description_ar": "دعم مدرسي ومحو أمية لتمكين الأطفال والكبار من فرص تعليمية عادلة.", "description_fr": "Soutien scolaire et alphabétisation pour offrir aux enfants et aux adultes des chances éducatives équitables."},
        {"heading_ar": "رعاية صحية", "heading_fr": "Soins de santé", "description_ar": "قوافل طبية مجانية دورية لفائدة الأسر في المناطق النائية.", "description_fr": "Caravanes médicales gratuites et régulières au profit des familles des zones reculées."},
        {"heading_ar": "تمكين اقتصادي", "heading_fr": "Autonomisation économique", "description_ar": "تكوين مهني ودعم للمشاريع المدرة للدخل للنساء والشباب.", "description_fr": "Formation professionnelle et soutien aux projets générateurs de revenus pour les femmes et les jeunes."},
        {"heading_ar": "شفافية كاملة", "heading_fr": "Transparence totale", "description_ar": "تقارير مالية وميدانية دورية متاحة لجميع الداعمين والشركاء.", "description_fr": "Rapports financiers et de terrain réguliers disponibles pour tous les donateurs et partenaires."}
      ]
    }$CONTENT$::jsonb
    WHERE page_id = v_page_id AND sort_order = 3;

    -- =====================================================================
    -- S4 — ACTIVITIES GRID (sort_order = 4)
    --     Already bilingual — keep exactly as in 00005 seed.
    -- =====================================================================
    UPDATE page_sections
    SET content = $CONTENT${
      "_renderer": "activitiesGrid",
      "heading_ar": "أنشطتنا",
      "heading_fr": "Nos activités",
      "description_ar": "اكتشف أبرز الأنشطة والبرامج التي تنظمها الجمعية على مدار السنة.",
      "description_fr": "Découvrez les principales activités et programmes organisés par l'association tout au long de l'année.",
      "cards": [
        {
          "title_ar": "خرجات",
          "title_fr": "Sorties",
          "description_ar": "رحلات ميدانية واستكشافية لاكتشاف الطبيعة والتراث المغربي.",
          "description_fr": "Excursions et explorations pour découvrir la nature et le patrimoine marocain.",
          "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=900&auto=format&fit=crop",
          "linkText_ar": "اكتشف المزيد",
          "linkText_fr": "En savoir plus",
          "linkUrl": "#"
        },
        {
          "title_ar": "مسابقات وراليات",
          "title_fr": "Compétitions et rallyes",
          "description_ar": "تنظيم مسابقات وتحديات وراليات استكشافية لتعزيز روح الفريق.",
          "description_fr": "Organisation de compétitions, défis et rallyes d'exploration pour renforcer l'esprit d'équipe.",
          "image": "https://www.kechpresse.com/wp-content/uploads/2022/01/%D8%B1%D8%A7%D9%84%D9%8A-%D8%AF%D9%83%D8%A7%D8%B1-%D8%B3%D8%B9%D9%88%D8%AF%D9%8A.jpg",
          "linkText_ar": "اكتشف المزيد",
          "linkText_fr": "En savoir plus",
          "linkUrl": "#"
        },
        {
          "title_ar": "تكوينات",
          "title_fr": "Formations",
          "description_ar": "دورات وورشات تكوينية في مجالات البحث والاستكشاف والإسعافات الأولية.",
          "description_fr": "Cours et ateliers de formation dans les domaines de la recherche, de l'exploration et des premiers secours.",
          "image": "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=900&auto=format&fit=crop",
          "linkText_ar": "اكتشف المزيد",
          "linkText_fr": "En savoir plus",
          "linkUrl": "#"
        },
        {
          "title_ar": "معارض",
          "title_fr": "Expositions",
          "description_ar": "معارض علمية وثقافية للتعريف بالتراث الطبيعي والاستكشاف.",
          "description_fr": "Expositions scientifiques et culturelles pour faire connaître le patrimoine naturel et l'exploration.",
          "image": "https://www.aldeereh.com/wp-content/uploads/2024/09/%D8%A7%D9%84%D8%B2%D9%88%D8%A7%D8%B1-%D9%8A%D8%AA%D9%88%D8%A7%D9%81%D8%AF%D9%88%D9%86-%D8%B9%D9%84%D9%89-%D9%85%D8%B9%D8%B1%D8%B6-%D8%A7%D9%84%D8%B1%D9%8A%D8%A7%D8%B6-%D8%A7%D9%84%D8%AF%D9%88%D9%84%D9%8A-%D9%84%D9%84%D9%83%D8%AA%D8%A7%D8%A8-2.jpg",
          "linkText_ar": "اكتشف المزيد",
          "linkText_fr": "En savoir plus",
          "linkUrl": "#"
        },
        {
          "title_ar": "لقاءات",
          "title_fr": "Rencontres",
          "description_ar": "لقاءات علمية وتواصلية مع الخبراء والمهتمين بمجال الاستكشاف.",
          "description_fr": "Rencontres scientifiques et de communication avec les experts et les passionnés du domaine de l'exploration.",
          "image": "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=900&auto=format&fit=crop",
          "linkText_ar": "اكتشف المزيد",
          "linkText_fr": "En savoir plus",
          "linkUrl": "#"
        },
        {
          "title_ar": "حملات بيئية",
          "title_fr": "Campagnes environnementales",
          "description_ar": "حملات للتوعية البيئية وحماية الطبيعة والمحافظة على الموارد.",
          "description_fr": "Campagnes de sensibilisation environnementale, de protection de la nature et de préservation des ressources.",
          "image": "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=900&auto=format&fit=crop",
          "linkText_ar": "اكتشف المزيد",
          "linkText_fr": "En savoir plus",
          "linkUrl": "#"
        }
      ]
    }$CONTENT$::jsonb
    WHERE page_id = v_page_id AND sort_order = 4;

    -- =====================================================================
    -- S5 — NEWS GRID (sort_order = 5)
    -- =====================================================================
    UPDATE page_sections
    SET content = $CONTENT${
      "_renderer": "newsGrid",
      "eyebrow_ar": "آخر المستجدات",
      "eyebrow_fr": "Dernières nouvelles",
      "heading_ar": "أخبار وفعاليات الجمعية",
      "heading_fr": "Actualités et événements de l'association",
      "cards": [
        {
          "title_ar": "إطلاق برنامج المنح الدراسية للموسم الجديد",
          "title_fr": "Lancement du programme de bourses d'études pour la nouvelle saison",
          "date": "12 يوليوز 2026",
          "badge_ar": "تعليم",
          "badge_fr": "Éducation",
          "image": "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=700&auto=format&fit=crop",
          "linkText_ar": "اقرأ المزيد",
          "linkText_fr": "Lire la suite",
          "linkUrl": "#"
        },
        {
          "title_ar": "قافلة طبية مجانية استفاد منها أكثر من 300 شخص",
          "title_fr": "Une caravane médicale gratuite au profit de plus de 300 personnes",
          "date": "28 يونيو 2026",
          "badge_ar": "صحة",
          "badge_fr": "Santé",
          "image": "https://images.unsplash.com/photo-1584515933487-779824d29309?q=80&w=700&auto=format&fit=crop",
          "linkText_ar": "اقرأ المزيد",
          "linkText_fr": "Lire la suite",
          "linkUrl": "#"
        },
        {
          "title_ar": "انطلاق ورشات التكوين المهني لفائدة 40 امرأة",
          "title_fr": "Démarrage des ateliers de formation professionnelle pour 40 femmes",
          "date": "05 يونيو 2026",
          "badge_ar": "تمكين",
          "badge_fr": "Autonomisation",
          "image": "https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=700&auto=format&fit=crop",
          "linkText_ar": "اقرأ المزيد",
          "linkText_fr": "Lire la suite",
          "linkUrl": "#"
        }
      ]
    }$CONTENT$::jsonb
    WHERE page_id = v_page_id AND sort_order = 5;

    -- =====================================================================
    -- S6 — STORE CTA (sort_order = 6)
    -- =====================================================================
    UPDATE page_sections
    SET content = $CONTENT${
      "eyebrow_ar": "متجر AMARE",
      "eyebrow_fr": "Boutique AMARE",
      "heading_ar": "ادعم رسالتنا\nبمنتجات حصرية",
      "heading_fr": "Soutenez notre mission avec des produits exclusifs",
      "description_ar": "اكتشف مجموعة منتجات AMARE الحصرية. كل عملية شراء تساهم في دعم أنشطة الجمعية، وتمويل برامج البحث والاستكشاف، وحماية التراث الوطني.",
      "description_fr": "Découvrez la gamme exclusive de produits AMARE. Chaque achat contribue à soutenir les activités de l'association, à financer les programmes de recherche et d'exploration et à protéger le patrimoine national.",
      "buttonLabel_ar": "تسوق الآن",
      "buttonLabel_fr": "Acheter maintenant",
      "buttonUrl": "amare store/index.html",
      "backgroundImage": "Amare files /amare-shop.png"
    }$CONTENT$::jsonb
    WHERE page_id = v_page_id AND sort_order = 6;

    -- =====================================================================
    -- S7 — NEWSLETTER CTA (sort_order = 7)
    -- =====================================================================
    UPDATE page_sections
    SET content = $CONTENT${
      "heading_ar": "اشترك في نشرتنا الإخبارية",
      "heading_fr": "Abonnez-vous à notre newsletter",
      "description_ar": "كن أول من يعلم بآخر برامجنا وفعالياتنا وقصص النجاح التي نصنعها معًا.",
      "description_fr": "Soyez le premier informé de nos programmes, événements et réussites construits ensemble.",
      "buttonLabel_ar": "اشترك الآن",
      "buttonLabel_fr": "S'abonner",
      "buttonUrl": "#newsletter",
      "backgroundImage": "",
      "placeholder_ar": "بريدك الإلكتروني",
      "placeholder_fr": "Votre e-mail"
    }$CONTENT$::jsonb
    WHERE page_id = v_page_id AND sort_order = 7;

    -- =====================================================================
    -- S8 — FOOTER (sort_order = 8)
    -- =====================================================================
    UPDATE page_sections
    SET content = $CONTENT${
      "_renderer": "footer",
      "brandName_ar": "الجمعية المغربية لهواة البحث والاستكشاف",
      "brandName_fr": "Association Marocaine des Amateurs de Recherche et d'Exploration",
      "brandLogo": "Amare files /logo.png",
      "description_ar": "الجمعية المغربية لهواة البحث والاستكشاف هي إطار قانوني وطني يجمع الهواة تحت راية واحدة لصون التراث الوطني المغربي.",
      "description_fr": "L'Association Marocaine des Amateurs de Recherche et d'Exploration est un cadre juridique national qui rassemble les passionnés sous une seule bannière pour préserver le patrimoine national marocain.",
      "socialLinks": [
        {"platform": "فيسبوك", "url": "#"},
        {"platform": "إنستغرام", "url": "#"},
        {"platform": "لينكدإن", "url": "#"}
      ],
      "quickLinksHeading_ar": "روابط سريعة",
      "quickLinksHeading_fr": "Liens rapides",
      "quickLinks": [
        {"label_ar": "الرئيسية", "label_fr": "Accueil", "url": "#home"},
        {"label_ar": "اتصل بنا", "label_fr": "Contactez-nous", "url": "#about"},
        {"label_ar": "خدماتنا", "label_fr": "Nos services", "url": "#services"},
        {"label_ar": "الاخبار", "label_fr": "Actualités", "url": "#news"},
        {"label_ar": "الارشيف", "label_fr": "Archives", "url": "#newsletter"},
        {"label_ar": "الفروع الجهوية", "label_fr": "Branches régionales", "url": "#home"},
        {"label_ar": "انخرط معنا", "label_fr": "Rejoignez-nous", "url": "#about"},
        {"label_ar": "شركاؤنا", "label_fr": "Nos partenaires", "url": "#services"},
        {"label_ar": "انشطتنا", "label_fr": "Nos activités", "url": "#news"},
        {"label_ar": "من نحن", "label_fr": "Qui sommes-nous", "url": "#newsletter"}
      ],
      "programsHeading_ar": "برامجنا",
      "programsHeading_fr": "Nos programmes",
      "programs": [
        {"label_ar": "SOS Amare", "label_fr": "SOS Amare", "url": "#services"},
        {"label_ar": "متجر Amare", "label_fr": "Boutique Amare", "url": "amare store/index.html"},
        {"label_ar": "بيت المستكشف Amare", "label_fr": "Maison de l'explorateur Amare", "url": "#services"},
        {"label_ar": "مجلة Amare", "label_fr": "Magazine Amare", "url": "#services"},
        {"label_ar": "أكاديمية Amare", "label_fr": "Académie Amare", "url": "#services"},
        {"label_ar": "النوادي", "label_fr": "Clubs", "url": "#services"},
        {"label_ar": "المستشار القانوني", "label_fr": "Conseiller juridique", "url": "#services"},
        {"label_ar": "عقد التأمين", "label_fr": "Contrat d'assurance", "url": "#services"}
      ],
      "contactHeading_ar": "اتصل بنا",
      "contactHeading_fr": "Contactez-nous",
      "contact": {
        "address_ar": "ص.ب 749 أيت ملول 86150",
        "address_fr": "B.P. 749 Aït Melloul 86150",
        "phone": "+212 684869996",
        "email": "association.amare.agadir@gmail.com"
      },
      "map": {
        "heading_ar": "موقعنا",
        "heading_fr": "Notre localisation",
        "title_ar": "موقع الجمعية على الخريطة",
        "title_fr": "Localisation de l'association sur la carte",
        "buttonLabel_ar": "فتح في خرائط جوجل",
        "buttonLabel_fr": "Ouvrir dans Google Maps",
        "label": "📍 Ait Melloul, Agadir",
        "lat": "30.385528",
        "lon": "-9.448611"
      },
      "copyright_ar": "© 2026 الجمعية المغربية لهواة البحث والاستكشاف. جميع الحقوق محفوظة.",
      "copyright_fr": "© 2026 Association Marocaine des Amateurs de Recherche et d'Exploration. Tous droits réservés.",
      "bottomLinks": [
        {"label_ar": "سياسة الخصوصية", "label_fr": "Politique de confidentialité", "url": "#"},
        {"label_ar": "الشروط والأحكام", "label_fr": "Conditions générales", "url": "#"}
      ]
    }$CONTENT$::jsonb
    WHERE page_id = v_page_id AND sort_order = 8;

    RAISE NOTICE 'Migration 00033: Homepage sections converted to bilingual _ar/_fr format. Page ID: %', v_page_id;

END;
$$;


