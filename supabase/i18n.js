/* ==========================================================================
   AMARE — Centralized Multilingual System (i18n)
   --------------------------------------------------------------------------
   Single source of truth for all static user‑facing translations.
   Loaded automatically on every page via supabase/navbar-loader.js.

   Languages (code / direction / default):
     ar  — العربية       (RTL, default / primary)
     fr  — Français      (LTR, secondary)

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
     I18n.resolveNavLabel(item)   — pick title_ar/dynamic for nav
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

  /* ------------------------------------------------------------------ */
  /* Language registry                                                   */
  /* ------------------------------------------------------------------ */
  var LANGUAGES = {
    ar: { label: 'العربية', dir: 'rtl', native: 'العربية' },
    fr: { label: 'Français', dir: 'ltr', native: 'Français' },
  };

  var currentLanguage = DEFAULT_LANG;

  /* Page-content dictionary (supabase/i18n-text.js) — Arabic string → fr.
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
      'lang.switch': 'Français',
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

      'about.memberPhoto': 'صورة ',
      'about.viewProfile': 'عرض الملف الشخصي',
      'map.branchCount': 'عدد الفروع',
      'map.expansionStatus': 'حالة التوسع',
    },

    fr: {
      'lang.switch': 'العربية',
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

      'about.memberPhoto': 'Photo de ',
      'about.viewProfile': 'Voir le profil',
      'map.branchCount': 'Nombre de branches',
      'map.expansionStatus': 'Statut d\'expansion',
    },
  };

  /* ------------------------------------------------------------------ */
  /* Dynamic CMS labels — keyed by the English value stored in the DB    */
  /* (title_en on navigation_items / footer_columns / footer_items).     */
  /* Used only for fr since the DB has no title_fr column yet.           */
  /* ------------------------------------------------------------------ */
  var dynamic = {
    'Home': { fr: 'Accueil' },
    'About Us': { fr: 'À propos' },
    'Our Activities': { fr: 'Nos activités' },
    'Our Partners': { fr: 'Nos partenaires' },
    'Our Services': { fr: 'Nos services' },
    'Regional Branches': { fr: 'Branches régionales' },
    'Join Us': { fr: 'Rejoignez-nous' },
    'News': { fr: 'Actualités' },
    'Archive': { fr: 'Archives' },
    'Contact Us': { fr: 'Contactez-nous' },
    'National Presidency': { fr: 'Présidence nationale' },
    'Our Mission': { fr: 'Notre mission' },
    'Our Values': { fr: 'Nos valeurs' },
    'Central Office': { fr: 'Bureau central' },
    'Expansion Map': { fr: 'Carte d’expansion' },
    'Outings': { fr: 'Sorties' },
    'Competitions & Rallies': { fr: 'Compétitions & rallyes' },
    'Training': { fr: 'Formations' },
    'Exhibitions': { fr: 'Expositions' },
    'Meetings': { fr: 'Rencontres' },
    'Environmental Campaigns': { fr: 'Campagnes environnementales' },
    'LeFouilleurma': { fr: 'LeFouilleurma' },
    'SENOTEC': { fr: 'SENOTEC' },
    'ASTROMET': { fr: 'ASTROMET' },
    'AssociationDetectionCentre': { fr: 'Centre de Détection' },
    'ANCPP': { fr: 'ANCPP' },
    'OMSDS': { fr: 'OMSDS' },
    'SOS AMARE': { fr: 'SOS AMARE' },
    'AMARE Store': { fr: 'Boutique AMARE' },
    'Explorer House': { fr: 'Maison de l’explorateur' },
    'AMARE Magazine': { fr: 'Magazine AMARE' },
    'AMARE Academy': { fr: 'Académie AMARE' },
    'Clubs': { fr: 'Clubs' },
    'Legal Advisor': { fr: 'Conseiller juridique' },
    'Insurance Contract': { fr: 'Contrat d’assurance' },
    'Join Online': { fr: 'Adhérer en ligne' },
    'Membership Renewal': { fr: 'Renouvellement d’adhésion' },
    'Membership Documents': { fr: 'Documents d’adhésion' },
    'Bylaws': { fr: 'Statuts' },
    'Internal Regulations': { fr: 'Règlement intérieur' },
    'Association Charter': { fr: 'Charte de l’association' },
    'Final Deposit Receipt': { fr: 'Reçu de dépôt final' },
    'Temporary Deposit Receipt': { fr: 'Reçu de dépôt temporaire' },
    'Activity Notifications': { fr: 'Notifications d’activités' },
    'About the Association': { fr: 'À propos de l’association' },
    'Quick Links': { fr: 'Liens rapides' },
    'Our Programs': { fr: 'Nos programmes' },
    'Our Location': { fr: 'Notre localisation' },
    'Activities': { fr: 'Activités' },
    'Partners': { fr: 'Partenaires' },
    'Services': { fr: 'Services' },
    'Branches': { fr: 'Branches' },
    'Tanger-Tetouan-Al Hoceima': { fr: 'Tanger-Tétouan-Al Hoceïma' },
    'Oriental': { fr: 'Oriental' },
    'Fes-Meknes': { fr: 'Fès-Meknès' },
    'Rabat-Sale-Kenitra': { fr: 'Rabat-Salé-Kénitra' },
    'Beni Mellal-Khenifra': { fr: 'Béni Mellal-Khénifra' },
    'Casablanca-Settat': { fr: 'Casablanca-Settat' },
    'Marrakech-Safi': { fr: 'Marrakech-Safi' },
    'Draa-Tafilalet': { fr: 'Drâa-Tafilalet' },
    'Souss-Massa': { fr: 'Souss-Massa' },
    'Guelmim-Oued Noun': { fr: 'Guelmim-Oued Noun' },
    'Laayoune-Sakia El Hamra': { fr: 'Laâyoune-Sakia El Hamra' },
    'Dakhla-Oued Eddahab': { fr: 'Dakhla-Oued Eddahab' },
    'Contact': { fr: 'Contact' },
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

    if (lang === 'fr') {
      home.hero.heading = 'Découvrez...\nParticipez...\nRejoignez l’association marocaine\ndes amateurs de recherche et d’exploration';
      home.hero.subheading = 'Les inscriptions au concours national sont ouvertes';
      home.hero.description = 'Participez au concours national, adhérez en ligne à l’association ou renouvelez facilement votre adhésion, et suivez les dernières activités, événements et actualités via la plateforme officielle.';
      home.storeCta.heading = 'Soutenez notre mission\navec des produits exclusifs';
      home.storeCta.description = 'Découvrez la gamme exclusive de produits AMARE. Chaque achat contribue à soutenir les activités de l\'association, à financer les programmes de recherche et d\'exploration et à protéger le patrimoine national.';
    }

    return home;
  }

  /* ------------------------------------------------------------------ */
  /* Core helpers                                                        */
  /* ------------------------------------------------------------------ */
  function normalizeLang(code) {
    if (code && LANGUAGES[code]) return code;
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
    var dyn = localizeDynamic(item.title_en || item.title_ar || '');
    return dyn || item.title_ar || item.title_en || '';
  }

  function resolveNavDesc(item) {
    if (!item) return '';
    var lang = currentLanguage;
    if (lang === 'ar') return item.description_ar || '';
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
    var text = node.data || '';
    if (!AR_RE.test(text)) return false;
    return true;
  }

  function translateTextNode(node) {
    var raw = node.data || '';
    var normalized = normText(raw);
    var entry = lookupTextEntry(normalized);
    if (!entry) return;
    var translated = entry[currentLanguage];
    if (!translated) {
      translated = entry[DEFAULT_LANG] || null;
      if (!translated) return;
    }
    var original = arOriginals.get(node) || raw;
    arOriginals.set(node, original);
    node.data = translated;
  }

  function translateTextNodes(root) {
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);
    var node;
    while ((node = walker.nextNode())) {
      if (isTranslatableTextNode(node)) {
        translateTextNode(node);
      }
    }
  }

  /* Restore original Arabic text nodes (before switching back to ar) */
  function restoreArabicNodes(root) {
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);
    var node;
    while ((node = walker.nextNode())) {
      var original = arOriginals.get(node);
      if (original !== undefined) {
        node.data = original;
      }
    }
  }

  /* Attribute-based translation (data-i18n*) */
  function attrSelector() {
    return '[data-i18n],[data-i18n-html],[data-i18n-placeholder],[data-i18n-title],[data-i18n-aria-label],[data-i18n-alt],[data-i18n-content]';
  }

  function translateAttr(el) {
    if (el.hasAttribute('data-i18n')) {
      var key = el.getAttribute('data-i18n');
      if (currentLanguage === 'ar') {
        var orig = el.getAttribute('data-i18n-ar-original');
        if (orig !== null && orig !== undefined) {
          el.textContent = orig;
        } else {
          var fallback = translations[DEFAULT_LANG];
          if (fallback && fallback[key]) el.textContent = fallback[key];
        }
      } else {
        if (!el.hasAttribute('data-i18n-ar-original')) {
          el.setAttribute('data-i18n-ar-original', el.textContent || '');
        }
        el.textContent = t(key);
      }
    }
    if (el.hasAttribute('data-i18n-html')) {
      var hk = el.getAttribute('data-i18n-html');
      if (currentLanguage === 'ar') {
        var hOrig = el.getAttribute('data-i18n-html-ar-original');
        if (hOrig !== null && hOrig !== undefined) {
          el.innerHTML = hOrig;
        } else {
          var hFallback = translations[DEFAULT_LANG];
          if (hFallback && hFallback[hk]) el.innerHTML = hFallback[hk];
        }
      } else {
        if (!el.hasAttribute('data-i18n-html-ar-original')) {
          el.setAttribute('data-i18n-html-ar-original', el.innerHTML || '');
        }
        el.innerHTML = t(hk);
      }
    }
    if (el.hasAttribute('data-i18n-placeholder')) {
      el.setAttribute('placeholder', t(el.getAttribute('data-i18n-placeholder')));
    }
    if (el.hasAttribute('data-i18n-title')) {
      el.setAttribute('title', t(el.getAttribute('data-i18n-title')));
    }
    if (el.hasAttribute('data-i18n-aria-label')) {
      el.setAttribute('aria-label', t(el.getAttribute('data-i18n-aria-label')));
    }
    if (el.hasAttribute('data-i18n-alt')) {
      el.setAttribute('alt', t(el.getAttribute('data-i18n-alt')));
    }
    if (el.hasAttribute('data-i18n-content')) {
      var ck = el.getAttribute('data-i18n-content');
      el.setAttribute('content', t(ck));
    }
  }

  function translateContent(root) {
    /* Attribute-based pass */
    var els = root.querySelectorAll ? root.querySelectorAll(attrSelector()) : [];
    for (var i = 0; i < els.length; i++) {
      translateAttr(els[i]);
    }
    /* Text-node pass */
    if (currentLanguage === 'ar') {
      restoreArabicNodes(root);
    } else {
      translateTextNodes(root);
    }
  }

  /* Internal: prevent i18n from touching a CMS-injected container so its
     content matches CMS data verbatim (called by content scripts). */
  function markDynamic(el) {
    if (!el) return;
    if (el.setAttribute) el.setAttribute('data-amare-dynamic', 'true');
  }

  /* ------------------------------------------------------------------ */
  /* Page <title> update                                                 */
  /* ------------------------------------------------------------------ */
  function updatePageTitle() {
    var pageKey = document.documentElement ? document.documentElement.getAttribute('data-i18n-page') : null;
    if (!pageKey) return;
    var key = 'page.' + pageKey;
    var title = translations[currentLanguage] && translations[currentLanguage][key];
    if (!title) {
      title = translations[DEFAULT_LANG] && translations[DEFAULT_LANG][key];
    }
    if (title) {
      document.title = title;
    }
  }

  function translatePage() {
    translateContent(document);
    updatePageTitle();
  }

  /* ------------------------------------------------------------------ */
  /* Language dropdown — shows current language + chevron in button,     */
  /* opens a dropdown panel with both languages.                         */
  /*                                                                     */
  /* Markup expected:                                                    */
  /*   .topbar-lang or .mobile-drawer-lang                               */
  /*     button.lang-btn   → trigger                                     */
  /*       span.lang-current  → "العربية" / "Français"                    */
  /*     ul.lang-dropdown                                               */
  /*       li > button.lang-option[data-lang="ar"|"fr"]                  */
  /* ------------------------------------------------------------------ */
  function getLangDropdowns() {
    var result = [];
    var containers = document.querySelectorAll('.topbar-lang, .mobile-drawer-lang');
    for (var j = 0; j < containers.length; j++) {
      if (result.indexOf(containers[j]) === -1) result.push(containers[j]);
    }
    return result;
  }

  function closeAllDropdowns(except) {
    var dropdowns = getLangDropdowns();
    for (var i = 0; i < dropdowns.length; i++) {
      if (dropdowns[i] === except) continue;
      dropdowns[i].classList.remove('open');
    }
  }

  function syncLangDropdowns() {
    var dropdowns = getLangDropdowns();
    for (var i = 0; i < dropdowns.length; i++) {
      var container = dropdowns[i];
      var currentEl = container.querySelector('.lang-current');
      if (currentEl) {
        currentEl.textContent = LANGUAGES[currentLanguage].native;
      }
      var options = container.querySelectorAll('.lang-option');
      for (var j = 0; j < options.length; j++) {
        var opt = options[j];
        var lang = opt.getAttribute('data-lang');
        if (lang === currentLanguage) {
          opt.classList.add('active');
        } else {
          opt.classList.remove('active');
        }
      }
    }
  }

  function handleDropdownClick(e) {
    var btn = e.target.closest('.lang-btn');
    var option = e.target.closest('.lang-option');

    if (option) {
      var lang = option.getAttribute('data-lang');
      if (lang) {
        setLanguage(lang);
        var container = option.closest('.topbar-lang, .mobile-drawer-lang');
        if (container) container.classList.remove('open');
      }
      return;
    }

    if (btn) {
      var container = btn.closest('.topbar-lang, .mobile-drawer-lang');
      if (!container) return;
      var isOpen = container.classList.contains('open');
      closeAllDropdowns(container);
      if (!isOpen) {
        container.classList.add('open');
      }
    }
  }

  function handleOutsideClick(e) {
    if (!e.target.closest('.topbar-lang, .mobile-drawer-lang')) {
      closeAllDropdowns(null);
    }
  }

  function attachDropdownListeners() {
    document.addEventListener('click', handleDropdownClick, false);
    document.addEventListener('click', handleOutsideClick, false);
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
      syncLangDropdowns();
      closeAllDropdowns(null);
      return;
    }
    currentLanguage = lang;
    saveLang(lang);

    var html = document.documentElement;
    html.setAttribute('lang', lang);
    html.setAttribute('dir', LANGUAGES[lang].dir);

    translatePage();
    syncLangDropdowns();
    closeAllDropdowns(null);

    window.dispatchEvent(new CustomEvent('amare:langchange', { detail: { language: lang } }));
  }

  function startTextObserver() {
    if (typeof MutationObserver === 'undefined') return;
    if (!document.body) return;
    var timer = null;
    var observer = new MutationObserver(function (mutations) {
      /* Arabic is the target language — nothing to translate. */
      if (currentLanguage === 'ar') return;
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
        syncLangDropdowns();
        startTextObserver();
        window.dispatchEvent(new CustomEvent('amare:i18nready', { detail: { language: currentLanguage } }));
      });
    } else {
      translatePage();
      syncLangDropdowns();
      startTextObserver();
      window.dispatchEvent(new CustomEvent('amare:i18nready', { detail: { language: currentLanguage } }));
    }

    attachDropdownListeners();
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
  };

  /* Boot immediately — i18n must be ready before other renderers run. */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initI18n);
  } else {
    initI18n();
  }
})(window);
