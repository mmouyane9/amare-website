/**
 * Home page content — extracted from /index.html
 *
 * This file is the JSON representation of the current live Home page.
 * Every section, heading, paragraph, button, image, card, and link
 * is captured exactly as it appears in the source HTML.
 *
 * Section types used:
 *   hero   — Hero banner with heading, buttons, background
 *   cta    — Call-to-action banner
 *   custom — Complex sections with cards, galleries, or mixed layouts
 *
 * All translatable text fields use _ar / _fr suffix pairs (bilingual).
 */

import type { PageSection } from '@/types/content'

// ---------------------------------------------------------------------------
// CMS JSON — exact representation of the live Home page (index.html)
// ---------------------------------------------------------------------------

export const HOME_PAGE_SECTIONS: PageSection[] = [
    // =====================================================================
    // 1. HERO  (index.html lines 263-297, section#home)
    // =====================================================================
    {
      id: 'sec-home-hero',
      type: 'hero',
      enabled: true,
      order: 1,
      data: {
        heading_ar: 'اكتشف...\nشارك...\nوانضم إلى الجمعية المغربية\nلهواة البحث والاستكشاف',
        heading_fr: 'Découvrez...\nParticipez...\nEt rejoignez l\'Association Marocaine\ndes Amateurs de Recherche et d\'Exploration',
        subheading_ar: 'التسجيل في المسابقة الوطنية مفتوح الآن',
        subheading_fr: 'Les inscriptions au concours national sont ouvertes',
        description_ar:
          'شارك في المسابقة الوطنية، وانخرط إلكترونياً في الجمعية، أو جدد عضويتك بسهولة، واطلع على آخر الأنشطة والفعاليات والأخبار عبر المنصة الرسمية.',
        description_fr:
          'Participez au concours national, adhérez en ligne à l\'association, ou renouvelez votre adhésion facilement, et découvrez les dernières activités, événements et actualités via la plateforme officielle.',
        backgroundImage: '',
        buttons: [
          {
            id: 'btn-hero-competition',
            label_ar: 'شارك في المسابقة',
            label_fr: 'Participer au concours',
            url: 'competition.html',
            variant: 'primary',
          },
          {
            id: 'btn-hero-join',
            label_ar: 'انخرط في الجمعية',
            label_fr: 'Rejoindre l\'association',
            url: 'Join us/join-us-online.html',
            variant: 'primary',
          },
          {
            id: 'btn-hero-renew',
            label_ar: 'تجديد الانخراط',
            label_fr: 'Renouveler l\'adhésion',
            url: 'Join us/membership-renewal.html',
            variant: 'outline',
          },
        ],
      },
    },

    // =====================================================================
    // 2. ABOUT / من نحن  (index.html lines 300-394, section#about)
    // =====================================================================
    {
      id: 'sec-home-about',
      type: 'custom',
      enabled: true,
      order: 2,
      data: {
        _renderer: 'about',
        eyebrow_ar: 'من نحن',
        eyebrow_fr: 'À propos',
        heading_ar: 'نبني اليوم غدًا أكثر إشراقًا للأجيال القادمة',
        heading_fr: 'Nous bâtissons aujourd\'hui un avenir plus radieux pour les générations futures',
        headingHighlight_ar: 'غدًا',
        headingHighlight_fr: 'un avenir',
        description_ar: 'منذ 2014 ونحن نصنع الفرق في حياة آلاف الأسر المغربية',
        description_fr: 'Depuis 2014, nous faisons la différence dans la vie de milliers de familles marocaines',
        paragraphs_ar: [
          'تأسست الجمعية المغربية لهواة البحث والاستكشاف سنة 2014 على يد مجموعة من الفاعلين المدنيين، بهدف الاستجابة للاحتياجات الحقيقية للمجتمعات المحلية عبر برامج ميدانية في التعليم والصحة والتمكين الاقتصادي.',
          'نؤمن بأن التغيير المستدام يبدأ من الأفراد، لذلك نعمل جنبًا إلى جنب مع السكان المحليين والمتطوعين والشركاء لبناء حلول تدوم أثرها لسنوات قادمة.',
        ],
        paragraphs_fr: [
          'L\'association marocaine des amateurs de recherche et d\'exploration a été fondée en 2014 par un groupe d\'acteurs de la société civile, afin de répondre aux besoins réels des communautés locales à travers des programmes de terrain dans l\'éducation, la santé et l\'autonomisation économique.',
          'Nous croyons que le changement durable commence par les individus. C\'est pourquoi nous travaillons main dans la main avec les populations locales, les bénévoles et les partenaires pour construire des solutions dont l\'impact perdure pendant des années.',
        ],
        features: [
          {
            title_ar: 'برامج تعليمية',
            title_fr: 'Programmes éducatifs',
            description_ar: 'دعم مدرسي ومحو أمية لتمكين الأطفال والكبار من فرص تعليمية عادلة.',
            description_fr: 'Soutien scolaire et alphabétisation pour offrir aux enfants et aux adultes des chances éducatives équitables.',
          },
          {
            title_ar: 'رعاية صحية',
            title_fr: 'Soins de santé',
            description_ar: 'قوافل طبية مجانية دورية لفائدة الأسر في المناطق النائية.',
            description_fr: 'Caravanes médicales gratuites et régulières au profit des familles des zones reculées.',
          },
          {
            title_ar: 'تمكين اقتصادي',
            title_fr: 'Autonomisation économique',
            description_ar: 'تكوين مهني ودعم المشاريع المدرة للدخل للنساء والشباب.',
            description_fr: 'Formation professionnelle et soutien aux projets générateurs de revenus pour les femmes et les jeunes.',
          },
        ],
        buttons: [
          {
            id: 'btn-about-programs',
            label_ar: 'تعرف على برامجنا',
            label_fr: 'Découvrir nos programmes',
            url: '#services',
            variant: 'primary',
          },
          {
            id: 'btn-about-contact',
            label_ar: 'تواصل معنا',
            label_fr: 'Contactez-nous',
            url: '#contact',
            variant: 'outline',
          },
        ],
        image: {
          url: 'https://images.unsplash.com/photo-1593113630400-ea4288922497?q=80&w=1000&auto=format&fit=crop',
          alt_ar: 'متطوعون ميدانيون',
          alt_fr: 'Bénévoles sur le terrain',
        },
        stats: [
          { value: '500', suffix: '+', label_ar: 'مستفيد', label_fr: 'bénéficiaires' },
          { value: '120', suffix: '+', label_ar: 'متطوع', label_fr: 'bénévoles' },
          { value: '12', suffix: '+', label_ar: 'سنة', label_fr: 'années' },
        ],
      },
    },

    // =====================================================================
    // 3. FEATURES / ما يميزنا  (index.html lines 397-436, section#features)
    // =====================================================================
    {
      id: 'sec-home-features',
      type: 'custom',
      enabled: true,
      order: 3,
      data: {
        _renderer: 'featuresGrid',
        eyebrow_ar: 'لماذا الجمعية المغربية لهواة البحث والاستكشاف',
        eyebrow_fr: 'Pourquoi l\'association marocaine des amateurs de recherche et d\'exploration',
        heading_ar: 'ما يميز عملنا',
        heading_fr: 'Ce qui nous distingue',
        description_ar:
          'نجمع بين الخبرة الميدانية والشفافية الكاملة لضمان أثر حقيقي وملموس في كل مشروع ننفذه.',
        description_fr:
          'Nous allions expertise de terrain et transparence totale pour garantir un impact réel et concret dans chaque projet.',
        cards: [
          {
            heading_ar: 'برامج تعليمية',
            heading_fr: 'Programmes éducatifs',
            description_ar: 'دعم مدرسي ومحو أمية لتمكين الأطفال والكبار من فرص تعليمية عادلة.',
            description_fr: 'Soutien scolaire et alphabétisation pour offrir aux enfants et aux adultes des chances éducatives équitables.',
          },
          {
            heading_ar: 'رعاية صحية',
            heading_fr: 'Soins de santé',
            description_ar: 'قوافل طبية مجانية دورية لفائدة الأسر في المناطق النائية.',
            description_fr: 'Caravanes médicales gratuites et régulières au profit des familles des zones reculées.',
          },
          {
            heading_ar: 'تمكين اقتصادي',
            heading_fr: 'Autonomisation économique',
            description_ar: 'تكوين مهني ودعم للمشاريع المدرة للدخل للنساء والشباب.',
            description_fr: 'Formation professionnelle et soutien aux projets générateurs de revenus pour les femmes et les jeunes.',
          },
          {
            heading_ar: 'شفافية كاملة',
            heading_fr: 'Transparence totale',
            description_ar: 'تقارير مالية وميدانية دورية متاحة لجميع الداعمين والشركاء.',
            description_fr: 'Rapports financiers et de terrain périodiques accessibles à tous les soutiens et partenaires.',
          },
        ],
      },
    },

    // =====================================================================
    // 4. ACTIVITIES / أنشطتنا  (index.html lines 439-551, section#services)
    // =====================================================================
    {
      id: 'sec-home-activities',
      type: 'custom',
      enabled: true,
      order: 4,
      data: {
        _renderer: 'activitiesGrid',
        heading_ar: 'أنشطتنا',
        heading_fr: 'Nos activités',
        description_ar: 'اكتشف أبرز الأنشطة والبرامج التي تنظمها الجمعية على مدار السنة.',
        description_fr: 'Découvrez les activités et programmes phares organisés par l\'association tout au long de l\'année.',
        cards: [
          {
            title_ar: 'خرجات',
            title_fr: 'Sorties',
            description_ar: 'رحلات ميدانية واستكشافية لاكتشاف الطبيعة والتراث المغربي.',
            description_fr: 'Voyages de terrain et d\'exploration pour découvrir la nature et le patrimoine marocain.',
            image:
              'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=900&auto=format&fit=crop',
            linkText_ar: 'اكتشف المزيد',
            linkText_fr: 'En savoir plus',
            linkUrl: '#',
          },
          {
            title_ar: 'مسابقات وراليات',
            title_fr: 'Compétitions et rallyes',
            description_ar:
              'تنظيم مسابقات وتحديات وراليات استكشافية لتعزيز روح الفريق.',
            description_fr:
              'Organisation de compétitions, défis et rallyes d\'exploration pour renforcer l\'esprit d\'équipe.',
            image:
              'https://www.kechpresse.com/wp-content/uploads/2022/01/%D8%B1%D8%A7%D9%84%D9%8A-%D8%AF%D9%83%D8%A7%D8%B1-%D8%B3%D8%B9%D9%88%D8%AF%D9%8A.jpg',
            linkText_ar: 'اكتشف المزيد',
            linkText_fr: 'En savoir plus',
            linkUrl: '#',
          },
          {
            title_ar: 'تكوينات',
            title_fr: 'Formations',
            description_ar:
              'دورات وورشات تكوينية في مجالات البحث والاستكشاف والإسعافات الأولية.',
            description_fr:
              'Cours et ateliers de formation en recherche, exploration et premiers secours.',
            image:
              'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=900&auto=format&fit=crop',
            linkText_ar: 'اكتشف المزيد',
            linkText_fr: 'En savoir plus',
            linkUrl: '#',
          },
          {
            title_ar: 'معارض',
            title_fr: 'Expositions',
            description_ar: 'معارض علمية وثقافية للتعريف بالتراث الطبيعي والاستكشاف.',
            description_fr: 'Expositions scientifiques et culturelles pour faire connaître le patrimoine naturel.',
            image:
              'https://www.aldeereh.com/wp-content/uploads/2024/09/%D8%A7%D9%84%D8%B2%D9%88%D8%A7%D8%B1-%D9%8A%D8%AA%D9%88%D8%A7%D9%81%D8%AF%D9%88%D9%86-%D8%B9%D9%84%D9%89-%D9%85%D8%B9%D8%B1%D8%B6-%D8%A7%D9%84%D8%B1%D9%8A%D8%A7%D8%B6-%D8%A7%D9%84%D8%AF%D9%88%D9%84%D9%8A-%D9%84%D9%84%D9%83%D8%AA%D8%A7%D8%A8-2.jpg',
            linkText_ar: 'اكتشف المزيد',
            linkText_fr: 'En savoir plus',
            linkUrl: '#',
          },
          {
            title_ar: 'لقاءات',
            title_fr: 'Rencontres',
            description_ar: 'لقاءات علمية وتواصلية مع الخبراء والمهتمين بمجال الاستكشاف.',
            description_fr: 'Rencontres scientifiques avec des experts et passionnés du domaine de l\'exploration.',
            image:
              'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=900&auto=format&fit=crop',
            linkText_ar: 'اكتشف المزيد',
            linkText_fr: 'En savoir plus',
            linkUrl: '#',
          },
          {
            title_ar: 'حملات بيئية',
            title_fr: 'Campagnes environnementales',
            description_ar: 'حملات للتوعية البيئية وحماية الطبيعة والمحافظة على الموارد.',
            description_fr: 'Campagnes de sensibilisation environnementale, de protection de la nature et de préservation des ressources.',
            image:
              'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=900&auto=format&fit=crop',
            linkText_ar: 'اكتشف المزيد',
            linkText_fr: 'En savoir plus',
            linkUrl: '#',
          },
        ],
      },
    },

    // =====================================================================
    // 5. NEWS / الأخبار  (index.html lines 554-614, section#news)
    // =====================================================================
    {
      id: 'sec-home-news',
      type: 'custom',
      enabled: true,
      order: 5,
      data: {
        _renderer: 'newsGrid',
        eyebrow_ar: 'آخر المستجدات',
        eyebrow_fr: 'Dernières nouvelles',
        heading_ar: 'أخبار وفعاليات الجمعية',
        heading_fr: 'Actualités et événements de l\'association',
        cards: [
          {
            title_ar: 'إطلاق برنامج المنح الدراسية للموسم الجديد',
            title_fr: 'Lancement du programme de bourses pour la nouvelle saison',
            date: '12 يوليوز 2026',
            badge_ar: 'تعليم',
            badge_fr: 'Éducation',
            image:
              'https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=700&auto=format&fit=crop',
            linkText_ar: 'اقرأ المزيد',
            linkText_fr: 'Lire la suite',
            linkUrl: '#',
          },
          {
            title_ar: 'قافلة طبية مجانية استفاد منها أكثر من 300 شخص',
            title_fr: 'Caravane médicale gratuite au profit de plus de 300 personnes',
            date: '28 يونيو 2026',
            badge_ar: 'صحة',
            badge_fr: 'Santé',
            image:
              'https://images.unsplash.com/photo-1584515933487-779824d29309?q=80&w=700&auto=format&fit=crop',
            linkText_ar: 'اقرأ المزيد',
            linkText_fr: 'Lire la suite',
            linkUrl: '#',
          },
          {
            title_ar: 'انطلاق ورشات التكوين المهني لفائدة 40 امرأة',
            title_fr: 'Lancement des ateliers de formation professionnelle pour 40 femmes',
            date: '05 يونيو 2026',
            badge_ar: 'تمكين',
            badge_fr: 'Autonomisation',
            image:
              'https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=700&auto=format&fit=crop',
            linkText_ar: 'اقرأ المزيد',
            linkText_fr: 'Lire la suite',
            linkUrl: '#',
          },
        ],
      },
    },

    // =====================================================================
    // 6. STORE BANNER / متجر AMARE  (index.html lines 617-676, section#store)
    // =====================================================================
    {
      id: 'sec-home-store',
      type: 'cta',
      enabled: true,
      order: 6,
      data: {
        heading_ar: 'ادعم رسالتنا\nبمنتجات حصرية',
        heading_fr: 'Soutenez notre mission\navec des produits exclusifs',
        description_ar:
          'اكتشف مجموعة منتجات AMARE الحصرية. كل عملية شراء تساهم في دعم أنشطة الجمعية، وتمويل برامج البحث والاستكشاف، وحماية التراث الوطني.',
        description_fr:
          'Découvrez la gamme exclusive de produits AMARE. Chaque achat contribue à soutenir les activités de l\'association, à financer les programmes de recherche et d\'exploration et à protéger le patrimoine national.',
        buttonLabel_ar: 'تسوق الآن',
        buttonLabel_fr: 'Acheter maintenant',
        buttonUrl: '#',
        backgroundImage: 'Amare files /amare-shop.png',
      },
    },

    // =====================================================================
    // 7. NEWSLETTER / النشرة الإخبارية  (index.html lines 679-696, section#newsletter)
    // =====================================================================
    {
      id: 'sec-home-newsletter',
      type: 'cta',
      enabled: true,
      order: 7,
      data: {
        heading_ar: 'اشترك في نشرتنا الإخبارية',
        heading_fr: 'Abonnez-vous à notre newsletter',
        description_ar:
          'كن أول من يعلم بآخر برامجنا وفعالياتنا وقصص النجاح التي نصنعها معًا.',
        description_fr:
          'Soyez le premier informé de nos programmes, événements et réussites construits ensemble.',
        buttonLabel_ar: 'اشترك الآن',
        buttonLabel_fr: 'S\'abonner',
        buttonUrl: '#newsletter',
        backgroundImage: '',
      },
    },

    // =====================================================================
    // 8. FOOTER / تذييل الصفحة  (index.html lines 701-795, footer#contact)
    // =====================================================================
    {
      id: 'sec-home-footer',
      type: 'custom',
      enabled: true,
      order: 8,
      data: {
        _renderer: 'footer',
        brandName_ar: 'الجمعية المغربية لهواة البحث والاستكشاف',
        brandName_fr: 'Association Marocaine des Amateurs de Recherche et d\'Exploration',
        brandLogo: 'Amare%20files%20/logo.png',
        description_ar:
          'الجمعية المغربية لهواة البحث والاستكشاف هي إطار قانوني وطني يجمع الهواة تحت راية واحدة لصون التراث الوطني المغربي.',
        description_fr:
          'L\'Association Marocaine des Amateurs de Recherche et d\'Exploration est un cadre juridique national qui rassemble les passionnés sous une seule bannière pour préserver le patrimoine national marocain.',
        socialLinks: [
          { platform: 'facebook', url: '#' },
          { platform: 'instagram', url: '#' },
          { platform: 'linkedin', url: '#' },
        ],
        quickLinksHeading_ar: 'روابط سريعة',
        quickLinksHeading_fr: 'Liens rapides',
        quickLinks: [
          { label_ar: 'الرئيسية', label_fr: 'Accueil', url: '#home' },
          { label_ar: 'اتصل بنا', label_fr: 'Contactez-nous', url: '#about' },
          { label_ar: 'خدماتنا', label_fr: 'Nos services', url: '#services' },
          { label_ar: 'الاخبار', label_fr: 'Actualités', url: '#news' },
          { label_ar: 'الارشيف', label_fr: 'Archives', url: '#newsletter' },
          { label_ar: 'الفروع الجهوية', label_fr: 'Branches régionales', url: '#home' },
          { label_ar: 'انخرط معنا', label_fr: 'Rejoignez-nous', url: '#about' },
          { label_ar: 'شركاؤنا', label_fr: 'Nos partenaires', url: '#services' },
          { label_ar: 'انشطتنا', label_fr: 'Nos activités', url: '#news' },
          { label_ar: 'من نحن', label_fr: 'Qui sommes-nous', url: '#newsletter' },
        ],
        programsHeading_ar: 'برامجنا',
        programsHeading_fr: 'Nos programmes',
        programs: [
          { label_ar: 'SOS Amare', label_fr: 'SOS Amare', url: '#services' },
          { label_ar: 'متجر Amare', label_fr: 'Boutique Amare', url: 'amare store/index.html' },
          { label_ar: 'بيت المستكشف Amare', label_fr: 'Maison de l\'explorateur Amare', url: '#services' },
          { label_ar: 'مجلة Amare', label_fr: 'Magazine Amare', url: '#services' },
          { label_ar: 'أكاديمية Amare', label_fr: 'Académie Amare', url: '#services' },
          { label_ar: 'النوادي', label_fr: 'Clubs', url: '#services' },
          { label_ar: 'المستشار القانوني', label_fr: 'Conseiller juridique', url: '#services' },
          { label_ar: 'عقد التأمين', label_fr: 'Contrat d\'assurance', url: '#services' },
        ],
        contactHeading_ar: 'تواصل معنا',
        contactHeading_fr: 'Contactez-nous',
        contact: {
          address_ar: 'ص.ب 749 أيت ملول 86150',
          address_fr: 'B.P. 749 Aït Melloul 86150',
          phone: '+212 684869996',
          email: 'association.amare.agadir@gmail.com',
        },
        mapHeading_ar: 'موقعنا',
        mapHeading_fr: 'Notre localisation',
        mapLabel: '📍 Ait Melloul, Agadir',
        mapLat: '30.385528',
        mapLon: '-9.448611',
        copyright_ar: '© 2026 الجمعية المغربية لهواة البحث والاستكشاف. جميع الحقوق محفوظة.',
        copyright_fr: '© 2026 Association Marocaine des Amateurs de Recherche et d\'Exploration. Tous droits réservés.',
        bottomLinks: [
          { label_ar: 'سياسة الخصوصية', label_fr: 'Politique de confidentialité', url: '#' },
          { label_ar: 'الشروط والأحكام', label_fr: 'Conditions générales', url: '#' },
        ],
      },
    },
];
