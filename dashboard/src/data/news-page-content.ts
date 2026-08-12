/**
 * الأخبار (NEWS) page content — bilingual _ar/_fr format
 *
 * Mirrors the SQL migration 00031_news_bilingual.sql.
 * Every section supports Arabic and French via paired fields.
 * Non-translatable fields (image, url, id, category, variant, date) remain shared.
 */

import type { PageSection } from '@/types/content'

export const NEWS_PAGE_SECTIONS: PageSection[] = [
  // =====================================================================
  // 1. HERO  (#nwHero)
  // =====================================================================
  {
    id: 'sec-news-hero',
    type: 'hero',
    enabled: true,
    order: 1,
    data: {
      heading_ar: 'آخر الأخبار',
      heading_fr: 'Dernières actualités',
      headingEm_ar: 'الأخبار',
      headingEm_fr: 'actualités',
      subheading_ar: 'بوابة الأخبار',
      subheading_fr: 'Portail des actualités',
      description_ar:
        'تابع آخر أخبار الجمعية المغربية لهواة البحث والاستكشاف، والأنشطة، والفعاليات، والشراكات، وكل جديد.',
      description_fr:
        "Suivez les dernières actualités de l'Association Marocaine des Amateurs de Recherche et d'Exploration : activités, événements, partenariats et toutes les nouveautés.",
      backgroundImage: '',
      buttons: [
        { id: 'btn-news-hero-latest', label_ar: 'أحدث الأخبار', label_fr: 'Dernières actualités', url: '#nwLatest', variant: 'primary' },
        { id: 'btn-news-hero-contact', label_ar: 'تواصل معنا', label_fr: 'Contactez-nous', url: '../contact.html', variant: 'secondary' },
      ],
    },
  },

  // =====================================================================
  // 2. FEATURED NEWS  (#nwFeatured)
  // =====================================================================
  {
    id: 'sec-news-featured',
    type: 'custom',
    enabled: true,
    order: 2,
    data: {
      _renderer: 'nwFeatured',
      eyebrow_ar: 'خبر مميز',
      eyebrow_fr: 'Article à la une',
      heading_ar: 'أبرز الأخبار',
      heading_fr: 'Actualités marquantes',
    },
  },

  // =====================================================================
  // 3. LATEST NEWS  (#nwLatest)
  // =====================================================================
  {
    id: 'sec-news-grid',
    type: 'custom',
    enabled: true,
    order: 3,
    data: {
      _renderer: 'nwGrid',
      eyebrow_ar: 'أحدث الأخبار',
      eyebrow_fr: 'Dernières actualités',
      heading_ar: 'آخر ما نشر',
      heading_fr: 'Dernières publications',
      description_ar: 'تصفح أحدث أخبار ومقالات الجمعية المغربية لهواة البحث والاستكشاف.',
      description_fr:
        "Parcourez les dernières actualités et articles de l'Association Marocaine des Amateurs de Recherche et d'Exploration.",
      items: [
        {
          category: 'activities', catLabel_ar: 'أنشطة', catLabel_fr: 'Activités', featured: true,
          title_ar: 'خرجة استكشافية ناجحة إلى جبال الأطلس الكبير',
          title_fr: "Sortie d'exploration réussie dans les montagnes du Haut Atlas",
          summary_ar: 'نظمت الجمعية خرجة استكشافية إلى منطقة إمليل بجبال الأطلس الكبير بمشاركة 45 عضواً، تم خلالها استكشاف المناظر الطبيعية والتعرف على التنوع البيولوجي.',
          summary_fr: "L'association a organisé une sortie d'exploration dans la région d'Imlil, dans les montagnes du Haut Atlas, avec la participation de 45 membres, pour explorer les paysages naturels et découvrir la biodiversité.",
          author_ar: 'فريق التحرير', author_fr: 'Équipe éditoriale', date: '2026-08-05', image: '', linkUrl: '#', linkLabel_ar: 'اقرأ المزيد', linkLabel_fr: 'Lire la suite',
        },
        {
          category: 'partnerships', catLabel_ar: 'شراكات', catLabel_fr: 'Partenariats', featured: false,
          title_ar: 'توقيع اتفاقية شراكة مع ASTROMET',
          title_fr: "Signature d'un accord de partenariat avec ASTROMET",
          summary_ar: 'وقعت الجمعية اتفاقية شراكة استراتيجية مع شركة ASTROMET المتخصصة في التنقيب والاستكشاف المعدني بالمغرب.',
          summary_fr: "L'association a signé un accord de partenariat stratégique avec ASTROMET, société spécialisée dans l'exploration et la prospection minière au Maroc.",
          author_ar: 'لجنة الشراكات', author_fr: 'Comité des partenariats', date: '2026-07-28', image: '', linkUrl: '#', linkLabel_ar: 'اقرأ المزيد', linkLabel_fr: 'Lire la suite',
        },
        {
          category: 'competitions', catLabel_ar: 'مسابقات', catLabel_fr: 'Concours', featured: false,
          title_ar: 'إعلان نتائج المسابقة الوطنية للكشف عن المعادن',
          title_fr: 'Annonce des résultats du concours national de détection de métaux',
          summary_ar: 'اختتمت الجمعية المسابقة الوطنية للكشف عن المعادن بمشاركة 120 متسابقاً من مختلف جهات المملكة.',
          summary_fr: "L'association a clôturé le concours national de détection de métaux avec la participation de 120 concurrents de différentes régions du Royaume.",
          author_ar: 'لجنة المسابقات', author_fr: 'Comité des concours', date: '2026-07-20', image: '', linkUrl: '#', linkLabel_ar: 'اقرأ المزيد', linkLabel_fr: 'Lire la suite',
        },
        {
          category: 'outings', catLabel_ar: 'خرجات', catLabel_fr: 'Sorties', featured: false,
          title_ar: 'رحلة استكشافية إلى مغارة فريواطو بتازة',
          title_fr: 'Expédition à la grotte de Friouato à Taza',
          summary_ar: 'نظمت الجمعية رحلة استكشافية إلى مغارة فريواطو، إحدى أعمق المغارات في إفريقيا، مع فريق متخصص في علم الكهوف.',
          summary_fr: "L'association a organisé une expédition à la grotte de Friouato, l'une des plus profondes d'Afrique, avec une équipe spécialisée en spéléologie.",
          author_ar: 'فريق التحرير', author_fr: 'Équipe éditoriale', date: '2026-07-15', image: '', linkUrl: '#', linkLabel_ar: 'اقرأ المزيد', linkLabel_fr: 'Lire la suite',
        },
        {
          category: 'environmental', catLabel_ar: 'حملات بيئية', catLabel_fr: 'Campagnes environnementales', featured: false,
          title_ar: 'حملة تنظيف شاطئ أكادير تجمع 200 متطوع',
          title_fr: "Campagne de nettoyage de la plage d'Agadir rassemble 200 bénévoles",
          summary_ar: 'نجحت الحملة البيئية التي نظمتها الجمعية في جمع أكثر من 2 طن من النفايات بشاطئ أكادير بمشاركة 200 متطوع.',
          summary_fr: "La campagne environnementale organisée par l'association a permis de collecter plus de 2 tonnes de déchets sur la plage d'Agadir avec la participation de 200 bénévoles.",
          author_ar: 'لجنة البيئة', author_fr: 'Comité environnement', date: '2026-07-10', image: '', linkUrl: '#', linkLabel_ar: 'اقرأ المزيد', linkLabel_fr: 'Lire la suite',
        },
        {
          category: 'exhibitions', catLabel_ar: 'معارض', catLabel_fr: 'Expositions', featured: false,
          title_ar: 'المعرض الجهوي للمستكشفين يحقق نجاحاً كبيراً',
          title_fr: 'Le salon régional des explorateurs connaît un grand succès',
          summary_ar: 'اختتم المعرض الجهوي للمستكشفين الذي نظمته الجمعية بمشاركة 30 عارضاً وعرض لأحدث الاكتشافات والأجهزة.',
          summary_fr: "Le salon régional des explorateurs organisé par l'association s'est clôturé avec la participation de 30 exposants présentant les dernières découvertes et équipements.",
          author_ar: 'فريق التحرير', author_fr: 'Équipe éditoriale', date: '2026-07-03', image: '', linkUrl: '#', linkLabel_ar: 'اقرأ المزيد', linkLabel_fr: 'Lire la suite',
        },
        {
          category: 'association', catLabel_ar: 'الجمعية', catLabel_fr: 'Association', featured: false,
          title_ar: 'انعقاد الجمع العام السنوي للجمعية',
          title_fr: "Tenue de l'assemblée générale annuelle de l'association",
          summary_ar: 'عقدت الجمعية جمعها العام السنوي بحضور ممثلي الفروع الجهوية، وتمت مناقشة التقريرين الأدبي والمالي وانتخاب المكتب الجديد.',
          summary_fr: "L'association a tenu son assemblée générale annuelle en présence des représentants des branches régionales, avec discussion des rapports moral et financier et élection du nouveau bureau.",
          author_ar: 'الأمانة العامة', author_fr: 'Secrétariat général', date: '2026-06-25', image: '', linkUrl: '#', linkLabel_ar: 'اقرأ المزيد', linkLabel_fr: 'Lire la suite',
        },
        {
          category: 'announcements', catLabel_ar: 'إعلانات', catLabel_fr: 'Annonces', featured: false,
          title_ar: 'فتح باب الانخراط للموسم الجديد 2026-2027',
          title_fr: 'Ouverture des adhésions pour la nouvelle saison 2026-2027',
          summary_ar: 'تعلن الجمعية عن فتح باب الانخراط للموسم الجديد، ويمكن للراغبين التسجيل عبر الموقع الإلكتروني أو في المقر.',
          summary_fr: "L'association annonce l'ouverture des adhésions pour la nouvelle saison. Les intéressés peuvent s'inscrire via le site web ou au siège.",
          author_ar: 'لجنة العضوية', author_fr: "Comité d'adhésion", date: '2026-06-18', image: '', linkUrl: '#', linkLabel_ar: 'اقرأ المزيد', linkLabel_fr: 'Lire la suite',
        },
        {
          category: 'activities', catLabel_ar: 'أنشطة', catLabel_fr: 'Activités', featured: false,
          title_ar: 'دورة تكوينية في الملاحة البرية وقراءة الخرائط',
          title_fr: 'Formation en navigation terrestre et lecture de cartes',
          summary_ar: 'نظمت الجمعية دورة تكوينية في الملاحة البرية لفائدة 35 عضواً، تضمنت دروساً نظرية وتطبيقات ميدانية.',
          summary_fr: "L'association a organisé une formation en navigation terrestre pour 35 membres, comprenant des cours théoriques et des applications sur le terrain.",
          author_ar: 'لجنة التكوين', author_fr: 'Comité de formation', date: '2026-06-10', image: '', linkUrl: '#', linkLabel_ar: 'اقرأ المزيد', linkLabel_fr: 'Lire la suite',
        },
        {
          category: 'partnerships', catLabel_ar: 'شراكات', catLabel_fr: 'Partenariats', featured: false,
          title_ar: 'اتفاقية تعاون مع منظمة OMSDS للتنمية الاجتماعية',
          title_fr: "Accord de coopération avec l'organisation OMSDS pour le développement social",
          summary_ar: 'وقعت الجمعية اتفاقية تعاون مع منظمة OMSDS للتنمية الاجتماعية والتضامن لدعم الأنشطة الاجتماعية والتطوعية.',
          summary_fr: "L'association a signé un accord de coopération avec l'organisation OMSDS pour le développement social et la solidarité afin de soutenir les activités sociales et bénévoles.",
          author_ar: 'لجنة الشراكات', author_fr: 'Comité des partenariats', date: '2026-06-01', image: '', linkUrl: '#', linkLabel_ar: 'اقرأ المزيد', linkLabel_fr: 'Lire la suite',
        },
        {
          category: 'environmental', catLabel_ar: 'حملات بيئية', catLabel_fr: 'Campagnes environnementales', featured: false,
          title_ar: 'حملة تشجير غابة المعمورة بمشاركة 150 متطوعاً',
          title_fr: 'Campagne de reboisement de la forêt de Maâmora avec 150 bénévoles',
          summary_ar: 'نظمت الجمعية حملة تشجير بغابة المعمورة تم فيها غرس 1000 شجرة بمشاركة السلطات المحلية والمدارس.',
          summary_fr: "L'association a organisé une campagne de reboisement dans la forêt de Maâmora où 1000 arbres ont été plantés avec la participation des autorités locales et des écoles.",
          author_ar: 'لجنة البيئة', author_fr: 'Comité environnement', date: '2026-05-22', image: '', linkUrl: '#', linkLabel_ar: 'اقرأ المزيد', linkLabel_fr: 'Lire la suite',
        },
        {
          category: 'association', catLabel_ar: 'الجمعية', catLabel_fr: 'Association', featured: false,
          title_ar: 'افتتاح فرع جديد للجمعية بجهة طنجة',
          title_fr: "Ouverture d'une nouvelle branche de l'association dans la région de Tanger",
          summary_ar: 'افتتحت الجمعية فرعاً جهوياً جديداً بجهة طنجة - تطوان - الحسيمة لتوسيع نطاق أنشطتها في شمال المملكة.',
          summary_fr: "L'association a ouvert une nouvelle branche régionale dans la région de Tanger-Tétouan-Al Hoceïma pour élargir la portée de ses activités dans le nord du Royaume.",
          author_ar: 'المكتب المركزي', author_fr: 'Bureau central', date: '2026-05-15', image: '', linkUrl: '#', linkLabel_ar: 'اقرأ المزيد', linkLabel_fr: 'Lire la suite',
        },
      ],
    },
  },

  // =====================================================================
  // 4. CATEGORIES  (#nwCategories)
  // =====================================================================
  {
    id: 'sec-news-categories',
    type: 'custom',
    enabled: true,
    order: 4,
    data: {
      _renderer: 'nwCategories',
      eyebrow_ar: 'تصفح حسب الفئة',
      eyebrow_fr: 'Parcourir par catégorie',
      heading_ar: 'فئات الأخبار',
      heading_fr: "Catégories d'actualités",
      description_ar: 'اختر الفئة التي تهمك لتصفح الأخبار المتعلقة بها.',
      description_fr: 'Choisissez la catégorie qui vous intéresse pour parcourir les actualités correspondantes.',
      categories: [
        { id: 'activities', label_ar: 'أنشطة', label_fr: 'Activités' },
        { id: 'partnerships', label_ar: 'شراكات', label_fr: 'Partenariats' },
        { id: 'competitions', label_ar: 'مسابقات', label_fr: 'Concours' },
        { id: 'outings', label_ar: 'خرجات', label_fr: 'Sorties' },
        { id: 'environmental', label_ar: 'حملات بيئية', label_fr: 'Campagnes environnementales' },
        { id: 'exhibitions', label_ar: 'معارض', label_fr: 'Expositions' },
        { id: 'association', label_ar: 'الجمعية', label_fr: 'Association' },
        { id: 'announcements', label_ar: 'إعلانات', label_fr: 'Annonces' },
      ],
    },
  },

  // =====================================================================
  // 5. SEARCH & FILTER  (#nwSearch)
  // =====================================================================
  {
    id: 'sec-news-search',
    type: 'custom',
    enabled: true,
    order: 5,
    data: {
      _renderer: 'nwSearch',
      eyebrow_ar: 'بحث متقدم',
      eyebrow_fr: 'Recherche avancée',
      heading_ar: 'ابحث في الأخبار',
      heading_fr: 'Rechercher dans les actualités',
    },
  },

  // =====================================================================
  // 6. NEWSLETTER  (#nwNewsletter)
  // =====================================================================
  {
    id: 'sec-news-newsletter',
    type: 'custom',
    enabled: true,
    order: 6,
    data: {
      _renderer: 'nwNewsletter',
      heading_ar: 'اشترك في نشرتنا الإخبارية',
      heading_fr: 'Abonnez-vous à notre newsletter',
      description_ar: 'توصل بأحدث الأخبار والفعاليات مباشرة على بريدك الإلكتروني.',
      description_fr: 'Recevez les dernières actualités et événements directement sur votre e-mail.',
      buttonLabel_ar: 'اشترك الآن',
      buttonLabel_fr: "S'abonner",
    },
  },

  // =====================================================================
  // 7. FINAL CTA  (#nwCta)
  // =====================================================================
  {
    id: 'sec-news-cta',
    type: 'custom',
    enabled: true,
    order: 7,
    data: {
      _renderer: 'nwCta',
      heading_ar: 'ابق على اطلاع بكل جديد.',
      heading_fr: 'Restez informé de toutes les nouveautés.',
      buttons: [
        { id: 'btn-news-cta-all', label_ar: 'جميع الأخبار', label_fr: 'Toutes les actualités', url: '#nwLatest', variant: 'primary' },
        { id: 'btn-news-cta-contact', label_ar: 'اتصل بنا', label_fr: 'Contactez-nous', url: '../contact.html', variant: 'secondary' },
      ],
    },
  },
]
