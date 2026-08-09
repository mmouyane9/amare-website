/**
 * الأخبار (NEWS) page content — extracted from /News/news.html
 *
 * This file is the JSON representation of the current live News page.
 * Every section heading and the full news store (12 items + 8 categories)
 * is captured exactly as it appears in the source HTML.
 *
 * NOTE: the page has NO content images — news cards render an SVG placeholder
 * icon. So every image field is seeded empty ('') and the public renderer
 * keeps the SVG placeholder until a real image URL is set.
 * Every news item link is '#' in the source — preserved as-is and editable
 * (no invented URLs).
 */

import type { PageSection } from '@/types/content'

// ---------------------------------------------------------------------------
// CMS JSON — exact representation of the live News page
// ---------------------------------------------------------------------------

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
      heading: 'آخر الأخبار',
      headingEm: 'الأخبار',
      subheading: 'بوابة الأخبار',
      description:
        'تابع آخر أخبار الجمعية المغربية لهواة البحث والاستكشاف، والأنشطة، والفعاليات، والشراكات، وكل جديد.',
      backgroundImage: '',
      buttons: [
        { id: 'btn-news-hero-latest', label: 'أحدث الأخبار', url: '#nwLatest', variant: 'primary' },
        { id: 'btn-news-hero-contact', label: 'تواصل معنا', url: '../contact.html', variant: 'secondary' },
      ],
    },
  },

  // =====================================================================
  // 2. FEATURED NEWS  (#nwFeatured)
  // The featured card itself is the first news item flagged featured:true —
  // edited in the nwGrid items list, exactly like the live page behavior.
  // =====================================================================
  {
    id: 'sec-news-featured',
    type: 'custom',
    enabled: true,
    order: 2,
    data: {
      _renderer: 'nwFeatured',
      eyebrow: 'خبر مميز',
      heading: 'أبرز الأخبار',
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
      eyebrow: 'أحدث الأخبار',
      heading: 'آخر ما نشر',
      description: 'تصفح أحدث أخبار ومقالات الجمعية المغربية لهواة البحث والاستكشاف.',
      items: [
        {
          category: 'activities',
          catLabel: 'أنشطة',
          featured: true,
          title: 'خرجة استكشافية ناجحة إلى جبال الأطلس الكبير',
          summary:
            'نظمت الجمعية خرجة استكشافية إلى منطقة إمليل بجبال الأطلس الكبير بمشاركة 45 عضواً، تم خلالها استكشاف المناظر الطبيعية والتعرف على التنوع البيولوجي.',
          author: 'فريق التحرير',
          date: '2026-08-05',
          image: '',
          linkUrl: '#',
          linkLabel: 'اقرأ المزيد',
        },
        {
          category: 'partnerships',
          catLabel: 'شراكات',
          featured: false,
          title: 'توقيع اتفاقية شراكة مع ASTROMET',
          summary:
            'وقعت الجمعية اتفاقية شراكة استراتيجية مع شركة ASTROMET المتخصصة في التنقيب والاستكشاف المعدني بالمغرب.',
          author: 'لجنة الشراكات',
          date: '2026-07-28',
          image: '',
          linkUrl: '#',
          linkLabel: 'اقرأ المزيد',
        },
        {
          category: 'competitions',
          catLabel: 'مسابقات',
          featured: false,
          title: 'إعلان نتائج المسابقة الوطنية للكشف عن المعادن',
          summary:
            'اختتمت الجمعية المسابقة الوطنية للكشف عن المعادن بمشاركة 120 متسابقاً من مختلف جهات المملكة.',
          author: 'لجنة المسابقات',
          date: '2026-07-20',
          image: '',
          linkUrl: '#',
          linkLabel: 'اقرأ المزيد',
        },
        {
          category: 'outings',
          catLabel: 'خرجات',
          featured: false,
          title: 'رحلة استكشافية إلى مغارة فريواطو بتازة',
          summary:
            'نظمت الجمعية رحلة استكشافية إلى مغارة فريواطو، إحدى أعمق المغارات في إفريقيا، مع فريق متخصص في علم الكهوف.',
          author: 'فريق التحرير',
          date: '2026-07-15',
          image: '',
          linkUrl: '#',
          linkLabel: 'اقرأ المزيد',
        },
        {
          category: 'environmental',
          catLabel: 'حملات بيئية',
          featured: false,
          title: 'حملة تنظيف شاطئ أكادير تجمع 200 متطوع',
          summary:
            'نجحت الحملة البيئية التي نظمتها الجمعية في جمع أكثر من 2 طن من النفايات بشاطئ أكادير بمشاركة 200 متطوع.',
          author: 'لجنة البيئة',
          date: '2026-07-10',
          image: '',
          linkUrl: '#',
          linkLabel: 'اقرأ المزيد',
        },
        {
          category: 'exhibitions',
          catLabel: 'معارض',
          featured: false,
          title: 'المعرض الجهوي للمستكشفين يحقق نجاحاً كبيراً',
          summary:
            'اختتم المعرض الجهوي للمستكشفين الذي نظمته الجمعية بمشاركة 30 عارضاً وعرض لأحدث الاكتشافات والأجهزة.',
          author: 'فريق التحرير',
          date: '2026-07-03',
          image: '',
          linkUrl: '#',
          linkLabel: 'اقرأ المزيد',
        },
        {
          category: 'association',
          catLabel: 'الجمعية',
          featured: false,
          title: 'انعقاد الجمع العام السنوي للجمعية',
          summary:
            'عقدت الجمعية جمعها العام السنوي بحضور ممثلي الفروع الجهوية، وتمت مناقشة التقريرين الأدبي والمالي وانتخاب المكتب الجديد.',
          author: 'الأمانة العامة',
          date: '2026-06-25',
          image: '',
          linkUrl: '#',
          linkLabel: 'اقرأ المزيد',
        },
        {
          category: 'announcements',
          catLabel: 'إعلانات',
          featured: false,
          title: 'فتح باب الانخراط للموسم الجديد 2026-2027',
          summary:
            'تعلن الجمعية عن فتح باب الانخراط للموسم الجديد، ويمكن للراغبين التسجيل عبر الموقع الإلكتروني أو في المقر.',
          author: 'لجنة العضوية',
          date: '2026-06-18',
          image: '',
          linkUrl: '#',
          linkLabel: 'اقرأ المزيد',
        },
        {
          category: 'activities',
          catLabel: 'أنشطة',
          featured: false,
          title: 'دورة تكوينية في الملاحة البرية وقراءة الخرائط',
          summary:
            'نظمت الجمعية دورة تكوينية في الملاحة البرية لفائدة 35 عضواً، تضمنت دروساً نظرية وتطبيقات ميدانية.',
          author: 'لجنة التكوين',
          date: '2026-06-10',
          image: '',
          linkUrl: '#',
          linkLabel: 'اقرأ المزيد',
        },
        {
          category: 'partnerships',
          catLabel: 'شراكات',
          featured: false,
          title: 'اتفاقية تعاون مع منظمة OMSDS للتنمية الاجتماعية',
          summary:
            'وقعت الجمعية اتفاقية تعاون مع منظمة OMSDS للتنمية الاجتماعية والتضامن لدعم الأنشطة الاجتماعية والتطوعية.',
          author: 'لجنة الشراكات',
          date: '2026-06-01',
          image: '',
          linkUrl: '#',
          linkLabel: 'اقرأ المزيد',
        },
        {
          category: 'environmental',
          catLabel: 'حملات بيئية',
          featured: false,
          title: 'حملة تشجير غابة المعمورة بمشاركة 150 متطوعاً',
          summary:
            'نظمت الجمعية حملة تشجير بغابة المعمورة تم فيها غرس 1000 شجرة بمشاركة السلطات المحلية والمدارس.',
          author: 'لجنة البيئة',
          date: '2026-05-22',
          image: '',
          linkUrl: '#',
          linkLabel: 'اقرأ المزيد',
        },
        {
          category: 'association',
          catLabel: 'الجمعية',
          featured: false,
          title: 'افتتاح فرع جديد للجمعية بجهة طنجة',
          summary:
            'افتتحت الجمعية فرعاً جهوياً جديداً بجهة طنجة - تطوان - الحسيمة لتوسيع نطاق أنشطتها في شمال المملكة.',
          author: 'المكتب المركزي',
          date: '2026-05-15',
          image: '',
          linkUrl: '#',
          linkLabel: 'اقرأ المزيد',
        },
      ],
    },
  },

  // =====================================================================
  // 4. CATEGORIES  (#nwCategories)
  // Category icons stay static (SVG in the page) — only id + label are
  // editable; counts are computed from the news items.
  // =====================================================================
  {
    id: 'sec-news-categories',
    type: 'custom',
    enabled: true,
    order: 4,
    data: {
      _renderer: 'nwCategories',
      eyebrow: 'تصفح حسب الفئة',
      heading: 'فئات الأخبار',
      description: 'اختر الفئة التي تهمك لتصفح الأخبار المتعلقة بها.',
      categories: [
        { id: 'activities', label: 'أنشطة' },
        { id: 'partnerships', label: 'شراكات' },
        { id: 'competitions', label: 'مسابقات' },
        { id: 'outings', label: 'خرجات' },
        { id: 'environmental', label: 'حملات بيئية' },
        { id: 'exhibitions', label: 'معارض' },
        { id: 'association', label: 'الجمعية' },
        { id: 'announcements', label: 'إعلانات' },
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
      eyebrow: 'بحث متقدم',
      heading: 'ابحث في الأخبار',
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
      heading: 'اشترك في نشرتنا الإخبارية',
      description: 'توصل بأحدث الأخبار والفعاليات مباشرة على بريدك الإلكتروني.',
      buttonLabel: 'اشترك الآن',
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
      heading: 'ابق على اطلاع بكل جديد.',
      buttons: [
        { id: 'btn-news-cta-all', label: 'جميع الأخبار', url: '#nwLatest', variant: 'primary' },
        { id: 'btn-news-cta-contact', label: 'اتصل بنا', url: '../contact.html', variant: 'secondary' },
      ],
    },
  },
]
