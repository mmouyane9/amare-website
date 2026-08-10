/* ==========================================================================
   AMARE — Centralized Multilingual System (i18n)
   --------------------------------------------------------------------------
   Single source of truth for all static user‑facing translations.
   Loaded automatically on every page via supabase/navbar-loader.js.

   Languages (code / direction / default):
     ar  — العربية       (RTL, default)
     fr  — Français      (LTR)
     en  — English       (LTR)
     es  — Español       (LTR)
     zgh — ⵜⴰⵎⴰⵣⵉⵖⵜ    (LTR) — Tifinagh

   API:
     I18n.initI18n()          — boot (auto called on script load)
     I18n.setLanguage(code)   — switch + persist + translate
     I18n.getCurrentLanguage()
     I18n.translatePage()     — translate all [data-i18n*] elements AND any
                                Arabic text node matching the page-content
                                dictionary (supabase/i18n-text.js)
     I18n.t(key)              — resolve a translation key (falls back to the
                                page-content dictionary for Arabic strings)
     I18n.translateContent(el)
     I18n.markDynamic(el)     — un-bind data-i18n* from CMS-owned containers
     I18n.resolveNavLabel(item)   — pick title_ar/title_en/dynamic for nav
     I18n.resolveNavDesc(item)
     I18n.resolveFooterLabel(item)
     I18n.localizeDynamic(englishText)
     I18n.home()                  — translated homepage fallback data

   Events dispatched:
     amare:i18nready     — i18n finished first apply (renderers re-render)
     amare:langchange    — language changed (renderers re-render)
   ========================================================================== */

(function (window) {
  'use strict';

  var STORAGE_KEY = 'site_language';
  var DEFAULT_LANG = 'ar';
  var FALLBACK_FONT = "'Noto Sans Tifinagh', sans-serif";
  var FONT_EMBED =
    'https://fonts.googleapis.com/css2?family=Noto+Sans+Tifinagh:wght@400;700&display=swap';

  /* ------------------------------------------------------------------ */
  /* Language registry                                                   */
  /* ------------------------------------------------------------------ */
  var LANGUAGES = {
    ar: { label: 'العربية', dir: 'rtl', native: 'العربية' },
    fr: { label: 'Français', dir: 'ltr', native: 'Français' },
    en: { label: 'English', dir: 'ltr', native: 'English' },
    es: { label: 'Español', dir: 'ltr', native: 'Español' },
    zgh: { label: 'Tamazight', dir: 'ltr', native: 'ⵜⴰⵎⴰⵣⵉⵖⵜ' },
  };

  /* Historic option values found in the existing page markup that must be
     mapped to the canonical language code (the selectors use "ber"). */
  var LANG_ALIASES = { ber: 'zgh' };

  var currentLanguage = DEFAULT_LANG;

  /* Page-content dictionary (supabase/i18n-text.js) — Arabic string → fr/en/es/zgh.
     Loaded lazily from window.AMARE_TEXT_TABLE, so script order does not matter. */
  var AR_RE = /[\u0600-\u06FF]/;
  var TEXT_SKIP_TAGS = {
    SCRIPT: true,
    STYLE: true,
    TEXTAREA: true,
    OPTION: true,
    NOSCRIPT: true,
    SELECT: true,
  };
  /* TextNode → original Arabic data, for round-tripping to ar. */
  var arOriginals = new WeakMap();

  function normText(s) {
    return (s == null ? '' : String(s))
      .replace(/[\s\u00A0\u200E\u200F]+/g, ' ')
      .trim();
  }

  function lookupTextEntry(normalized) {
    if (!window.AMARE_TEXT_TABLE) return null;
    return window.AMARE_TEXT_TABLE[normalized] || null;
  }

  /* ------------------------------------------------------------------ */
  /* Static UI translations — keys shared by all pages                   */
  /* ------------------------------------------------------------------ */
  var translations = {
    ar: {
      'lang.select': 'اختيار اللغة',
      'lang.aria': 'اختيار اللغة',

      'misc.skip': 'تخطَّ إلى المحتوى الرئيسي',
      'misc.backToTop': 'العودة إلى الأعلى',

      'social.facebook': 'فيسبوك',
      'social.instagram': 'إنستغرام',
      'social.linkedin': 'لينكدإن',
      'social.youtube': 'يوتيوب',

      'topbar.whatsapp': 'واتساب',
      'topbar.whatsappAria': 'تواصل عبر واتساب',
      'topbar.store': 'متجر AMARE',
      'topbar.brandAria': 'الرئيسية',

      'nav.main': 'التنقل الرئيسي',
      'nav.home': 'الرئيسية',
      'nav.about': 'من نحن',
      'nav.activities': 'أنشطتنا',
      'nav.partners': 'شركاؤنا',
      'nav.services': 'خدماتنا',
      'nav.branches': 'الفروع الجهوية',
      'nav.join': 'انخرط معنا',
      'nav.news': 'الأخبار',
      'nav.archive': 'الأرشيف',
      'nav.contact': 'اتصل بنا',
      'nav.login': 'تسجيل الدخول',
      'nav.logout': 'تسجيل الخروج',
      'nav.admin': 'الإدارة',
      'nav.store': 'متجر',
      'nav.openMenu': 'فتح القائمة',
      'nav.closeMenu': 'إغلاق القائمة',
      'nav.mobileMenu': 'القائمة الرئيسية',
      'nav.submenu': 'فتح القائمة الفرعية',
      'nav.viewAll': 'عرض الكل',
      'nav.activePage': 'الصفحة الحالية',

      'meta.description': 'الجمعية المغربية لهواة البحث والاستكشاف — جمعية مغربية تعمل على التنمية الاجتماعية والتعليم والتمكين الاقتصادي، بأكثر من 500 مستفيد و12 عامًا من العمل الميداني.',
      'meta.keywords': 'جمعية, تنمية, تطوع, المغرب, عمل خيري, تمكين',
      'meta.author': 'الجمعية المغربية لهواة البحث والاستكشاف',
      'meta.ogTitle': 'الجمعية المغربية لهواة البحث والاستكشاف',
      'meta.ogDescription': 'معًا نصنع أثرًا حقيقيًا في المجتمع',

      'hero.aria': 'فريق من المتطوعين يعملون في مشروع مجتمعي',
      'hero.eyebrow': 'التسجيل في المسابقة الوطنية مفتوح الآن',
      'hero.title': 'اكتشف...<br>شارك...<br>وانضم إلى الجمعية المغربية<br><span>لهواة البحث والاستكشاف</span>',
      'hero.desc': 'شارك في المسابقة الوطنية، وانخرط إلكترونياً في الجمعية، أو جدد عضويتك بسهولة، واطلع على آخر الأنشطة والفعاليات والأخبار عبر المنصة الرسمية.',
      'hero.cta1': 'شارك في المسابقة',
      'hero.cta2': 'انخرط في الجمعية',
      'hero.cta3': 'تجديد الانخراط',
      'hero.scroll': 'مرر للأسفل',

      'about.eyebrow': 'من نحن',
      'about.title': 'نبني اليوم',
      'about.titleEm': 'غدًا',
      'about.titleSub': 'أكثر إشراقًا للأجيال القادمة',
      'about.desc': 'منذ 2014 ونحن نصنع الفرق في حياة آلاف الأسر المغربية',
      'about.p1': 'تأسست الجمعية المغربية لهواة البحث والاستكشاف سنة 2014 على يد مجموعة من الفاعلين المدنيين، بهدف الاستجابة للاحتياجات الحقيقية للمجتمعات المحلية عبر برامج ميدانية في التعليم والصحة والتمكين الاقتصادي.',
      'about.p2': 'نؤمن بأن التغيير المستدام يبدأ من الأفراد، لذلك نعمل جنبًا إلى جنب مع السكان المحليين والمتطوعين والشركاء لبناء حلول تدوم أثرها لسنوات قادمة.',
      'about.f1t': 'برامج تعليمية',
      'about.f1d': 'دعم مدرسي ومحو أمية لتمكين الأطفال والكبار من فرص تعليمية عادلة.',
      'about.f2t': 'رعاية صحية',
      'about.f2d': 'قوافل طبية مجانية دورية لفائدة الأسر في المناطق النائية.',
      'about.f3t': 'تمكين اقتصادي',
      'about.f3d': 'تكوين مهني ودعم المشاريع المدرة للدخل للنساء والشباب.',
      'about.btn1': 'تعرف على برامجنا',
      'about.btn2': 'تواصل معنا',
      'about.imgAlt': 'متطوعون ميدانيون',
      'about.stat1': 'مستفيد',
      'about.stat2': 'متطوع',
      'about.stat3': 'سنة',

      'features.eyebrow': 'لماذا الجمعية المغربية لهواة البحث والاستكشاف',
      'features.title': 'ما يميز عملنا',
      'features.desc': 'نجمع بين الخبرة الميدانية والشفافية الكاملة لضمان أثر حقيقي وملموس في كل مشروع ننفذه.',
      'features.c1t': 'برامج تعليمية',
      'features.c1d': 'دعم مدرسي ومحو أمية لتمكين الأطفال والكبار من فرص تعليمية عادلة.',
      'features.c2t': 'رعاية صحية',
      'features.c2d': 'قوافل طبية مجانية دورية لفائدة الأسر في المناطق النائية.',
      'features.c3t': 'تمكين اقتصادي',
      'features.c3d': 'تكوين مهني ودعم للمشاريع المدرة للدخل للنساء والشباب.',
      'features.c4t': 'شفافية كاملة',
      'features.c4d': 'تقارير مالية وميدانية دورية متاحة لجميع الداعمين والشركاء.',

      'activities.title': 'أنشطتنا',
      'activities.desc': 'اكتشف أبرز الأنشطة والبرامج التي تنظمها الجمعية على مدار السنة.',
      'activities.a1t': 'خرجات',
      'activities.a1d': 'رحلات ميدانية واستكشافية لاكتشاف الطبيعة والتراث المغربي.',
      'activities.a2t': 'مسابقات وراليات',
      'activities.a2d': 'تنظيم مسابقات وتحديات وراليات استكشافية لتعزيز روح الفريق.',
      'activities.a3t': 'تكوينات',
      'activities.a3d': 'دورات وورشات تكوينية في مجالات البحث والاستكشاف والإسعافات الأولية.',
      'activities.a4t': 'معارض',
      'activities.a4d': 'معارض علمية وثقافية للتعريف بالتراث الطبيعي والاستكشاف.',
      'activities.a5t': 'لقاءات',
      'activities.a5d': 'لقاءات علمية وتواصلية مع الخبراء والمهتمين بمجال الاستكشاف.',
      'activities.a6t': 'حملات بيئية',
      'activities.a6d': 'حملات للتوعية البيئية وحماية الطبيعة والمحافظة على الموارد.',
      'activities.more': 'اكتشف المزيد',
      'activities.a1alt': 'خرجات',
      'activities.a2alt': 'مسابقات وراليات',
      'activities.a3alt': 'تكوينات',
      'activities.a4alt': 'معارض',
      'activities.a5alt': 'لقاءات',
      'activities.a6alt': 'حملات بيئية',

      'news.eyebrow': 'آخر المستجدات',
      'news.title': 'أخبار وفعاليات الجمعية',
      'news.badge1': 'تعليم',
      'news.badge2': 'صحة',
      'news.badge3': 'تمكين',
      'news.c1t': 'إطلاق برنامج المنح الدراسية للموسم الجديد',
      'news.c1d': '12 يوليوز 2026',
      'news.c2t': 'قافلة طبية مجانية استفاد منها أكثر من 300 شخص',
      'news.c2d': '28 يونيو 2026',
      'news.c3t': 'انطلاق ورشات التكوين المهني لفائدة 40 امرأة',
      'news.c3d': '05 يونيو 2026',
      'news.more': 'اقرأ المزيد',
      'news.img1alt': 'حفل توزيع المنح الدراسية',
      'news.img2alt': 'قافلة طبية مجانية',
      'news.img3alt': 'ورشة تكوين للنساء',

      'store.eyebrow': 'متجر AMARE',
      'store.title': 'ادعم رسالتنا<br>بمنتجات حصرية',
      'store.desc': 'اكتشفوا المجموعة الحصرية من منتجات AMARE. كل عملية شراء تساهم في دعم أنشطة الجمعية وتمويل برامج البحث والاستكشاف وحماية التراث الوطني.',
      'store.cta': 'اشترِ الآن',
      'store.imgAlt': 'متجر AMARE',

      'newsletter.title': 'اشترك في نشرتنا الإخبارية',
      'newsletter.desc': 'كن أول من يعلم بآخر برامجنا وفعالياتنا وقصص النجاح التي نصنعها معًا.',
      'newsletter.aria': 'البريد الإلكتروني',
      'newsletter.placeholder': 'بريدك الإلكتروني',
      'newsletter.cta': 'اشترك الآن',
      'newsletter.success': 'شكرًا لك! تم تسجيل اشتراكك بنجاح.',
      'newsletter.error': 'يرجى إدخال بريد إلكتروني صحيح.',

      'footer.quickLinks': 'روابط سريعة',
      'footer.programs': 'برامجنا',
      'footer.contact': 'تواصل معنا',
      'footer.location': 'موقعنا',
      'footer.mapTitle': 'موقع الجمعية على الخريطة',
      'footer.mapBtn': 'فتح في خرائط Google',
      'footer.rightsReserved': 'جميع الحقوق محفوظة.',
      'footer.privacy': 'سياسة الخصوصية',
      'footer.terms': 'الشروط والأحكام',

      'admin.db': 'قاعدة البيانات',
      'admin.content': 'إدارة المحتوى',
      'admin.dashboard': 'لوحة التحكم',

      'page.home': 'الجمعية المغربية لهواة البحث والاستكشاف | معًا نصنع أثرًا حقيقيًا',
      'page.news': 'الأخبار | آخر أخبار الجمعية | الجمعية المغربية لهواة البحث والاستكشاف',
      'page.contact': 'اتصل بنا | الجمعية المغربية لهواة البحث والاستكشاف',
      'page.login': 'تسجيل الدخول | الجمعية المغربية لهواة البحث والاستكشاف',
    },

    fr: {
      'lang.select': 'Choisir la langue',
      'lang.aria': 'Choisir la langue',

      'misc.skip': 'Aller au contenu principal',
      'misc.backToTop': 'Retour en haut',

      'social.facebook': 'Facebook',
      'social.instagram': 'Instagram',
      'social.linkedin': 'LinkedIn',
      'social.youtube': 'YouTube',

      'topbar.whatsapp': 'WhatsApp',
      'topbar.whatsappAria': 'Contactez-nous sur WhatsApp',
      'topbar.store': 'Boutique AMARE',
      'topbar.brandAria': 'Accueil',

      'nav.main': 'Navigation principale',
      'nav.home': 'Accueil',
      'nav.about': 'À propos',
      'nav.activities': 'Nos activités',
      'nav.partners': 'Nos partenaires',
      'nav.services': 'Nos services',
      'nav.branches': 'Branches régionales',
      'nav.join': 'Rejoignez-nous',
      'nav.news': 'Actualités',
      'nav.archive': 'Archives',
      'nav.contact': 'Contactez-nous',
      'nav.login': 'Connexion',
      'nav.logout': 'Déconnexion',
      'nav.admin': 'Administration',
      'nav.store': 'Boutique',
      'nav.openMenu': 'Ouvrir le menu',
      'nav.closeMenu': 'Fermer le menu',
      'nav.mobileMenu': 'Menu principal',
      'nav.submenu': 'Ouvrir le sous-menu',
      'nav.viewAll': 'Voir tout',
      'nav.activePage': 'Page actuelle',

      'meta.description': 'Association Marocaine des Amateurs de Recherche et d\'Exploration — une association marocaine œuvrant pour le développement social, l\'éducation et l\'autonomisation économique, avec plus de 500 bénéficiaires et 12 ans de travail sur le terrain.',
      'meta.keywords': 'association, développement, bénévolat, Maroc, œuvre caritative, autonomisation',
      'meta.author': 'Association Marocaine des Amateurs de Recherche et d\'Exploration',
      'meta.ogTitle': 'Association Marocaine des Amateurs de Recherche et d\'Exploration',
      'meta.ogDescription': 'Ensemble, créons un impact réel dans la communauté',

      'hero.aria': 'Une équipe de bénévoles travaillant sur un projet communautaire',
      'hero.eyebrow': 'Les inscriptions au concours national sont ouvertes',
      'hero.title': 'Découvrez...<br>Participez...<br>Rejoignez l’association marocaine<br><span>des amateurs de recherche et d’exploration</span>',
      'hero.desc': 'Participez au concours national, adhérez en ligne à l’association ou renouvelez facilement votre adhésion, et suivez les dernières activités, événements et actualités via la plateforme officielle.',
      'hero.cta1': 'S\'inscrire maintenant',
      'hero.cta2': 'Rejoindre l\'association',
      'hero.cta3': 'Renouveler l’adhésion',
      'hero.scroll': 'Faire défiler',

      'about.eyebrow': 'À propos',
      'about.title': 'Nous bâtissons aujourd’hui',
      'about.titleEm': 'un avenir',
      'about.titleSub': 'plus radieux pour les générations futures',
      'about.desc': 'Depuis 2014, nous faisons la différence dans la vie de milliers de familles marocaines',
      'about.p1': 'L’association marocaine des amateurs de recherche et d’exploration a été fondée en 2014 par un groupe d’acteurs de la société civile, afin de répondre aux besoins réels des communautés locales à travers des programmes de terrain dans l’éducation, la santé et l’autonomisation économique.',
      'about.p2': 'Nous croyons que le changement durable commence par les individus. C’est pourquoi nous travaillons main dans la main avec les populations locales, les bénévoles et les partenaires pour construire des solutions dont l’impact perdure pendant des années.',
      'about.f1t': 'Programmes éducatifs',
      'about.f1d': 'Soutien scolaire et alphabétisation pour offrir aux enfants et aux adultes des chances éducatives équitables.',
      'about.f2t': 'Soins de santé',
      'about.f2d': 'Caravanes médicales gratuites et régulières au profit des familles des zones reculées.',
      'about.f3t': 'Autonomisation économique',
      'about.f3d': 'Formation professionnelle et soutien aux projets générateurs de revenus pour les femmes et les jeunes.',
      'about.btn1': 'Découvrir nos programmes',
      'about.btn2': 'Contactez-nous',
      'about.imgAlt': 'Bénévoles sur le terrain',
      'about.stat1': 'bénéficiaires',
      'about.stat2': 'bénévoles',
      'about.stat3': 'années',

      'features.eyebrow': 'Pourquoi l’association marocaine des amateurs de recherche et d’exploration',
      'features.title': 'Ce qui nous distingue',
      'features.desc': 'Nous allions expertise de terrain et transparence totale pour garantir un impact réel et concret dans chaque projet.',
      'features.c1t': 'Programmes éducatifs',
      'features.c1d': 'Soutien scolaire et alphabétisation pour offrir aux enfants et aux adultes des chances éducatives équitables.',
      'features.c2t': 'Soins de santé',
      'features.c2d': 'Caravanes médicales gratuites et régulières au profit des familles des zones reculées.',
      'features.c3t': 'Autonomisation économique',
      'features.c3d': 'Formation professionnelle et soutien aux projets générateurs de revenus pour les femmes et les jeunes.',
      'features.c4t': 'Transparence totale',
      'features.c4d': 'Rapports financiers et de terrain réguliers disponibles pour tous les donateurs et partenaires.',

      'activities.title': 'Nos activités',
      'activities.desc': 'Découvrez les activités et programmes phares organisés par l’association tout au long de l’année.',
      'activities.a1t': 'Sorties',
      'activities.a1d': 'Voyages de terrain et d’exploration pour découvrir la nature et le patrimoine marocain.',
      'activities.a2t': 'Compétitions et rallyes',
      'activities.a2d': 'Organisation de compétitions, défis et rallyes d’exploration pour renforcer l’esprit d’équipe.',
      'activities.a3t': 'Formations',
      'activities.a3d': 'Cours et ateliers de formation en recherche, exploration et premiers secours.',
      'activities.a4t': 'Expositions',
      'activities.a4d': 'Expositions scientifiques et culturelles pour faire connaître le patrimoine naturel.',
      'activities.a5t': 'Rencontres',
      'activities.a5d': 'Rencontres scientifiques avec des experts et passionnés du domaine de l’exploration.',
      'activities.a6t': 'Campagnes environnementales',
      'activities.a6d': 'Campagnes de sensibilisation environnementale, de protection de la nature et de préservation des ressources.',
      'activities.more': 'En savoir plus',
      'activities.a1alt': 'Sorties',
      'activities.a2alt': 'Compétitions et rallyes',
      'activities.a3alt': 'Formations',
      'activities.a4alt': 'Expositions',
      'activities.a5alt': 'Rencontres',
      'activities.a6alt': 'Campagnes environnementales',

      'news.eyebrow': 'Dernières nouvelles',
      'news.title': 'Actualités et événements de l’association',
      'news.badge1': 'Éducation',
      'news.badge2': 'Santé',
      'news.badge3': 'Autonomisation',
      'news.c1t': 'Lancement du programme de bourses d’études pour la nouvelle saison',
      'news.c1d': '12 juillet 2026',
      'news.c2t': 'Une caravane médicale gratuite au profit de plus de 300 personnes',
      'news.c2d': '28 juin 2026',
      'news.c3t': 'Démarrage des ateliers de formation professionnelle pour 40 femmes',
      'news.c3d': '05 juin 2026',
      'news.more': 'Lire la suite',
      'news.img1alt': 'Cérémonie de remise des bourses d\'études',
      'news.img2alt': 'Caravane médicale gratuite',
      'news.img3alt': 'Atelier de formation pour femmes',

      'store.eyebrow': 'Boutique AMARE',
      'store.title': 'Soutenez notre mission<br>avec des produits exclusifs',
      'store.desc': 'Découvrez la gamme exclusive de produits AMARE. Chaque achat contribue à soutenir les activités de l\'association, à financer les programmes de recherche et d\'exploration et à protéger le patrimoine national.',
      'store.cta': 'Acheter maintenant',
      'store.imgAlt': 'Boutique AMARE',

      'newsletter.title': 'Abonnez-vous à notre newsletter',
      'newsletter.desc': 'Soyez le premier informé de nos programmes, événements et réussites construits ensemble.',
      'newsletter.aria': 'Adresse e-mail',
      'newsletter.placeholder': 'Votre e-mail',
      'newsletter.cta': 'S’abonner',
      'newsletter.success': 'Merci ! Votre inscription a bien été enregistrée.',
      'newsletter.error': 'Veuillez saisir une adresse e-mail valide.',

      'footer.quickLinks': 'Liens rapides',
      'footer.programs': 'Nos programmes',
      'footer.contact': 'Contactez-nous',
      'footer.location': 'Notre localisation',
      'footer.mapTitle': 'Localisation de l’association sur la carte',
      'footer.mapBtn': 'Ouvrir dans Google Maps',
      'footer.rightsReserved': 'Tous droits réservés.',
      'footer.privacy': 'Politique de confidentialité',
      'footer.terms': 'Conditions générales',

      'admin.db': 'Base de données',
      'admin.content': 'Gestion du contenu',
      'admin.dashboard': 'Tableau de bord',

      'page.home': 'Association marocaine des amateurs de recherche et d’exploration | Ensemble, créons un impact réel',
      'page.news': 'Actualités | Dernières nouvelles | Association marocaine des amateurs de recherche et d’exploration',
      'page.contact': 'Contactez-nous | Association marocaine des amateurs de recherche et d’exploration',
      'page.login': 'Connexion | Association marocaine des amateurs de recherche et d’exploration',
    },

    en: {
      'lang.select': 'Choose language',
      'lang.aria': 'Choose language',

      'misc.skip': 'Skip to main content',
      'misc.backToTop': 'Back to top',

      'social.facebook': 'Facebook',
      'social.instagram': 'Instagram',
      'social.linkedin': 'LinkedIn',
      'social.youtube': 'YouTube',

      'topbar.whatsapp': 'WhatsApp',
      'topbar.whatsappAria': 'Contact us on WhatsApp',
      'topbar.store': 'AMARE Store',
      'topbar.brandAria': 'Home',

      'nav.main': 'Main navigation',
      'nav.home': 'Home',
      'nav.about': 'About Us',
      'nav.activities': 'Our Activities',
      'nav.partners': 'Our Partners',
      'nav.services': 'Our Services',
      'nav.branches': 'Regional Branches',
      'nav.join': 'Join Us',
      'nav.news': 'News',
      'nav.archive': 'Archive',
      'nav.contact': 'Contact Us',
      'nav.login': 'Login',
      'nav.logout': 'Logout',
      'nav.admin': 'Administration',
      'nav.store': 'Store',
      'nav.openMenu': 'Open menu',
      'nav.closeMenu': 'Close menu',
      'nav.mobileMenu': 'Main menu',
      'nav.submenu': 'Open submenu',
      'nav.viewAll': 'View all',
      'nav.activePage': 'Current page',

      'meta.description': 'Moroccan Association of Research and Exploration Enthusiasts — a Moroccan association working on social development, education and economic empowerment, with over 500 beneficiaries and 12 years of field work.',
      'meta.keywords': 'association, development, volunteering, Morocco, charity, empowerment',
      'meta.author': 'Moroccan Association of Research and Exploration Enthusiasts',
      'meta.ogTitle': 'Moroccan Association of Research and Exploration Enthusiasts',
      'meta.ogDescription': 'Together we create a real impact in the community',

      'hero.aria': 'A team of volunteers working on a community project',
      'hero.eyebrow': 'National competition registration is now open',
      'hero.title': 'Discover...<br>Participate...<br>Join the Moroccan Association<br><span>for Research and Exploration</span>',
      'hero.desc': 'Participate in the national competition, join the association online, or easily renew your membership, and stay up to date with the latest activities, events and news through the official platform.',
      'hero.cta1': 'Participate in the competition',
      'hero.cta2': 'Join the association',
      'hero.cta3': 'Renew membership',
      'hero.scroll': 'Scroll down',

      'about.eyebrow': 'About Us',
      'about.title': 'We build today',
      'about.titleEm': 'a brighter',
      'about.titleSub': 'tomorrow for the next generations',
      'about.desc': 'Since 2014, we have been making a difference in the lives of thousands of Moroccan families',
      'about.p1': 'The Moroccan Association of Research and Exploration Enthusiasts was founded in 2014 by a group of civil society actors, to respond to the real needs of local communities through field programs in education, health and economic empowerment.',
      'about.p2': 'We believe that lasting change begins with individuals, which is why we work hand in hand with local communities, volunteers and partners to build solutions whose impact lasts for years to come.',
      'about.f1t': 'Educational programs',
      'about.f1d': 'School support and literacy to give children and adults fair educational opportunities.',
      'about.f2t': 'Health care',
      'about.f2d': 'Regular free medical caravans for families in remote areas.',
      'about.f3t': 'Economic empowerment',
      'about.f3d': 'Vocational training and support for income-generating projects for women and youth.',
      'about.btn1': 'Discover our programs',
      'about.btn2': 'Contact us',
      'about.imgAlt': 'Field volunteers',
      'about.stat1': 'beneficiaries',
      'about.stat2': 'volunteers',
      'about.stat3': 'years',

      'features.eyebrow': 'Why the Moroccan Association for Research and Exploration',
      'features.title': 'What makes us stand out',
      'features.desc': 'We combine field expertise with full transparency to ensure a real and tangible impact in every project we carry out.',
      'features.c1t': 'Educational programs',
      'features.c1d': 'School support and literacy to give children and adults fair educational opportunities.',
      'features.c2t': 'Health care',
      'features.c2d': 'Regular free medical caravans for families in remote areas.',
      'features.c3t': 'Economic empowerment',
      'features.c3d': 'Vocational training and support for income-generating projects for women and youth.',
      'features.c4t': 'Full transparency',
      'features.c4d': 'Regular financial and field reports available to all donors and partners.',

      'activities.title': 'Our Activities',
      'activities.desc': 'Discover the key activities and programs organized by the association throughout the year.',
      'activities.a1t': 'Outings',
      'activities.a1d': 'Field and exploration trips to discover Moroccan nature and heritage.',
      'activities.a2t': 'Competitions & rallies',
      'activities.a2d': 'Organizing competitions, challenges and exploration rallies to strengthen team spirit.',
      'activities.a3t': 'Training',
      'activities.a3d': 'Training courses and workshops in research, exploration and first aid.',
      'activities.a4t': 'Exhibitions',
      'activities.a4d': 'Scientific and cultural exhibitions to showcase natural heritage and exploration.',
      'activities.a5t': 'Meetings',
      'activities.a5d': 'Scientific meetings with experts and enthusiasts in the field of exploration.',
      'activities.a6t': 'Environmental campaigns',
      'activities.a6d': 'Campaigns for environmental awareness, nature protection and resource conservation.',
      'activities.more': 'Discover more',
      'activities.a1alt': 'Outings',
      'activities.a2alt': 'Competitions & rallies',
      'activities.a3alt': 'Training',
      'activities.a4alt': 'Exhibitions',
      'activities.a5alt': 'Meetings',
      'activities.a6alt': 'Environmental campaigns',

      'news.eyebrow': 'Latest updates',
      'news.title': 'Association news and events',
      'news.badge1': 'Education',
      'news.badge2': 'Health',
      'news.badge3': 'Empowerment',
      'news.c1t': 'Launch of the scholarship program for the new season',
      'news.c1d': '12 July 2026',
      'news.c2t': 'A free medical caravan benefiting more than 300 people',
      'news.c2d': '28 June 2026',
      'news.c3t': 'Vocational training workshops kick off for 40 women',
      'news.c3d': '05 June 2026',
      'news.more': 'Read more',
      'news.img1alt': 'Scholarship distribution ceremony',
      'news.img2alt': 'Free medical caravan',
      'news.img3alt': 'Training workshop for women',

      'store.eyebrow': 'AMARE Store',
      'store.title': 'Support our mission<br>with exclusive products',
      'store.desc': 'Discover AMARE\'s exclusive range of products. Every purchase helps support the association\'s activities, fund research and exploration programs, and protect our national heritage.',
      'store.cta': 'Shop now',
      'store.imgAlt': 'AMARE Store',

      'newsletter.title': 'Subscribe to our newsletter',
      'newsletter.desc': 'Be the first to know about our latest programs, events and success stories we build together.',
      'newsletter.aria': 'Email address',
      'newsletter.placeholder': 'Your email',
      'newsletter.cta': 'Subscribe now',
      'newsletter.success': 'Thank you! Your subscription has been registered successfully.',
      'newsletter.error': 'Please enter a valid email address.',

      'footer.quickLinks': 'Quick Links',
      'footer.programs': 'Our Programs',
      'footer.contact': 'Contact Us',
      'footer.location': 'Our Location',
      'footer.mapTitle': 'Association location on the map',
      'footer.mapBtn': 'Open in Google Maps',
      'footer.rightsReserved': 'All rights reserved.',
      'footer.privacy': 'Privacy Policy',
      'footer.terms': 'Terms & Conditions',

      'admin.db': 'Database',
      'admin.content': 'Content Management',
      'admin.dashboard': 'Dashboard',

      'page.home': 'Moroccan Association for Research and Exploration | Together we create a real impact',
      'page.news': 'News | Latest association news | Moroccan Association for Research and Exploration',
      'page.contact': 'Contact Us | Moroccan Association for Research and Exploration',
      'page.login': 'Login | Moroccan Association for Research and Exploration',
    },

    es: {
      'lang.select': 'Elegir idioma',
      'lang.aria': 'Elegir idioma',

      'misc.skip': 'Saltar al contenido principal',
      'misc.backToTop': 'Volver arriba',

      'social.facebook': 'Facebook',
      'social.instagram': 'Instagram',
      'social.linkedin': 'LinkedIn',
      'social.youtube': 'YouTube',

      'topbar.whatsapp': 'WhatsApp',
      'topbar.whatsappAria': 'Contáctenos por WhatsApp',
      'topbar.store': 'Tienda AMARE',
      'topbar.brandAria': 'Inicio',

      'nav.main': 'Navegación principal',
      'nav.home': 'Inicio',
      'nav.about': 'Quiénes somos',
      'nav.activities': 'Nuestras actividades',
      'nav.partners': 'Nuestros socios',
      'nav.services': 'Nuestros servicios',
      'nav.branches': 'Sucursales regionales',
      'nav.join': 'Únete a nosotros',
      'nav.news': 'Noticias',
      'nav.archive': 'Archivo',
      'nav.contact': 'Contáctanos',
      'nav.login': 'Iniciar sesión',
      'nav.logout': 'Cerrar sesión',
      'nav.admin': 'Administración',
      'nav.store': 'Tienda',
      'nav.openMenu': 'Abrir menú',
      'nav.closeMenu': 'Cerrar menú',
      'nav.mobileMenu': 'Menú principal',
      'nav.submenu': 'Abrir submenú',
      'nav.viewAll': 'Ver todo',
      'nav.activePage': 'Página actual',

      'meta.description': 'Asociación Marroquí de Aficionados a la Investigación y la Exploración — una asociación marroquí que trabaja en desarrollo social, educación y empoderamiento económico, con más de 500 beneficiarios y 12 años de trabajo de campo.',
      'meta.keywords': 'asociación, desarrollo, voluntariado, Marruecos, obra benéfica, empoderamiento',
      'meta.author': 'Asociación Marroquí de Aficionados a la Investigación y la Exploración',
      'meta.ogTitle': 'Asociación Marroquí de Aficionados a la Investigación y la Exploración',
      'meta.ogDescription': 'Juntos creamos un impacto real en la comunidad',

      'hero.aria': 'Un equipo de voluntarios trabajando en un proyecto comunitario',
      'hero.eyebrow': 'La inscripción al concurso nacional ya está abierta',
      'hero.title': 'Descubre...<br>Participa...<br>Únete a la Asociación Marroquí<br><span>de Aficionados a la Investigación y la Exploración</span>',
      'hero.desc': 'Participa en el concurso nacional, afíliate en línea a la asociación o renueva fácilmente tu membresía, y mantente al día con las últimas actividades, eventos y noticias a través de la plataforma oficial.',
      'hero.cta1': 'Participar en el concurso',
      'hero.cta2': 'Únete a la asociación',
      'hero.cta3': 'Renovar membresía',
      'hero.scroll': 'Desplázate hacia abajo',

      'about.eyebrow': 'Quiénes somos',
      'about.title': 'Construimos hoy',
      'about.titleEm': 'un mañana',
      'about.titleSub': 'más brillante para las próximas generaciones',
      'about.desc': 'Desde 2014 marcamos la diferencia en la vida de miles de familias marroquíes',
      'about.p1': 'La Asociación Marroquí de Aficionados a la Investigación y la Exploración fue fundada en 2014 por un grupo de actores de la sociedad civil, para responder a las necesidades reales de las comunidades locales mediante programas de campo en educación, salud y empoderamiento económico.',
      'about.p2': 'Creemos que el cambio duradero comienza con las personas, por eso trabajamos codo a codo con las comunidades locales, los voluntarios y los socios para construir soluciones cuyo impacto perdure durante años.',
      'about.f1t': 'Programas educativos',
      'about.f1d': 'Apoyo escolar y alfabetización para brindar a niños y adultos oportunidades educativas justas.',
      'about.f2t': 'Atención sanitaria',
      'about.f2d': 'Caravanas médicas gratuitas y periódicas para familias de zonas remotas.',
      'about.f3t': 'Empoderamiento económico',
      'about.f3d': 'Formación profesional y apoyo a proyectos generadores de ingresos para mujeres y jóvenes.',
      'about.btn1': 'Descubre nuestros programas',
      'about.btn2': 'Contáctanos',
      'about.imgAlt': 'Voluntarios de campo',
      'about.stat1': 'beneficiarios',
      'about.stat2': 'voluntarios',
      'about.stat3': 'años',

      'features.eyebrow': 'Por qué la Asociación Marroquí de Investigación y Exploración',
      'features.title': 'Lo que nos distingue',
      'features.desc': 'Combinamos experiencia de campo y transparencia total para garantizar un impacto real y tangible en cada proyecto que realizamos.',
      'features.c1t': 'Programas educativos',
      'features.c1d': 'Apoyo escolar y alfabetización para brindar a niños y adultos oportunidades educativas justas.',
      'features.c2t': 'Atención sanitaria',
      'features.c2d': 'Caravanas médicas gratuitas y periódicas para familias de zonas remotas.',
      'features.c3t': 'Empoderamiento económico',
      'features.c3d': 'Formación profesional y apoyo a proyectos generadores de ingresos para mujeres y jóvenes.',
      'features.c4t': 'Transparencia total',
      'features.c4d': 'Informes financieros y de campo periódicos disponibles para todos los donantes y socios.',

      'activities.title': 'Nuestras actividades',
      'activities.desc': 'Descubre las principales actividades y programas que organiza la asociación durante todo el año.',
      'activities.a1t': 'Excursiones',
      'activities.a1d': 'Viajes de campo y exploración para descubrir la naturaleza y el patrimonio marroquí.',
      'activities.a2t': 'Competiciones y rallys',
      'activities.a2d': 'Organización de competiciones, desafíos y rallys de exploración para reforzar el espíritu de equipo.',
      'activities.a3t': 'Formaciones',
      'activities.a3d': 'Cursos y talleres de formación en investigación, exploración y primeros auxilios.',
      'activities.a4t': 'Exposiciones',
      'activities.a4d': 'Exposiciones científicas y culturales para dar a conocer el patrimonio natural.',
      'activities.a5t': 'Encuentros',
      'activities.a5d': 'Encuentros científicos con expertos y aficionados al campo de la exploración.',
      'activities.a6t': 'Campañas ambientales',
      'activities.a6d': 'Campañas de concienciación ambiental, protección de la naturaleza y conservación de los recursos.',
      'activities.more': 'Descubre más',
      'activities.a1alt': 'Excursiones',
      'activities.a2alt': 'Competiciones y rallys',
      'activities.a3alt': 'Formaciones',
      'activities.a4alt': 'Exposiciones',
      'activities.a5alt': 'Encuentros',
      'activities.a6alt': 'Campañas ambientales',

      'news.eyebrow': 'Últimas novedades',
      'news.title': 'Noticias y eventos de la asociación',
      'news.badge1': 'Educación',
      'news.badge2': 'Salud',
      'news.badge3': 'Empoderamiento',
      'news.c1t': 'Lanzamiento del programa de becas para la nueva temporada',
      'news.c1d': '12 de julio de 2026',
      'news.c2t': 'Una caravana médica gratuita que benefició a más de 300 personas',
      'news.c2d': '28 de junio de 2026',
      'news.c3t': 'Arrancan los talleres de formación profesional para 40 mujeres',
      'news.c3d': '05 de junio de 2026',
      'news.more': 'Leer más',
      'news.img1alt': 'Ceremonia de entrega de becas',
      'news.img2alt': 'Caravana médica gratuita',
      'news.img3alt': 'Taller de formación para mujeres',

      'store.eyebrow': 'Tienda AMARE',
      'store.title': 'Apoya nuestra misión<br>con productos exclusivos',
      'store.desc': 'Descubre la gama exclusiva de productos AMARE. Cada compra contribuye a apoyar las actividades de la asociación, financiar programas de investigación y exploración y proteger nuestro patrimonio nacional.',
      'store.cta': 'Comprar ahora',
      'store.imgAlt': 'Tienda AMARE',

      'newsletter.title': 'Suscríbete a nuestro boletín',
      'newsletter.desc': 'Sé el primero en enterarte de nuestros últimos programas, eventos e historias de éxito que construimos juntos.',
      'newsletter.aria': 'Correo electrónico',
      'newsletter.placeholder': 'Tu correo electrónico',
      'newsletter.cta': 'Suscribirse',
      'newsletter.success': '¡Gracias! Tu suscripción se ha registrado correctamente.',
      'newsletter.error': 'Por favor, introduce un correo electrónico válido.',

      'footer.quickLinks': 'Enlaces rápidos',
      'footer.programs': 'Nuestros programas',
      'footer.contact': 'Contáctanos',
      'footer.location': 'Nuestra ubicación',
      'footer.mapTitle': 'Ubicación de la asociación en el mapa',
      'footer.mapBtn': 'Abrir en Google Maps',
      'footer.rightsReserved': 'Todos los derechos reservados.',
      'footer.privacy': 'Política de privacidad',
      'footer.terms': 'Términos y condiciones',

      'admin.db': 'Base de datos',
      'admin.content': 'Gestión de contenido',
      'admin.dashboard': 'Panel de control',

      'page.home': 'Asociación Marroquí de Investigación y Exploración | Juntos creamos un impacto real',
      'page.news': 'Noticias | Últimas noticias de la asociación | Asociación Marroquí de Investigación y Exploración',
      'page.contact': 'Contáctanos | Asociación Marroquí de Investigación y Exploración',
      'page.login': 'Iniciar sesión | Asociación Marroquí de Investigación y Exploración',
    },

    zgh: {
      'lang.select': 'ⵙⵜⵉ ⵜⵓⵜⵍⴰⵢⵜ',
      'lang.aria': 'ⵙⵜⵉ ⵜⵓⵜⵍⴰⵢⵜ',

      'misc.skip': 'ⵙⵏⵜⵜⵍ ⵖⵔ ⵓⴳⴰⵡⴰⵙ ⴰⵎⵣⵡⴰⵔⵓ',
      'misc.backToTop': 'ⵔⵣⵣⵓ ⵖⵔ ⵜⴰⴼⴰⵡⵜ',

      'social.facebook': 'Facebook',
      'social.instagram': 'Instagram',
      'social.linkedin': 'LinkedIn',
      'social.youtube': 'YouTube',

      'topbar.whatsapp': 'WhatsApp',
      'topbar.whatsappAria': 'ⵜⵎⴰⵙⴰⵔⴰ ⴷ ⵏⵏⵖ ⵙ WhatsApp',
      'topbar.store': 'ⴰⵏⵣⴰ ⵏ AMARE',
      'topbar.brandAria': 'ⴰⵙⵏⵓ',

      'nav.main': 'ⴰⵎⴰⵔⴰⵢ ⴰⵎⵣⵡⴰⵔⵓ',
      'nav.home': 'ⴰⵙⵏⵓ',
      'nav.about': 'ⵅⴼ ⵏⵏⵖ',
      'nav.activities': 'ⵉⵎⴰⵍⴰⵙⵏ ⵏⵏⵖ',
      'nav.partners': 'ⵉⵎⴷⴰⵡⴰⵏ ⵏⵏⵖ',
      'nav.services': 'ⵉⵙⵉⵖⵉⵎⵏ ⵏⵏⵖ',
      'nav.branches': 'ⵉⴼⵕⵄⵏ ⵉⵏⴰⴷⵓⵔⴰⵏ',
      'nav.join': 'ⴽⵛⵎ ⴷ ⵏⵏⵖ',
      'nav.news': 'ⵉⵏⵖⵎⵉⵙⵏ',
      'nav.archive': 'ⴰⵎⴰⵔⴰⵏ',
      'nav.contact': 'ⵜⵎⴰⵙⴰⵔⴰ ⴷ ⵏⵏⵖ',
      'nav.login': 'ⴰⵏⵛⵎⵎⴽ',
      'nav.logout': 'ⴰⴼⵙⵙⵉ',
      'nav.admin': 'ⵜⵉⵙⵓⴼⴰ',
      'nav.store': 'ⴰⵏⵣⴰ',
      'nav.openMenu': 'ⵔⵣⵎ ⵜⵓⵎⵔⵉⵏ',
      'nav.closeMenu': 'ⵇⵇⵙ ⵜⵓⵎⵔⵉⵏ',
      'nav.mobileMenu': 'ⵜⴰⵎⵓⵎⵔⵉⵏ ⵜⴰⵎⵣⵡⴰⵔⵓⵜ',
      'nav.submenu': 'ⵔⵣⵎ ⵜⴰⵎⵓⵎⵔⵉⵏ ⵜⴰⵎⵣⵔⴰⵡⵜ',
      'nav.viewAll': 'ⵥⵕ ⴰⴽⴽⵯ',
      'nav.activePage': 'ⵜⴰⵙⵏⴰ ⵜⴰⵎⵉⵔⴰⵏⵜ',

      'meta.description': 'ⵜⴰⵎⵣⴳⵉⴷⴰ ⵜⴰⵎⵖⵔⵉⴱⵉⵢⵜ ⵏ ⵉⵏⵎⵉⵏⴰⵢⵏ ⵏ ⵓⵎⴰⴷⴷⵓⵔ ⴷ ⵜⵎⵣⵣⴰⵍⵍⵉⵜ — ⵜⴰⵎⵣⴳⵉⴷⴰ ⵜⴰⵎⵖⵔⵉⴱⵉⵢⵜ ⵍⵍⵉ ⵉⵅⴷⴷⵎⵏ ⵅⴼ ⵜⵏⵖⵎⵉ, ⵜⵓⵙⵙⵏⴰ ⴷ ⵓⵎⴰⴷⴰ ⴰⴷⵉⵎⵙⴰⵏ, ⵙ ⵓⴳⴳⴰⵔ ⵏ 500 ⵏ ⵓⵎⵙⵏⴰⵎ ⴷ 12 ⵏ ⵉⵙⴳⴳⵯⴰⵙⵏ ⵏ ⵜⵡⵓⵔⵉ ⵖ ⵓⵙⴰⵢⵙ.',
      'meta.keywords': 'ⵜⴰⵎⵣⴳⵉⴷⴰ, ⵜⵏⵖⵎⵉ, ⵜⵓⵏⵏⵓⵏⵜ, ⵍⵎⵖⵔⵉⴱ, ⵜⵡⵓⵔⵉ ⵏ ⵍⵅⵉⵔ, ⴰⵎⴰⴷⴰ',
      'meta.author': 'ⵜⴰⵎⵣⴳⵉⴷⴰ ⵜⴰⵎⵖⵔⵉⴱⵉⵢⵜ ⵏ ⵉⵏⵎⵉⵏⴰⵢⵏ ⵏ ⵓⵎⴰⴷⴷⵓⵔ ⴷ ⵜⵎⵣⵣⴰⵍⵍⵉⵜ',
      'meta.ogTitle': 'ⵜⴰⵎⵣⴳⵉⴷⴰ ⵜⴰⵎⵖⵔⵉⴱⵉⵢⵜ ⵏ ⵉⵏⵎⵉⵏⴰⵢⵏ ⵏ ⵓⵎⴰⴷⴷⵓⵔ ⴷ ⵜⵎⵣⵣⴰⵍⵍⵉⵜ',
      'meta.ogDescription': 'ⵉⵎⵏⵓ ⵏⵙⴰⵡⵍ ⴰⵀⵉⵍ ⴰⵏⵇⵇⴰⵏ ⵖ ⵓⵏⴰⵎⵓⵔ',

      'hero.aria': 'ⵜⴰⵔⴱⴱⵉⵄⵜ ⵏ ⵉⵎⵏⵏⵓⵜⵉⵏ ⵍⵍⵉ ⵉⵅⴷⴷⵎⵏ ⵖ ⵉⵎⵛⵔⵓⵄ ⴰⵎⴰⵣⵉⵔⴰⵏ',
      'hero.eyebrow': 'ⴰⵔ ⴷ ⴰⵡⵉⵍⵏⵉⵏ ⵉⵏⵛⵎⵎⴰⴽⵏ ⵏ ⵜⵎⵣⵣⴰⵍⵍⵉⵜ ⵜⴰⵏⴰⵎⵓⵔⵜ',
      'hero.title': 'ⴰⵊⵊ ⴰⴷ ⵜⵎⵥⵍⵉⴹ...<br>ⴰⵊⵊ ⴰⴷ ⵜⴰⵊⵊ ⵏⵜⵜⵓⵏⵏⵉ...<br>ⴽⵛⵎ ⴷ ⵜⴰⵎⵣⴳⵉⴷⴰ ⵜⴰⵎⵖⵔⵉⴱⵉⵢⵜ<br><span>ⵏ ⵉⵏⵎⵉⵏⴰⵢⵏ ⵏ ⵓⵙⴳⴰⵡ ⴷ ⵓⵙⵖⵉⵎⵙ</span>',
      'hero.desc': 'ⴰⵊⵊ ⴰⵢⵏⵏ ⴰⴷ ⵜⵙⴰⴽⵔ ⵖ ⵜⵎⵣⵣⴰⵍⵍⵉⵜ ⵜⴰⵏⴰⵎⵓⵔⵜ, ⴰⵊⵊ ⴰⴷ ⵜⴽⵛⵎ ⵙ ⵓⵏⵟⵟⴰⵍ ⵏ ⵜⵎⵣⴳⵉⴷⴰ, ⵏⵖ ⴰⴷ ⵜⵓⵏⴳⵉ ⵜⴰⵏⵉⵎⴰⵏⵜ ⵏⵏⴽ, ⵙ ⵓⵀⵉⵍ ⵙⵙⴰⵃⴱ ⵉⵙⵏⵓⴱⴱⵄⵏ ⵏ ⵜⵉⴷⵎⵎⵉ ⴷ ⵉⵏⵖⵎⵉⵙⵏ ⵙ ⵜⴰⵙⴰⵡⵓⵏⵜ ⵜⴰⵏⴰⵎⵓⵏⵜ.',
      'hero.cta1': 'ⴰⵊⵊ ⴰⴷ ⵜⵙⵙⵏ ⴰⴳⵎⵎⵉ ⴰⴷ ⵜⴰⵏⴰⵎⵓⵔⵜ',
      'hero.cta2': 'ⴽⵛⵎ ⴷ ⵜⴰⵎⵣⴳⵉⴷⴰ',
      'hero.cta3': 'ⵓⵏⴳⵉ ⵜⴰⵏⵉⵎⴰⵏⵜ',
      'hero.scroll': 'ⴰⴳⴰⵔ ⵖⵔ ⵉⵣⴷⴰⵔ',

      'about.eyebrow': 'ⵅⴼ ⵏⵏⵖ',
      'about.title': 'ⵏⵏⵉⵖ ⴰⴷ ⵏⴱⵏⵓ ⵖⴰⵙⴰⵙ',
      'about.titleEm': 'ⴰⵙⴽⴽⴰ',
      'about.titleSub': 'ⵉⴼⵍⵓ ⵉⴼⵍ ⵉ ⵉⵎⵓⴹⴰⵏ ⵏ ⵜⵎⴰⵏⵓⵜ',
      'about.desc': 'ⵣⴳ 2014 ⵏⵙⴰⵡⵍ ⴰⵏⵓⵖⵏⵓ ⵖ ⵓⴷⵔⴰⵔ ⵏ ⵎⴰⵢⵏ ⵉⵖⵉ ⵉⵖⴰⵙⵏ ⵏ ⵜⵉⵡⵓⵔⵉⵡⵉⵏ ⵜⵉⵎⵖⵔⵉⴱⵉⵢⵉⵏ',
      'about.p1': 'ⵜⵍⵍⴰ ⵜⵎⵣⴳⵉⴷⴰ ⵜⴰⵎⵖⵔⵉⴱⵉⵢⵜ ⵏ ⵉⵏⵎⵉⵏⴰⵢⵏ ⵏ ⵓⵙⴳⴰⵡ ⴷ ⵓⵙⵖⵉⵎⵙ ⴳ ⵓⵙⴳⴳⵯⴰⵙ 2014, ⵙ ⵢⴰⵜ ⵜⵔⴰⴱⴱⵉⵄⵜ ⵏ ⵉⵏⴰⵎⵓⵔⵏ ⵉⵎⴰⴷⴰⵏⵏ, ⴱⴰⵛ ⴰⴷ ⵜⵜⵊⴰⵡⴱ ⵉ ⵉⵃⵡⴰⵢⵊ ⵏ ⵉⵏⴰⵎⵓⵔⵏ ⵉⵏⵖⵔⵉⴱⵏ ⵙ ⵉⵎⵛⵔⵓⵄⵏ ⵉⵎⴰⵣⵉⵔⴰⵏⵏ ⵖ ⵜⵓⵙⵙⵏⴰ, ⵜⴰⴷⵓⵙⵉ ⴷ ⵓⵎⴰⴷⴰ ⴰⴷⵉⵎⵙⴰⵏ.',
      'about.p2': 'ⵏⵣⵉⵀⵎ ⵎⴰⵙ ⴰⵀⵉⵍ ⴰⴷⴷⵓⵔ ⵉⵎⵓⵏ ⵉⴱⴷⴰ ⵙ ⵉⵏⴰⵎⵓⵔⵏ, ⵓⵔ ⵉⵙ ⵏⵅⴷⴷⵎ ⴷ ⵉⵎⵏⵏⵓⵜⵉⵏ ⴷ ⵉⵎⴷⴰⵡⴰⵏ ⴱⴰⵛ ⴰⴷ ⵏⴱⵏⵓ ⵜⵉⴼⵔⴰⴽⵉⵏ ⵍⵍⵉ ⵢⴰⴷ ⵉⵇⵇⵉⵎⵏ ⵉ ⵉⵙⴳⴳⵯⴰⵙⵏ ⴷ ⵎⵏⵏⴰⵡ ⵏ ⵉⵎⵔⵔⵓⵙⵏ.',
      'about.f1t': 'ⵉⵎⵛⵔⵓⵄⵏ ⵉⵙⵍⵎⴰⵏ',
      'about.f1d': 'ⴰⵎⴰⵡⴰⵍ ⴰⵙⴽⴰⵡⴰⵏ ⴷ ⵜⵓⴷⴷⵓⵜ ⵉ ⵉⵏⵓⵙⵉⴷⴰⵜⵏ ⴷ ⵉⵎⵇⵇⵓⵔⵏ ⴱⴰⵛ ⴰⴷ ⵖⵉⵍⵉⵏ ⵜⵉⵙⵓⴷⴷⵙⵉⵏ ⵜⵉⵍⵎⴰⵏⵉⵏ.',
      'about.f2t': 'ⵜⴰⴷⵓⵙⵉ',
      'about.f2d': 'ⵜⵉⵔⴰⴱⴱⵉⵄⵉⵏ ⵜⵉⵏⵜⵉⴳⵎⴰⵏⵉⵏ ⵜⵉⴱⵉⴷⴰⵖⴰⵏⵉⵏ ⴷ ⵜⵉⴳⵓⵎⵎⴰⵏⵉⵏ ⵉ ⵜⵡⴰⵛⵓⵍⵉⵏ ⵏ ⵜⵎⵏⴰⴹⵉⵏ ⵜⵉⵏⴰⵔⵓⵣⵣⵉⵏ.',
      'about.f3t': 'ⴰⵎⴰⴷⴰ ⴰⴷⵉⵎⵙⴰⵏ',
      'about.f3d': 'ⴰⵙⵖⵉⵎⵙ ⵓⵣⵣⵓⵔ ⴷ ⵓⵎⴰⵡⴰⵍ ⵏ ⵉⵎⵛⵔⵓⵄⵏ ⵉⵣⵎⵎⵉⵎⵏ ⴰⴷⴰⵔ ⵉ ⵜⵎⵖⴰⵔⵉⵏ ⴷ ⵉⵎⵛⴰⵢⵏ.',
      'about.btn1': 'ⵙⵙⵏ ⵉⵎⵛⵔⵓⵄⵏ ⵏⵏⵖ',
      'about.btn2': 'ⵜⵎⴰⵙⴰⵔⴰ ⴷ ⵏⵏⵖ',
      'about.imgAlt': 'ⵉⵎⵏⵏⵓⵜⵉⵏ ⵖ ⵓⵙⴰⵢⵙ',
      'about.stat1': 'ⵏ ⵉⵏⴰⵎⵓⵔⵏ',
      'about.stat2': 'ⵏ ⵉⵎⵏⵏⵓⵜⵉⵏ',
      'about.stat3': 'ⵏ ⵉⵙⴳⴳⵯⴰⵙⵏ',

      'features.eyebrow': 'ⵎⴰⵖⴰⵔ ⵜⴰⵎⵣⴳⵉⴷⴰ ⵜⴰⵎⵖⵔⵉⴱⵉⵢⵜ ⵏ ⵓⵙⴳⴰⵡ ⴷ ⵓⵙⵖⵉⵎⵙ',
      'features.title': 'ⵉⵏ ⵉⵥⵍⴰⵏ ⵙ ⵜⵡⵓⵔⵉ ⵏⵏⵖ',
      'features.desc': 'ⵏⴷⴷⵓ ⵣⴳ ⵜⵏⵖⵎⵉⵡⵉⵏ ⵏ ⵓⵙⴰⵢⵙ ⴷ ⵜⵓⵏⵏⵓⵏⵜ ⵉⵎⵏⵓ ⴱⴰⵛ ⴰⴷ ⵏⵎⵍ ⴰⵀⵉⵍ ⴰⵏⵇⵇⴰⵏ ⴷ ⵓⴷⵎⴰⵏ ⵖ ⴽⵓ ⵢⴰⵏ ⵉⵎⵛⵔⵓⵄ ⵏⵏⵖ.',
      'features.c1t': 'ⵉⵎⵛⵔⵓⵄⵏ ⵉⵙⵍⵎⴰⵏ',
      'features.c1d': 'ⴰⵎⴰⵡⴰⵍ ⴰⵙⴽⴰⵡⴰⵏ ⴷ ⵜⵓⴷⴷⵓⵜ ⵉ ⵉⵏⵓⵙⵉⴷⴰⵜⵏ ⴷ ⵉⵎⵇⵇⵓⵔⵏ.',
      'features.c2t': 'ⵜⴰⴷⵓⵙⵉ',
      'features.c2d': 'ⵜⵉⵔⴰⴱⴱⵉⵄⵉⵏ ⵜⵉⵏⵜⵉⴳⵎⴰⵏⵉⵏ ⵜⵉⴱⵉⴷⴰⵖⴰⵏⵉⵏ ⵉ ⵜⵡⴰⵛⵓⵍⵉⵏ.',
      'features.c3t': 'ⴰⵎⴰⴷⴰ ⴰⴷⵉⵎⵙⴰⵏ',
      'features.c3d': 'ⴰⵙⵖⵉⵎⵙ ⵓⵣⵣⵓⵔ ⴷ ⵓⵎⴰⵡⴰⵍ ⵏ ⵉⵎⵛⵔⵓⵄⵏ ⵉⵣⵎⵎⵉⵎⵏ ⴰⴷⴰⵔ.',
      'features.c4t': 'ⵜⵓⵏⵏⵓⵏⵜ ⵉⵎⵏⵓ',
      'features.c4d': 'ⵉⵏⵏⴰⵢⵏ ⵉⵏⴼⵉⵏⵔⵉⵢⵏ ⴷ ⵏ ⵓⵙⴰⵢⵙ ⵍⵍⵉ ⵍⵍⴰⵏ ⵉ ⵉⵎⵏⴰⴷⴰⵢⵏ ⴷ ⵉⵎⴷⴰⵡⴰⵏ ⴰⴽⴽⵯ.',

      'activities.title': 'ⵉⵎⴰⵍⴰⵙⵏ ⵏⵏⵖ',
      'activities.desc': 'ⵙⵙⵏ ⵉⵎⴰⵍⴰⵙⵏ ⴷ ⵉⵎⵛⵔⵓⵄⵏ ⵉⵎⵓⵏⴰⵡⵏ ⵍⵍⵉ ⵜⵙⴽⵔ ⵜⵎⵣⴳⵉⴷⴰ ⵖ ⵓⵙⴳⴳⵯⴰⵙ.',
      'activities.a1t': 'ⵜⵓⵙⵙⵉⴹⴰ ⵏ ⵜⵖⴰⵡⵉⵡⵉⵏ',
      'activities.a1d': 'ⵜⵉⵎⵖⵓⵔⵉⵏ ⵏ ⵓⵙⴰⵢⵙ ⴷ ⵓⵙⵖⵉⵎⵙ ⴱⴰⵛ ⴰⴷ ⵏⵙⵙⵏ ⵜⵉⴳⵉⵔⴰ ⴷ ⵉⵍⵍⴰⵙ ⵏ ⵜⴰⴳⵍⴷⵉⵜ.',
      'activities.a2t': 'ⵜⵉⵎⵣⵣⴰⵍⵍⵉⵏ ⴷ ⵉⵔⴰⵍⵢⴰⵜⵏ',
      'activities.a2d': 'ⴰⵙⵏⵎⴰⵍⴰ ⵏ ⵜⵎⵣⵣⴰⵍⵍⵉⵏ ⴷ ⵉⵙⴽⴽⵉⵍⵏ ⵏ ⵓⵙⵖⵉⵎⵙ ⴱⴰⵛ ⴰⴷ ⵏⵣⵣⵓⵏⴳⵓⵎ ⵣⵖ ⵓⵏⵎⵎⴰⵍ ⵏ ⵜⵔⴱⴱⵉⵄⵜ.',
      'activities.a3t': 'ⵉⵙⵖⵉⵎⵏ',
      'activities.a3d': 'ⵜⵉⵎⵔⴰⵡⵉⵏ ⴷ ⵉⵙⵖⵉⵎⵏ ⵖ ⵓⵙⴳⴰⵡ, ⵓⵙⵖⵉⵎⵙ ⴷ ⵉⵎⴰⵡⴰⵍⵏ ⵉⵣⵡⴰⵔⵏ.',
      'activities.a4t': 'ⵉⵎⵥⵍⵉⵄⵏ',
      'activities.a4d': 'ⵉⵎⵥⵍⵉⵄⵏ ⵉⵎⵓⵙⵏⴰⵡⵏ ⴷ ⵉⵏⴰⵎⵓⵏⵏ ⴱⴰⵛ ⴰⴷ ⵏⵙⵙⵏ ⵉⵍⵍⴰⵙ ⴰⵏⴰⵎⵓⵔ ⴷ ⵓⵙⵖⵉⵎⵙ.',
      'activities.a5t': 'ⵜⵉⵎⵍⴰⵢⵉⵏ',
      'activities.a5d': 'ⵜⵉⵎⵍⴰⵢⵉⵏ ⵜⵉⵎⵓⵙⵏⴰⵡⵉⵏ ⴷ ⵜⵉⵏⵖⵎⵉⵙⵉⵏ ⴷ ⵉⵎⵙⵙⵏⵡⵏ ⴷ ⵉⵏⵎⵉⵏⴰⵢⵏ.',
      'activities.a6t': 'ⵜⵉⵡⵉⵏⴰⵢⵉⵏ ⵜⵉⵎⴰⵣⵉⵔⴰⵏⵉⵏ',
      'activities.a6d': 'ⵜⵉⵡⵉⵏⴰⵢⵉⵏ ⵏ ⵡⴰⵖⴱⴰⵍ ⵏ ⵜⵉⴳⵉⵔⴰ ⴷ ⵓⵃⵟⵟⵓ ⵏ ⵉⵙⴰⵢⵙ ⴷ ⵜⵓⴷⵓⵔⵜ ⵏ ⵉⵙⴼⵉⵡⵏ.',
      'activities.more': 'ⵙⵙⵏ ⵓⴳⴳⴰⵔ',
      'activities.a1alt': 'ⵜⵓⵙⵙⵉⴹⴰ ⵏ ⵜⵖⴰⵡⵉⵡⵉⵏ',
      'activities.a2alt': 'ⵜⵉⵎⵣⵣⴰⵍⵍⵉⵏ ⴷ ⵉⵔⴰⵍⵢⴰⵜⵏ',
      'activities.a3alt': 'ⵉⵙⵖⵉⵎⵏ',
      'activities.a4alt': 'ⵉⵎⵥⵍⵉⵄⵏ',
      'activities.a5alt': 'ⵜⵉⵎⵍⴰⵢⵉⵏ',
      'activities.a6alt': 'ⵜⵉⵡⵉⵏⴰⵢⵉⵏ ⵜⵉⵎⴰⵣⵉⵔⴰⵏⵉⵏ',

      'news.eyebrow': 'ⵉⵏⵖⵎⵉⵙⵏ ⵉⵎⵇⵇⵓⵔⵏ',
      'news.title': 'ⵉⵏⵖⵎⵉⵙⵏ ⴷ ⵉⵎⴰⵍⴰⵙⵏ ⵏ ⵜⵎⵣⴳⵉⴷⴰ',
      'news.badge1': 'ⵜⵓⵙⵙⵏⴰ',
      'news.badge2': 'ⵜⴰⴷⵓⵙⵉ',
      'news.badge3': 'ⴰⵎⴰⴷⴰ',
      'news.c1t': 'ⴰⵙⵙⵏⵜⵉ ⵏ ⵓⵎⵛⵔⵓⵄ ⵏ ⵜⵎⵓⵔⵣⴰⵡⵉⵏ ⵏ ⵓⵙⴳⴳⵯⴰⵙ ⴰⵎⴰⵢⵏⵓ',
      'news.c1d': '12 ⵢⵓⵍⵢⵓⵣ 2026',
      'news.c2t': 'ⵜⴰⵔⴰⴱⴱⵉⵄⵜ ⵜⵓⵏⵜⵉⴳⵎⴰⵏⵜ ⵉⵙⵏⴰⵎⴰⵏ ⵓⴳⴳⴰⵔ ⵏ 300 ⵏ ⵓⴼⴳⴰⵏ',
      'news.c2d': '28 ⵢⵓⵏⵢⵓ 2026',
      'news.c3t': 'ⴰⵙⵙⵏⵜⵉ ⵏ ⵜⵉⵎⵔⴰⵡⵉⵏ ⵏ ⵓⵙⵖⵉⵎⵙ ⵓⵣⵣⵓⵔ ⵉ 40 ⵏ ⵜⵎⵖⴰⵔⵜ',
      'news.c3d': '05 ⵢⵓⵏⵢⵓ 2026',
      'news.more': 'ⵖⵔ ⵓⴳⴳⴰⵔ',
      'news.img1alt': 'ⵜⴰⴼⴰⵙⴽⴰ ⵏ ⵜⵎⵓⵔⵣⴰⵡⵉⵏ',
      'news.img2alt': 'ⵜⴰⵔⴰⴱⴱⵉⵄⵜ ⵜⵓⵏⵜⵉⴳⵎⴰⵏⵜ',
      'news.img3alt': 'ⴰⵙⵖⵉⵎⵙ ⵉ ⵜⵎⵖⴰⵔⵉⵏ',

      'store.eyebrow': 'ⴰⵏⵣⴰ ⵏ AMARE',
      'store.title': 'ⴰⵡⵙ ⵉ ⵓⵎⵛⵔⵓⵄ ⵏⵏⵖ<br>ⵙ ⵉⴼⵔⴰⵖⵏ ⵉⵎⵣⵣⵓⵣⵏ',
      'store.desc': 'ⵙⵙⵏ ⴰⴳⵔⵓ ⴰⵎⵣⵣⵓⵣ ⵏ ⵉⴼⵔⴰⵖⵏ ⵏ AMARE. ⴽⵓ ⵢⴰⵏ ⵉⵏⵣⵣⴰ ⵉⵜⵜⴰⵡⵙ ⵉ ⵜⵡⵓⵔⵉⵡⵉⵏ ⵏ ⵜⵎⵣⴳⵉⴷⴰ, ⵉⵜⵜⴰⵡⵙ ⵉ ⵉⵎⵛⵔⵓⵄⵏ ⵏ ⵓⵙⴳⴰⵡ ⴷ ⵓⵙⵖⵉⵎⵙ, ⴷ ⵓⵃⵟⵟⵓ ⵏ ⵉⵍⵍⴰⵙ ⴰⵏⴰⵎⵓⵔ.',
      'store.cta': 'ⴰⵣⵣⵏ ⴷⴰⴳⵉ',
      'store.imgAlt': 'ⴰⵏⵣⴰ ⵏ AMARE',

      'newsletter.title': 'ⴰⵔⴰ ⵖⵔ ⵉⵏⵖⵎⵉⵙⵏ ⵏⵏⵖ',
      'newsletter.desc': 'ⴰⵢⵜ ⵉⵣⵡⴰⵔⵏ ⴰⴷ ⵜⵙⵙⵏ ⵅⴼ ⵉⵎⵛⵔⵓⵄⵏ ⴷ ⵉⵎⴰⵍⴰⵙⵏ ⴷ ⵉⵙⴰⵢ ⵏ ⵓⵎⵉⴹⴰⵏ ⵍⵍⵉ ⵏⵙⴽⵔ ⴷ ⵢⴰⵏ.',
      'newsletter.aria': 'ⵉⵎⴰⵢⵍ ⵏⵏⴽ',
      'newsletter.placeholder': 'ⵉⵎⴰⵢⵍ ⵏⵏⴽ',
      'newsletter.cta': 'ⴰⵔⴰ ⵖⵉⵍⴰ',
      'newsletter.success': 'ⵜⴰⵏⵎⵎⵉⵔⵜ! ⵜⵓⵔⴰ ⵜⵉⵔⴰⵎⵓⵜ ⵏⵏⴽ ⵙ ⵍⵎⵏⴰⵃ.',
      'newsletter.error': 'ⵜⵓⵊⴰ ⴰⴷ ⵜⴽⵛⵎ ⵉⵎⴰⵢⵍ ⵉⵏⴷⴷⵏ.',

      'footer.quickLinks': 'ⵉⵙⵡⴷⴰⵢⵏ ⵉⴱⴷⴷⴰⵏ',
      'footer.programs': 'ⵉⵎⵛⵔⵓⵄⵏ ⵏⵏⵖ',
      'footer.contact': 'ⵜⵎⴰⵙⴰⵔⴰ ⴷ ⵏⵏⵖ',
      'footer.location': 'ⴰⵎⵣⴳⴰⵏ ⵏⵏⵖ',
      'footer.mapTitle': 'ⴰⵎⵣⴳⴰⵏ ⵏ ⵜⵎⵣⴳⵉⴷⴰ ⵖ ⵜⴽⴰⵔⴹⴰ',
      'footer.mapBtn': 'ⵔⵣⵎ ⵖ Google Maps',
      'footer.rightsReserved': 'ⴰⴽⴽⵯ ⵉⵣⵔⴼⴰⵏ ⵜⵜⵓⵃⵟⵟⴰⵏ.',
      'footer.privacy': 'ⴰⵙⵙⴰⵔⵓ ⵏ ⵜⵉⵏⵎⵎⴰⵙⵉⵏ',
      'footer.terms': 'ⵉⵣⵔⴼⴰⵏ ⴷ ⵉⵙⵓⴼⵏ',

      'admin.db': 'ⵜⴰⵙⵉⵍⴰ',
      'admin.content': 'ⴰⵙⵖⵉⵎⵙ ⵏ ⵓⴳⴰⵡⴰⵙ',
      'admin.dashboard': 'ⵜⴰⵙⵎⵓⵏⵉⵜ',

      'page.home': 'ⵜⴰⵎⵣⴳⵉⴷⴰ ⵜⴰⵎⵖⵔⵉⴱⵉⵢⵜ ⵏ ⵓⵙⴳⴰⵡ ⴷ ⵓⵙⵖⵉⵎⵙ | ⵉⵎⵏⵓ ⵏⵏⵙⴰⵡⵍ ⴰⵀⵉⵍ ⴰⵏⵇⵇⴰⵏ',
      'page.news': 'ⵉⵏⵖⵎⵉⵙⵏ | ⵉⵏⵖⵎⵉⵙⵏ ⵉⵎⵇⵇⵓⵔⵏ ⵏ ⵜⵎⵣⴳⵉⴷⴰ | ⵜⴰⵎⵣⴳⵉⴷⴰ ⵜⴰⵎⵖⵔⵉⴱⵉⵢⵜ ⵏ ⵓⵙⴳⴰⵡ ⴷ ⵓⵙⵖⵉⵎⵙ',
      'page.contact': 'ⵜⵎⴰⵙⴰⵔⴰ ⴷ ⵏⵏⵖ | ⵜⴰⵎⵣⴳⵉⴷⴰ ⵜⴰⵎⵖⵔⵉⴱⵉⵢⵜ ⵏ ⵓⵙⴳⴰⵡ ⴷ ⵓⵙⵖⵉⵎⵙ',
      'page.login': 'ⴰⵏⵛⵎⵎⴽ | ⵜⴰⵎⵣⴳⵉⴷⴰ ⵜⴰⵎⵖⵔⵉⴱⵉⵢⵜ ⵏ ⵓⵙⴳⴰⵡ ⴷ ⵓⵙⵖⵉⵎⵙ',
    },
  };

  /* ------------------------------------------------------------------ */
  /* Dynamic CMS labels — keyed by the English value stored in the DB    */
  /* (title_en on navigation_items / footer_columns / footer_items).     */
  /* Used only for fr / es / zgh since the DB has no such columns yet.   */
  /* ------------------------------------------------------------------ */
  var dynamic = {
    'Home': { fr: 'Accueil', es: 'Inicio', zgh: 'ⴰⵙⵏⵓ' },
    'About Us': { fr: 'À propos', es: 'Quiénes somos', zgh: 'ⵅⴼ ⵏⵏⵖ' },
    'Our Activities': { fr: 'Nos activités', es: 'Nuestras actividades', zgh: 'ⵉⵎⴰⵍⴰⵙⵏ ⵏⵏⵖ' },
    'Our Partners': { fr: 'Nos partenaires', es: 'Nuestros socios', zgh: 'ⵉⵎⴷⴰⵡⴰⵏ ⵏⵏⵖ' },
    'Our Services': { fr: 'Nos services', es: 'Nuestros servicios', zgh: 'ⵉⵙⵉⵖⵉⵎⵏ ⵏⵏⵖ' },
    'Regional Branches': { fr: 'Branches régionales', es: 'Sucursales regionales', zgh: 'ⵉⴼⵕⵄⵏ ⵉⵏⴰⴷⵓⵔⴰⵏ' },
    'Join Us': { fr: 'Rejoignez-nous', es: 'Únete a nosotros', zgh: 'ⴽⵛⵎ ⴷ ⵏⵏⵖ' },
    'News': { fr: 'Actualités', es: 'Noticias', zgh: 'ⵉⵏⵖⵎⵉⵙⵏ' },
    'Archive': { fr: 'Archives', es: 'Archivo', zgh: 'ⴰⵎⴰⵔⴰⵏ' },
    'Contact Us': { fr: 'Contactez-nous', es: 'Contáctanos', zgh: 'ⵜⵎⴰⵙⴰⵔⴰ ⴷ ⵏⵏⵖ' },
    'National Presidency': { fr: 'Présidence nationale', es: 'Presidencia nacional', zgh: 'ⴰⵏⵙⵙⵉⵅⴼ ⴰⵏⴰⵎⵓⵔ' },
    'Our Mission': { fr: 'Notre mission', es: 'Nuestra misión', zgh: 'ⵜⴰⵡⵓⵔⵉ ⵏⵏⵖ' },
    'Our Values': { fr: 'Nos valeurs', es: 'Nuestros valores', zgh: 'ⵉⵎⵢⴰⵍ ⵏⵏⵖ' },
    'Central Office': { fr: 'Bureau central', es: 'Oficina central', zgh: 'ⴰⵙⵎⴰⵍⵓ ⴰⵎⵎⴰⵙ' },
    'Expansion Map': { fr: 'Carte d’expansion', es: 'Mapa de expansión', zgh: 'ⵜⴰⴽⴰⵔⴹⴰ ⵏ ⵓⵎⵣⴳⵉⵡ' },
    'Outings': { fr: 'Sorties', es: 'Excursiones', zgh: 'ⵜⵓⵙⵙⵉⴹⴰ ⵏ ⵜⵖⴰⵡⵉⵡⵉⵏ' },
    'Competitions & Rallies': { fr: 'Compétitions & rallyes', es: 'Competiciones y rallys', zgh: 'ⵜⵉⵎⵣⵣⴰⵍⵍⵉⵏ ⴷ ⵉⵔⴰⵍⵢⴰⵜⵏ' },
    'Training': { fr: 'Formations', es: 'Formaciones', zgh: 'ⵉⵙⵖⵉⵎⵏ' },
    'Exhibitions': { fr: 'Expositions', es: 'Exposiciones', zgh: 'ⵉⵎⵥⵍⵉⵄⵏ' },
    'Meetings': { fr: 'Rencontres', es: 'Encuentros', zgh: 'ⵜⵉⵎⵍⴰⵢⵉⵏ' },
    'Environmental Campaigns': { fr: 'Campagnes environnementales', es: 'Campañas ambientales', zgh: 'ⵜⵉⵡⵉⵏⴰⵢⵉⵏ ⵜⵉⵎⴰⵣⵉⵔⴰⵏⵉⵏ' },
    'LeFouilleurma': { fr: 'LeFouilleurma', es: 'LeFouilleurma', zgh: 'LeFouilleurma' },
    'SENOTEC': { fr: 'SENOTEC', es: 'SENOTEC', zgh: 'SENOTEC' },
    'ASTROMET': { fr: 'ASTROMET', es: 'ASTROMET', zgh: 'ASTROMET' },
    'AssociationDetectionCentre': { fr: 'Centre de Détection', es: 'Centro de Detección', zgh: 'ⴰⵎⵎⴰⵙ ⵏ ⵓⵙⵙⵉⴹ' },
    'ANCPP': { fr: 'ANCPP', es: 'ANCPP', zgh: 'ANCPP' },
    'OMSDS': { fr: 'OMSDS', es: 'OMSDS', zgh: 'OMSDS' },
    'SOS AMARE': { fr: 'SOS AMARE', es: 'SOS AMARE', zgh: 'SOS AMARE' },
    'AMARE Store': { fr: 'Boutique AMARE', es: 'Tienda AMARE', zgh: 'ⴰⵏⵣⴰ ⵏ AMARE' },
    'Explorer House': { fr: 'Maison de l’explorateur', es: 'Casa del explorador', zgh: 'ⴰⵙⵏⵓ ⵏ ⵓⵙⵖⵉⵎⵙ' },
    'AMARE Magazine': { fr: 'Magazine AMARE', es: 'Revista AMARE', zgh: 'ⴰⵎⴰⴳⴰⵣⵉⵏ AMARE' },
    'AMARE Academy': { fr: 'Académie AMARE', es: 'Academia AMARE', zgh: 'ⵜⴰⵙⴷⴰⵡⵉⵜ AMARE' },
    'Clubs': { fr: 'Clubs', es: 'Clubes', zgh: 'ⵉⵏⴰⵡⵏ' },
    'Legal Advisor': { fr: 'Conseiller juridique', es: 'Asesor jurídico', zgh: 'ⴰⵎⵙⵉⵖⴼ ⴰⵣⵔⴼⴰⵏ' },
    'Insurance Contract': { fr: 'Contrat d’assurance', es: 'Contrato de seguro', zgh: 'ⵓⵎⴰⵖ ⵏ ⵜⵏⵏⴰⵢⵜ' },
    'Join Online': { fr: 'Adhérer en ligne', es: 'Afiliarse en línea', zgh: 'ⴽⵛⵎ ⴷ Online' },
    'Membership Renewal': { fr: 'Renouvellement d’adhésion', es: 'Renovación de membresía', zgh: 'ⵜⴰⵏⴳⴰ ⵏ ⵜⵏⵉⵎⴰⵏⵜ' },
    'Membership Documents': { fr: 'Documents d’adhésion', es: 'Documentos de membresía', zgh: 'ⵉⵙⴽⵯⴼⴰⵏ ⵏ ⵜⵏⵉⵎⴰⵏⵜ' },
    'Bylaws': { fr: 'Statuts', es: 'Estatutos', zgh: 'ⵓⵎⵉⵖ ⴰⵙⵍⴰⵏ' },
    'Internal Regulations': { fr: 'Règlement intérieur', es: 'Reglamento interno', zgh: 'ⴰⵙⵏⵉⵖⴼ ⴰⵏⵙⴰ' },
    'Association Charter': { fr: 'Charte de l’association', es: 'Carta de la asociación', zgh: 'ⵜⴰⴳⵯⵔⴰ ⵏ ⵜⵎⵣⴳⵉⴷⴰ' },
    'Final Deposit Receipt': { fr: 'Reçu de dépôt final', es: 'Recibo de depósito final', zgh: 'ⴰⵎⵟⵟⴰⵡ ⵏ ⵓⵙⴳⴳⴰⴷ ⴰⵎⴳⴳⴰⵔⵓ' },
    'Temporary Deposit Receipt': { fr: 'Reçu de dépôt temporaire', es: 'Recibo de depósito temporal', zgh: 'ⴰⵎⵟⵟⴰⵡ ⵏ ⵓⵙⴳⴳⴰⴷ ⴰⵎⵣⵣⴰⵔⵓ' },
    'Activity Notifications': { fr: 'Notifications d’activités', es: 'Notificaciones de actividades', zgh: 'ⵉⵙⵙⵉⵏ ⵏ ⵉⵎⴰⵍⴰⵙⵏ' },
    'About the Association': { fr: 'À propos de l’association', es: 'Sobre la asociación', zgh: 'ⵅⴼ ⵜⵎⵣⴳⵉⴷⴰ' },
    'Quick Links': { fr: 'Liens rapides', es: 'Enlaces rápidos', zgh: 'ⵉⵙⵡⴷⴰⵢⵏ ⵉⴱⴷⴷⴰⵏ' },
    'Our Programs': { fr: 'Nos programmes', es: 'Nuestros programas', zgh: 'ⵉⵎⵛⵔⵓⵄⵏ ⵏⵏⵖ' },
    'Our Location': { fr: 'Notre localisation', es: 'Nuestra ubicación', zgh: 'ⴰⵎⵣⴳⴰⵏ ⵏⵏⵖ' },
    'Activities': { fr: 'Activités', es: 'Actividades', zgh: 'ⵉⵎⴰⵍⴰⵙⵏ' },
    'Partners': { fr: 'Partenaires', es: 'Socios', zgh: 'ⵉⵎⴷⴰⵡⴰⵏ' },
    'Services': { fr: 'Services', es: 'Servicios', zgh: 'ⵉⵙⵉⵖⵉⵎⵏ' },
    'Branches': { fr: 'Branches', es: 'Sucursales', zgh: 'ⵉⴼⵕⵄⵏ' },
    'Tanger-Tetouan-Al Hoceima': { fr: 'Tanger-Tétouan-Al Hoceïma', es: 'Tánger-Tetuán-Alhucemas', zgh: 'ⵟⴰⵏⵊⴰ-ⵜⵉⵟⵟⴰⵡⵉⵏ-ⵍⵃⵓⵙⵉⵎⴰ' },
    'Oriental': { fr: 'Oriental', es: 'Oriental', zgh: 'ⴰⴳⵎⵓⴹ' },
    'Fes-Meknes': { fr: 'Fès-Meknès', es: 'Fez-Mequinez', zgh: 'ⴼⴰⵙ-ⵎⴽⵏⴰⵙ' },
    'Rabat-Sale-Kenitra': { fr: 'Rabat-Salé-Kénitra', es: 'Rabat-Salé-Kenitra', zgh: 'ⵕⴱⴰⵟ-ⵙⵍⴰ-ⵇⵏⵉⵟⵔⴰ' },
    'Beni Mellal-Khenifra': { fr: 'Béni Mellal-Khénifra', es: 'Beni Melal-Jenifra', zgh: 'ⴱⵏⵉ ⵎⵍⵍⴰⵍ-ⵅⵏⵉⴼⵔⴰ' },
    'Casablanca-Settat': { fr: 'Casablanca-Settat', es: 'Casablanca-Settat', zgh: 'ⴰⵏⴼⴰ-ⵙⵟⵟⴰⵜ' },
    'Marrakech-Safi': { fr: 'Marrakech-Safi', es: 'Marrakech-Safi', zgh: 'ⵎⵕⵕⴰⴽⵛ-ⴰⵙⴼⵉ' },
    'Draa-Tafilalet': { fr: 'Drâa-Tafilalet', es: 'Draa-Tafilalet', zgh: 'ⴷⵔⴰ-ⵜⴰⴼⵉⵍⴰⵍⵜ' },
    'Souss-Massa': { fr: 'Souss-Massa', es: 'Sus-Masa', zgh: 'ⵙⵓⵙ-ⵎⴰⵙⵙⴰ' },
    'Guelmim-Oued Noun': { fr: 'Guelmim-Oued Noun', es: 'Guelmim-Wadi Noun', zgh: 'ⴳⵓⵍⵎⵉⵎ-ⴰⵙⵉⴼ ⵏⵓⵏ' },
    'Laayoune-Sakia El Hamra': { fr: 'Laâyoune-Sakia El Hamra', es: 'El Aaiún-Saguía el Hamra', zgh: 'ⵍⵄⵢⵓⵏ-ⵜⴰⵇⵙⴰⵢⵜ ⵏ ⵜⴰⵖⵎⵔⵜ' },
    'Dakhla-Oued Eddahab': { fr: 'Dakhla-Oued Eddahab', es: 'Dajla-Río de Oro', zgh: 'ⴷⴰⵅⵍⴰ-ⴰⵙⵉⴼ ⵓⵍⵀⴱ' },
    'Contact': { fr: 'Contact', es: 'Contacto', zgh: 'ⵜⴰⵎⴰⵙⴰⵔⴰ' },
  };

  /* ------------------------------------------------------------------ */
  /* Homepage fallback data — mirrors supabase/home-content.js FALLBACK  */
  /* structure, translated for every language. Values that come from     */
  /* website_settings (brand/contact) are merged by home-content.js.     */
  /* ------------------------------------------------------------------ */
  function homeFallback() {
    var T = function (k) { return t(k); };
    var lang = currentLanguage;
    var linkMore = T('activities.more');

    var home = {
      hero: {
        heading: 'اكتشف...\nشارك...\nوانضم إلى الجمعية المغربية\nلهواة البحث والاستكشاف',
        subheading: 'التسجيل في المسابقة الوطنية مفتوح الآن',
        description: 'شارك في المسابقة الوطنية، وانخرط إلكترونياً في الجمعية، أو جدد عضويتك بسهولة، واطلع على آخر الأنشطة والفعاليات والأخبار عبر المنصة الرسمية.',
        backgroundImage: '',
        buttons: [
          { label: T('hero.cta1'), url: '/competition.html', variant: 'secondary' },
          { label: T('hero.cta2'), url: '/Join us/join-us-online.html', variant: 'primary' },
          { label: T('hero.cta3'), url: '/Join us/membership-renewal.html', variant: 'outline' },
        ],
      },
      about: {
        eyebrow: T('about.eyebrow'),
        heading: T('about.title'),
        headingHighlight: T('about.titleEm'),
        headingSub: T('about.titleSub'),
        description: T('about.desc'),
        paragraphs: [T('about.p1'), T('about.p2')],
        features: [
          { title: T('about.f1t'), description: T('about.f1d') },
          { title: T('about.f2t'), description: T('about.f2d') },
          { title: T('about.f3t'), description: T('about.f3d') },
        ],
        buttons: [
          { label: T('about.btn1'), url: '#services' },
          { label: T('about.btn2'), url: '#contact' },
        ],
        image: {
          url: 'https://images.unsplash.com/photo-1593113630400-ea4288922497?q=80&w=1000&auto=format&fit=crop',
          alt: T('about.imgAlt'),
        },
        stats: [
          { value: '500', suffix: '+', label: T('about.stat1') },
          { value: '120', suffix: '+', label: T('about.stat2') },
          { value: '12', suffix: '+', label: T('about.stat3') },
        ],
      },
      featuresGrid: {
        eyebrow: T('features.eyebrow'),
        heading: T('features.title'),
        description: T('features.desc'),
        cards: [
          { heading: T('features.c1t'), description: T('features.c1d') },
          { heading: T('features.c2t'), description: T('features.c2d') },
          { heading: T('features.c3t'), description: T('features.c3d') },
          { heading: T('features.c4t'), description: T('features.c4d') },
        ],
      },
      activitiesGrid: {
        heading: T('activities.title'),
        description: T('activities.desc'),
        cards: [
          { title: T('activities.a1t'), description: T('activities.a1d'), image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=900&auto=format&fit=crop', linkText: linkMore, linkUrl: '#' },
          { title: T('activities.a2t'), description: T('activities.a2d'), image: 'https://www.kechpresse.com/wp-content/uploads/2022/01/%D8%B1%D8%A7%D9%84%D9%8A-%D8%AF%D9%83%D8%A7%D8%B1-%D8%B3%D8%B9%D9%88%D8%AF%D9%8A.jpg', linkText: linkMore, linkUrl: '#' },
          { title: T('activities.a3t'), description: T('activities.a3d'), image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=900&auto=format&fit=crop', linkText: linkMore, linkUrl: '#' },
          { title: T('activities.a4t'), description: T('activities.a4d'), image: 'https://www.aldeereh.com/wp-content/uploads/2024/09/%D8%A7%D9%84%D8%B2%D9%88%D8%A7%D8%B1-%D9%8A%D8%AA%D9%88%D8%A7%D9%81%D8%AF%D9%88%D9%86-%D8%B9%D9%84%D9%89-%D9%85%D8%B9%D8%B1%D8%B6-%D8%A7%D9%84%D8%B1%D9%8A%D8%A7%D8%B6-%D8%A7%D9%84%D8%AF%D9%88%D9%84%D9%8A-%D9%84%D9%84%D9%83%D8%AA%D8%A7%D8%A8-2.jpg', linkText: linkMore, linkUrl: '#' },
          { title: T('activities.a5t'), description: T('activities.a5d'), image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=900&auto=format&fit=crop', linkText: linkMore, linkUrl: '#' },
          { title: T('activities.a6t'), description: T('activities.a6d'), image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=900&auto=format&fit=crop', linkText: linkMore, linkUrl: '#' },
        ],
      },
      newsGrid: {
        eyebrow: T('news.eyebrow'),
        heading: T('news.title'),
        cards: [
          { title: T('news.c1t'), date: T('news.c1d'), badge: T('news.badge1'), image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=700&auto=format&fit=crop', linkText: T('news.more'), linkUrl: '#' },
          { title: T('news.c2t'), date: T('news.c2d'), badge: T('news.badge2'), image: 'https://images.unsplash.com/photo-1584515933487-779824d29309?q=80&w=700&auto=format&fit=crop', linkText: T('news.more'), linkUrl: '#' },
          { title: T('news.c3t'), date: T('news.c3d'), badge: T('news.badge3'), image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=700&auto=format&fit=crop', linkText: T('news.more'), linkUrl: '#' },
        ],
      },
      storeCta: {
        heading: 'ادعم رسالتنا\nبمنتجات حصرية',
        description: 'اكتشف مجموعة منتجات AMARE الحصرية. كل عملية شراء تساهم في دعم أنشطة الجمعية، وتمويل برامج البحث والاستكشاف، وحماية التراث الوطني.',
        buttonLabel: T('store.cta'),
        buttonUrl: '/amare store/index.html',
        backgroundImage: 'Amare files /amare-shop.png',
      },
      newsletterCta: {
        heading: T('newsletter.title'),
        description: T('newsletter.desc'),
        buttonLabel: T('newsletter.cta'),
        buttonUrl: '#newsletter',
      },
      footer: {
        quickLinksHeading: T('footer.quickLinks'),
        programsHeading: T('footer.programs'),
        contactHeading: T('footer.contact'),
        mapHeading: T('footer.location'),
        mapLabel: '📍 Ait Melloul, Agadir',
        rightsReserved: T('footer.rightsReserved'),
        bottomLinks: [
          { label: T('footer.privacy'), url: '#' },
          { label: T('footer.terms'), url: '#' },
        ],
      },
    };

    if (lang === 'en') {
      home.hero.heading = 'Discover...\nParticipate...\nJoin the Moroccan Association\nfor Research and Exploration';
      home.hero.subheading = 'National competition registration is now open';
      home.hero.description = 'Participate in the national competition, join the association online, or easily renew your membership, and stay up to date with the latest activities, events and news through the official platform.';
      home.storeCta.heading = 'Support our mission\nwith exclusive products';
      home.storeCta.description = 'Discover AMARE\'s exclusive range of products. Every purchase helps support the association\'s activities, fund research and exploration programs, and protect our national heritage.';
    } else if (lang === 'fr') {
      home.hero.heading = 'Découvrez...\nParticipez...\nRejoignez l’association marocaine\ndes amateurs de recherche et d’exploration';
      home.hero.subheading = 'Les inscriptions au concours national sont ouvertes';
      home.hero.description = 'Participez au concours national, adhérez en ligne à l’association ou renouvelez facilement votre adhésion, et suivez les dernières activités, événements et actualités via la plateforme officielle.';
      home.storeCta.heading = 'Soutenez notre mission\navec des produits exclusifs';
      home.storeCta.description = 'Découvrez la gamme exclusive de produits AMARE. Chaque achat contribue à soutenir les activités de l\'association, à financer les programmes de recherche et d\'exploration et à protéger le patrimoine national.';
    } else if (lang === 'es') {
      home.hero.heading = 'Descubre...\nParticipa...\nÚnete a la Asociación Marroquí\nde Aficionados a la Investigación y la Exploración';
      home.hero.subheading = 'La inscripción al concurso nacional ya está abierta';
      home.hero.description = 'Participa en el concurso nacional, afíliate en línea a la asociación o renueva fácilmente tu membresía, y mantente al día con las últimas actividades, eventos y noticias a través de la plataforma oficial.';
      home.storeCta.heading = 'Apoya nuestra misión\ncon productos exclusivos';
      home.storeCta.description = 'Descubre la gama exclusiva de productos AMARE. Cada compra contribuye a apoyar las actividades de la asociación, financiar programas de investigación y exploración y proteger nuestro patrimonio nacional.';
    } else if (lang === 'zgh') {
      home.hero.heading = 'ⴰⵊⵊ ⴰⴷ ⵜⵎⵥⵍⵉⴹ...\nⴰⵊⵊ ⴰⴷ ⵜⴰⵊⵊ ⵏⵜⵜⵓⵏⵏⵉ...\nⴽⵛⵎ ⴷ ⵜⴰⵎⵣⴳⵉⴷⴰ ⵜⴰⵎⵖⵔⵉⴱⵉⵢⵜ\nⵏ ⵉⵏⵎⵉⵏⴰⵢⵏ ⵏ ⵓⵙⴳⴰⵡ ⴷ ⵓⵙⵖⵉⵎⵙ';
      home.hero.subheading = 'ⴰⵔ ⴷ ⴰⵡⵉⵍⵏⵉⵏ ⵉⵏⵛⵎⵎⴰⴽⵏ ⵏ ⵜⵎⵣⵣⴰⵍⵍⵉⵜ ⵜⴰⵏⴰⵎⵓⵔⵜ';
      home.hero.description = 'ⴰⵊⵊ ⴰⵢⵏⵏ ⴰⴷ ⵜⵙⴰⴽⵔ ⵖ ⵜⵎⵣⵣⴰⵍⵍⵉⵜ ⵜⴰⵏⴰⵎⵓⵔⵜ, ⴰⵊⵊ ⴰⴷ ⵜⴽⵛⵎ ⵙ ⵓⵏⵟⵟⴰⵍ ⵏ ⵜⵎⵣⴳⵉⴷⴰ, ⵏⵖ ⴰⴷ ⵜⵓⵏⴳⵉ ⵜⴰⵏⵉⵎⴰⵏⵜ ⵏⵏⴽ, ⵙ ⵓⵀⵉⵍ ⵙⵙⴰⵃⴱ ⵉⵙⵏⵓⴱⴱⵄⵏ ⵏ ⵜⵉⴷⵎⵎⵉ ⴷ ⵉⵏⵖⵎⵉⵙⵏ ⵙ ⵜⴰⵙⴰⵡⵓⵏⵜ ⵜⴰⵏⴰⵎⵓⵏⵜ.';
      home.storeCta.heading = 'ⴰⵡⵙ ⵉ ⵓⵎⵛⵔⵓⵄ ⵏⵏⵖ\nⵙ ⵉⴼⵔⴰⵖⵏ ⵉⵎⵣⵣⵓⵣⵏ';
      home.storeCta.description = 'ⵙⵙⵏ ⴰⴳⵔⵓ ⴰⵎⵣⵣⵓⵣ ⵏ ⵉⴼⵔⴰⵖⵏ ⵏ AMARE. ⴽⵓ ⵢⴰⵏ ⵉⵏⵣⵣⴰ ⵉⵜⵜⴰⵡⵙ ⵉ ⵜⵡⵓⵔⵉⵡⵉⵏ ⵏ ⵜⵎⵣⴳⵉⴷⴰ, ⵉⵜⵜⴰⵡⵙ ⵉ ⵉⵎⵛⵔⵓⵄⵏ ⵏ ⵓⵙⴳⴰⵡ ⴷ ⵓⵙⵖⵉⵎⵙ, ⴷ ⵓⵃⵟⵟⵓ ⵏ ⵉⵍⵍⴰⵙ ⴰⵏⴰⵎⵓⵔ.';
    }

    return home;
  }

  /* ------------------------------------------------------------------ */
  /* Core helpers                                                        */
  /* ------------------------------------------------------------------ */
  function normalizeLang(code) {
    if (code && LANGUAGES[code]) return code;
    if (code && LANG_ALIASES[code]) return LANG_ALIASES[code];
    return DEFAULT_LANG;
  }

  function readSavedLang() {
    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      if (saved && LANGUAGES[saved]) return saved;
    } catch (_) { /* ignore */ }
    return DEFAULT_LANG;
  }

  function saveLang(code) {
    try {
      localStorage.setItem(STORAGE_KEY, code);
    } catch (_) { /* ignore */ }
  }

  function t(key) {
    if (!key) return '';
    var table = translations[currentLanguage] || translations[DEFAULT_LANG];
    if (table && Object.prototype.hasOwnProperty.call(table, key)) return table[key];
    var fallback = translations[DEFAULT_LANG];
    if (fallback && Object.prototype.hasOwnProperty.call(fallback, key)) return fallback[key];
    /* Page-content dictionary — keys are the normalized Arabic strings. */
    if (AR_RE.test(key)) {
      var entry = lookupTextEntry(normText(key));
      if (entry) {
        var v = entry[currentLanguage];
        if (v) return v;
        if (entry[DEFAULT_LANG]) return entry[DEFAULT_LANG];
      }
    }
    return key;
  }

  function localizeDynamic(englishText) {
    if (!englishText) return null;
    var entry = dynamic[englishText];
    if (!entry) return null;
    return entry[currentLanguage];
  }

  /* Pick the right title for a DB row (navigation/footer) */
  function resolveNavLabel(item) {
    if (!item) return '';
    var lang = currentLanguage;
    if (lang === 'ar') return item.title_ar || item.title_en || '';
    if (lang === 'en') return item.title_en || item.title_ar || '';
    var dyn = localizeDynamic(item.title_en || item.title_ar || '');
    return dyn || item.title_ar || item.title_en || '';
  }

  function resolveNavDesc(item) {
    if (!item) return '';
    var lang = currentLanguage;
    if (lang === 'ar') return item.description_ar || '';
    if (lang === 'en') return item.description_en || item.description_ar || '';
    var dyn = localizeDynamic(item.title_en || item.title_ar || '');
    if (dyn) return dyn;
    return item.description_ar || '';
  }

  /* Footer rows share the same shape as nav rows (title_ar/title_en) */
  function resolveFooterLabel(item) {
    return resolveNavLabel(item);
  }

  /* ------------------------------------------------------------------ */
  /* Text-node pass — translates any visible Arabic text node whose      */
  /* normalized value matches the page-content dictionary, without       */
  /* requiring a data-i18n attribute. Covers static markup AND content   */
  /* injected by CMS content scripts.                                    */
  /* ------------------------------------------------------------------ */
  function isTranslatableTextNode(node) {
    if (!node || node.nodeType !== 3) return false;
    var parent = node.parentNode;
    if (!parent || !parent.hasAttribute) return false;
    var tag = parent.tagName ? parent.tagName.toUpperCase() : '';
    if (TEXT_SKIP_TAGS[tag]) return false;
    if (parent.isContentEditable) return false;
    if (parent.hasAttribute('data-i18n') || parent.hasAttribute('data-i18n-html')) return false;
    /* Skip text nodes inside CMS-owned sections that must preserve raw Arabic. */
    if (parent.closest && parent.closest('[data-amare-no-translate]')) return false;
    /* Previously translated by this pass — re-visit even though the node no
       longer contains Arabic (its original is tracked in arOriginals). */
    if (arOriginals.has(node)) return true;
    return AR_RE.test(node.data || '');
  }

  function collectTextNodes(root, filter) {
    var nodes = [];
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        return filter(node) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      },
    });
    while (walker.nextNode()) nodes.push(walker.currentNode);
    return nodes;
  }

  function translateTextNodes(root) {
    root = root || document.body || document;
    var lang = currentLanguage;
    if (lang === 'ar') {
      restoreArabicTextNodes(root);
      return;
    }
    if (!window.AMARE_TEXT_TABLE) return;
    var nodes = collectTextNodes(root, isTranslatableTextNode);
    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      var data = node.data || '';
      /* Re-visits use the recorded Arabic original, not the currently
         displayed (already-translated) text. */
      var source = arOriginals.has(node) ? arOriginals.get(node) : data;
      var norm = normText(source);
      if (!norm) continue;
      var entry = lookupTextEntry(norm);
      if (!entry) continue;
      var target = entry[lang];
      if (!target || !target.trim()) continue;
      /* Already translated to the active language — skip. */
      if (node.__amareLang === lang) continue;
      if (!arOriginals.has(node)) arOriginals.set(node, data);
      var lead = (source.match(/^[\s\u00A0]*/) || [''])[0];
      var trail = (source.match(/[\s\u00A0]*$/) || [''])[0];
      node.data = lead + target + trail;
      node.__amareLang = lang;
    }
  }

  function restoreArabicTextNodes(root) {
    root = root || document.body || document;
    var nodes = collectTextNodes(root, function (node) {
      if (!node || node.nodeType !== 3) return false;
      var parent = node.parentNode;
      if (!parent || !parent.hasAttribute) return false;
      var tag = parent.tagName ? parent.tagName.toUpperCase() : '';
      if (TEXT_SKIP_TAGS[tag]) return false;
      if (parent.hasAttribute('data-i18n') || parent.hasAttribute('data-i18n-html')) return false;
      return arOriginals.has(node);
    });
    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      var orig = arOriginals.get(node);
      if (orig) {
        node.data = orig;
        node.__amareLang = undefined;
      }
    }
  }

  /* Remove data-i18n* bindings from a container (and its descendants)
     whose content is owned by a CMS content script, so the attribute
     pass never clobbers injected content. Injected Arabic is still
     translated by the text-node pass. */
  function markDynamic(root) {
    root = root || document;
    var attrs = [
      'data-i18n',
      'data-i18n-html',
      'data-i18n-placeholder',
      'data-i18n-title',
      'data-i18n-aria-label',
      'data-i18n-alt',
      'data-i18n-content',
    ];
    var els = root.querySelectorAll
      ? root.querySelectorAll('[data-i18n],[data-i18n-html],[data-i18n-placeholder],[data-i18n-title],[data-i18n-aria-label],[data-i18n-alt],[data-i18n-content]')
      : [];
    for (var i = 0; i < els.length; i++) {
      for (var j = 0; j < attrs.length; j++) {
        if (els[i].hasAttribute(attrs[j])) els[i].removeAttribute(attrs[j]);
      }
    }
    if (root.hasAttribute) {
      for (var k = 0; k < attrs.length; k++) {
        if (root.hasAttribute(attrs[k])) root.removeAttribute(attrs[k]);
      }
    }
  }

  /* ------------------------------------------------------------------ */
  /* DOM translation                                                     */
  /* ------------------------------------------------------------------ */
  function translateContent(root) {
    root = root || document;

    var i;

    /* HTML content (safe strings that may contain <br> etc.) */
    var htmlEls = root.querySelectorAll('[data-i18n-html]');
    for (i = 0; i < htmlEls.length; i++) {
      var hv = t(htmlEls[i].getAttribute('data-i18n-html'));
      if (hv && hv !== htmlEls[i].getAttribute('data-i18n-html')) htmlEls[i].innerHTML = hv;
    }

    /* Plain text */
    var textEls = root.querySelectorAll('[data-i18n]');
    for (i = 0; i < textEls.length; i++) {
      var el = textEls[i];
      var key = el.getAttribute('data-i18n');
      var value = t(key);
      if (!value || value === key) continue;
      setTextKeepSvg(el, value);
    }

    /* Placeholders */
    var phEls = root.querySelectorAll('[data-i18n-placeholder]');
    for (i = 0; i < phEls.length; i++) {
      var phv = t(phEls[i].getAttribute('data-i18n-placeholder'));
      if (phv) phEls[i].setAttribute('placeholder', phv);
    }

    /* Title attributes */
    var titleEls = root.querySelectorAll('[data-i18n-title]');
    for (i = 0; i < titleEls.length; i++) {
      var tv = t(titleEls[i].getAttribute('data-i18n-title'));
      if (tv) titleEls[i].setAttribute('title', tv);
    }

    /* alt attributes */
    var altEls = root.querySelectorAll('[data-i18n-alt]');
    for (i = 0; i < altEls.length; i++) {
      var altv = t(altEls[i].getAttribute('data-i18n-alt'));
      if (altv) altEls[i].setAttribute('alt', altv);
    }

    /* aria-labels */
    var ariaEls = root.querySelectorAll('[data-i18n-aria-label]');
    for (i = 0; i < ariaEls.length; i++) {
      var av = t(ariaEls[i].getAttribute('data-i18n-aria-label'));
      if (av) ariaEls[i].setAttribute('aria-label', av);
    }

    /* Meta content — translate <meta> content via data-i18n-content */
    var metaEls = root.querySelectorAll('meta[data-i18n-content]');
    for (i = 0; i < metaEls.length; i++) {
      var mv = t(metaEls[i].getAttribute('data-i18n-content'));
      if (mv) metaEls[i].setAttribute('content', mv);
    }

    /* <title> → document.title */
    var pageKey = document.documentElement ? document.documentElement.getAttribute('data-i18n-page') : null;
    if (pageKey) {
      var titleVal = t('page.' + pageKey);
      if (titleVal && titleVal.indexOf('page.') !== 0) document.title = titleVal;
    }

    /* Text-node pass — dictionary-driven, no markup required. */
    translateTextNodes(root);
  }

  /* Replace text content but keep child elements (e.g. <svg> icons). */
  function setTextKeepSvg(el, value) {
    var hasElements = false;
    var children = [];
    for (var n = 0; n < el.childNodes.length; n++) {
      if (el.childNodes[n].nodeType === 1) {
        hasElements = true;
        children.push(el.childNodes[n]);
      }
    }
    if (!hasElements) {
      el.textContent = value;
      return;
    }
    // Preserve the element children, rebuild around a single translated text node.
    el.textContent = '';
    el.appendChild(document.createTextNode(value));
    for (var c = 0; c < children.length; c++) {
      if (children[c].tagName && children[c].tagName.toLowerCase() === 'svg') {
        el.appendChild(children[c]);
      }
    }
  }

  function translatePage() {
    translateContent(document);
  }

  /* ------------------------------------------------------------------ */
  /* Selectors — sync all language <select> elements                     */
  /*                                                                     */
  /* Existing pages ship two static selectors per page: one in the       */
  /* top bar (.topbar-lang) and one in the mobile drawer                 */
  /* (.mobile-drawer-lang). Both are detected automatically, so no page  */
  /* markup change is required to make switching work. A new selector    */
  /* may opt in explicitly with data-amare-lang-select.                  */
  /* ------------------------------------------------------------------ */
  function getLangSelects() {
    var result = [];
    var explicit = document.querySelectorAll('select[data-amare-lang-select]');
    for (var i = 0; i < explicit.length; i++) {
      if (result.indexOf(explicit[i]) === -1) result.push(explicit[i]);
    }
    var containers = document.querySelectorAll('.topbar-lang, .mobile-drawer-lang');
    for (var j = 0; j < containers.length; j++) {
      var sel = containers[j].querySelector('select');
      if (sel && result.indexOf(sel) === -1) result.push(sel);
    }
    return result;
  }

  // A selector may use the historic "ber" value instead of "zgh".
  function setSelectValue(select, code) {
    if (select.querySelector('option[value="' + code + '"]')) {
      select.value = code;
    } else if (code === 'zgh' && select.querySelector('option[value="ber"]')) {
      select.value = 'ber';
    }
  }

  function syncSelects() {
    var selects = getLangSelects();
    for (var i = 0; i < selects.length; i++) {
      setSelectValue(selects[i], currentLanguage);
    }
  }

  function attachSelectListeners() {
    document.addEventListener(
      'change',
      function (e) {
        var target = e.target;
        if (!target || target.tagName !== 'SELECT') return;
        var inLangContainer =
          target.closest &&
          target.closest('.topbar-lang, .mobile-drawer-lang');
        if (target.hasAttribute('data-amare-lang-select') || inLangContainer) {
          setLanguage(target.value);
        }
      },
      true
    );
  }

  /* ------------------------------------------------------------------ */
  /* Tifinagh font support — lazy-load fallback for zgh                  */
  /* ------------------------------------------------------------------ */
  function ensureTifinaghFont() {
    if (currentLanguage !== 'zgh') return;
    if (document.getElementById('amare-tifinagh-font')) return;
    var link = document.createElement('link');
    link.id = 'amare-tifinagh-font';
    link.rel = 'stylesheet';
    link.href = FONT_EMBED;
    document.head.appendChild(link);
  }

  function fontFamilyChain() {
    var base = document.documentElement.getAttribute('data-font-main');
    if (!base) {
      // Read from the CSS custom property if available
      var cs = getComputedStyle(document.documentElement);
      base = cs && cs.getPropertyValue('--font-main') ? cs.getPropertyValue('--font-main').trim() : "'Cairo', sans-serif";
    }
    if (currentLanguage === 'zgh') {
      return base.replace(/;\s*$/, '') + ', ' + FALLBACK_FONT;
    }
    return base;
  }

  /* ------------------------------------------------------------------ */
  /* Public API                                                          */
  /* ------------------------------------------------------------------ */
  function getCurrentLanguage() {
    return currentLanguage;
  }

  function setLanguage(code) {
    var lang = normalizeLang(code);
    if (lang === currentLanguage) {
      syncSelects();
      return;
    }
    currentLanguage = lang;
    saveLang(lang);

    var html = document.documentElement;
    html.setAttribute('lang', lang);
    html.setAttribute('dir', LANGUAGES[lang].dir);

    translatePage();
    syncSelects();
    ensureTifinaghFont();

    window.dispatchEvent(new CustomEvent('amare:langchange', { detail: { language: lang } }));
  }

  function startTextObserver() {
    if (typeof MutationObserver === 'undefined') return;
    if (!document.body) return;
    var timer = null;
    var observer = new MutationObserver(function (mutations) {
      /* Arabic is the target language — nothing to translate. */
      if (currentLanguage === 'ar') return;
      /* Cheap pre-filter: only schedule a scan when an added node actually
         contains Arabic text (avoids full scans on table/realtime churn). */
      var hasArabic = false;
      for (var i = 0; i < mutations.length && !hasArabic; i++) {
        var added = mutations[i].addedNodes;
        for (var j = 0; j < added.length; j++) {
          var n = added[j];
          if (!n) continue;
          var txt = n.nodeType === 3 ? n.data : n.textContent;
          if (txt && AR_RE.test(txt)) { hasArabic = true; break; }
        }
      }
      if (!hasArabic) return;
      if (timer) clearTimeout(timer);
      timer = setTimeout(function () {
        timer = null;
        translateTextNodes(document.body);
      }, 80);
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  function initI18n() {
    currentLanguage = readSavedLang();
    var html = document.documentElement;
    if (html) {
      html.setAttribute('lang', currentLanguage);
      html.setAttribute('dir', LANGUAGES[currentLanguage].dir);
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () {
        translatePage();
        syncSelects();
        ensureTifinaghFont();
        startTextObserver();
        window.dispatchEvent(new CustomEvent('amare:i18nready', { detail: { language: currentLanguage } }));
      });
    } else {
      translatePage();
      syncSelects();
      ensureTifinaghFont();
      startTextObserver();
      window.dispatchEvent(new CustomEvent('amare:i18nready', { detail: { language: currentLanguage } }));
    }

    attachSelectListeners();
  }

  function home() {
    return homeFallback();
  }

  function pageTitle() {
    var pageKey = document.documentElement ? document.documentElement.getAttribute('data-i18n-page') : null;
    if (!pageKey) return null;
    var val = t('page.' + pageKey);
    if (val && val.indexOf('page.') !== 0) return val;
    return null;
  }

  window.I18n = {
    LANGUAGES: LANGUAGES,
    DEFAULT_LANG: DEFAULT_LANG,
    STORAGE_KEY: STORAGE_KEY,
    initI18n: initI18n,
    setLanguage: setLanguage,
    getCurrentLanguage: getCurrentLanguage,
    translatePage: translatePage,
    translateContent: translateContent,
    t: t,
    localizeDynamic: localizeDynamic,
    resolveNavLabel: resolveNavLabel,
    resolveNavDesc: resolveNavDesc,
    resolveFooterLabel: resolveFooterLabel,
    markDynamic: markDynamic,
    home: home,
    pageTitle: pageTitle,
    fontFamilyChain: fontFamilyChain,
  };

  /* Boot immediately — i18n must be ready before other renderers run. */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initI18n);
  } else {
    initI18n();
  }
})(window);
