/**
 * الأرشيف (ARCHIVE) page content — extracted from /Archive/archive.html
 *
 * This file is the JSON representation of the current live Archive page.
 * Every section heading, the 4 statistics, the full archive store
 * (16 items + 8 categories + 6 downloads) and the 4 FAQ items are captured
 * exactly as they appear in the source HTML.
 *
 * NOTE: the page has NO content images — archive cards render an SVG
 * placeholder icon (thumbClass selects which icon). So every archive item
 * keeps its source thumbClass and no image fields exist.
 * Every archive item link is '#' in the source — preserved as-is and
 * editable (no invented URLs). Download links use fileUrl/linkLabel.
 * Stat displays keep the '+' prefix and the data-count target of the
 * count-up animation.
 */

import type { PageSection } from '@/types/content'

// ---------------------------------------------------------------------------
// CMS JSON — exact representation of the live Archive page
// ---------------------------------------------------------------------------

export const ARCHIVE_PAGE_SECTIONS: PageSection[] = [
  // =====================================================================
  // 1. HERO  (#arHero)
  // =====================================================================
  {
    id: 'sec-archive-hero',
    type: 'hero',
    enabled: true,
    order: 1,
    data: {
      heading: 'الأرشيف',
      headingEm: 'شيف',
      subheading: 'المكتبة الرقمية',
      description:
        'استعرض أرشيف الجمعية، الوثائق الرسمية، الأنشطة السابقة، التقارير، والمنشورات التاريخية.',
      backgroundImage: '',
      buttons: [
        { id: 'btn-archive-hero-browse', label: 'تصفح الأرشيف', url: '#arLibrary', variant: 'primary' },
        { id: 'btn-archive-hero-contact', label: 'تواصل معنا', url: '../contact.html', variant: 'secondary' },
      ],
    },
  },

  // =====================================================================
  // 2. STATISTICS  (#arStats)
  // display = visible text (keeps '+' prefix), count = data-count target
  // =====================================================================
  {
    id: 'sec-archive-stats',
    type: 'custom',
    enabled: true,
    order: 2,
    data: {
      _renderer: 'arStats',
      eyebrow: 'إحصائيات الأرشيف',
      heading: 'أرشيفنا بالأرقام',
      stats: [
        { display: '+1,247', count: '1247', label: 'عدد الوثائق' },
        { display: '+356', count: '356', label: 'عدد الأنشطة المؤرشفة' },
        { display: '+4,820', count: '4820', label: 'عدد الصور' },
        { display: '+89', count: '89', label: 'عدد التقارير' },
      ],
    },
  },

  // =====================================================================
  // 3. CATEGORIES  (#arCategories)
  // Category icons stay static (SVG in the page) — only id + label are
  // editable; counts are computed from the archive items.
  // =====================================================================
  {
    id: 'sec-archive-categories',
    type: 'custom',
    enabled: true,
    order: 3,
    data: {
      _renderer: 'arCategories',
      eyebrow: 'تصفح حسب الفئة',
      heading: 'فئات الأرشيف',
      description: 'اختر الفئة التي تهمك لاستعراض المحتوى المؤرشف.',
      categories: [
        { id: 'activities', label: 'الأنشطة السابقة' },
        { id: 'reports', label: 'التقارير السنوية' },
        { id: 'images', label: 'الصور' },
        { id: 'videos', label: 'الفيديوهات' },
        { id: 'official', label: 'الوثائق الرسمية' },
        { id: 'publications', label: 'المجلات والمنشورات' },
        { id: 'announcements', label: 'البيانات والإعلانات' },
        { id: 'other', label: 'ملفات متنوعة' },
      ],
    },
  },

  // =====================================================================
  // 4. SEARCH & FILTER  (#arSearch)
  // =====================================================================
  {
    id: 'sec-archive-search',
    type: 'custom',
    enabled: true,
    order: 4,
    data: {
      _renderer: 'arSearch',
      eyebrow: 'بحث متقدم',
      heading: 'ابحث في الأرشيف',
    },
  },

  // =====================================================================
  // 5. ARCHIVE LIBRARY  (#arLibrary)
  // 16 items — thumbClass selects the card's SVG placeholder icon
  // (ar-thumb-doc / ar-thumb-report / ar-thumb-image / ar-thumb-video /
  //  ar-thumb-publication / ar-thumb-official).
  // =====================================================================
  {
    id: 'sec-archive-library',
    type: 'custom',
    enabled: true,
    order: 5,
    data: {
      _renderer: 'arLibrary',
      eyebrow: 'مكتبة الأرشيف',
      heading: 'تصفح المحتوى المؤرشف',
      description: 'استعرض جميع الوثائق والأنشطة والمنشورات المؤرشفة للجمعية.',
      items: [
        {
          category: 'activities',
          catLabel: 'الأنشطة السابقة',
          thumbClass: 'ar-thumb-doc',
          title: 'تقرير الخرجة الاستكشافية إلى جبال الأطلس 2025',
          desc: 'تقرير مفصل يوثق فعاليات الخرجة الاستكشافية التي نظمتها الجمعية إلى جبال الأطلس الكبير.',
          date: '2025-09-15',
          linkUrl: '#',
          linkLabel: 'عرض التفاصيل',
        },
        {
          category: 'reports',
          catLabel: 'التقارير السنوية',
          thumbClass: 'ar-thumb-report',
          title: 'التقرير السنوي للجمعية 2025',
          desc: 'التقرير السنوي الشامل لأنشطة وإنجازات الجمعية خلال سنة 2025.',
          date: '2025-12-31',
          linkUrl: '#',
          linkLabel: 'عرض التفاصيل',
        },
        {
          category: 'images',
          catLabel: 'الصور',
          thumbClass: 'ar-thumb-image',
          title: 'ألبوم صور حملة تنظيف شاطئ أكادير',
          desc: 'مجموعة صور توثق فعاليات حملة تنظيف شاطئ أكادير بمشاركة 200 متطوع.',
          date: '2025-07-10',
          linkUrl: '#',
          linkLabel: 'عرض التفاصيل',
        },
        {
          category: 'videos',
          catLabel: 'الفيديوهات',
          thumbClass: 'ar-thumb-video',
          title: 'فيديو توثيقي: المسابقة الوطنية للكشف عن المعادن',
          desc: 'تغطية مرئية شاملة لفعاليات المسابقة الوطنية للكشف عن المعادن.',
          date: '2025-06-20',
          linkUrl: '#',
          linkLabel: 'عرض التفاصيل',
        },
        {
          category: 'official',
          catLabel: 'الوثائق الرسمية',
          thumbClass: 'ar-thumb-official',
          title: 'محضر الجمع العام السنوي 2025',
          desc: 'محضر رسمي يوثق أشغال الجمع العام السنوي وقراراته.',
          date: '2025-12-20',
          linkUrl: '#',
          linkLabel: 'عرض التفاصيل',
        },
        {
          category: 'publications',
          catLabel: 'المجلات والمنشورات',
          thumbClass: 'ar-thumb-publication',
          title: 'مجلة AMARE — العدد الثالث',
          desc: 'العدد الثالث من مجلة AMARE يتضمن مقالات ودراسات حول الاستكشاف والتنقيب.',
          date: '2025-10-01',
          linkUrl: '#',
          linkLabel: 'عرض التفاصيل',
        },
        {
          category: 'announcements',
          catLabel: 'البيانات والإعلانات',
          thumbClass: 'ar-thumb-doc',
          title: 'بلاغ افتتاح فرع جهة طنجة',
          desc: 'بيان رسمي يعلن افتتاح الفرع الجهوي للجمعية بجهة طنجة - تطوان - الحسيمة.',
          date: '2025-05-15',
          linkUrl: '#',
          linkLabel: 'عرض التفاصيل',
        },
        {
          category: 'other',
          catLabel: 'ملفات متنوعة',
          thumbClass: 'ar-thumb-doc',
          title: 'دليل المستكشف — الطبعة الأولى',
          desc: 'دليل شامل للمستكشف المبتدئ يتضمن نصائح وإرشادات حول أساسيات الاستكشاف.',
          date: '2025-03-01',
          linkUrl: '#',
          linkLabel: 'عرض التفاصيل',
        },
        {
          category: 'activities',
          catLabel: 'الأنشطة السابقة',
          thumbClass: 'ar-thumb-doc',
          title: 'تقرير الدورة التكوينية في الملاحة البرية',
          desc: 'تقرير مفصل عن الدورة التكوينية التي استفاد منها 35 عضواً.',
          date: '2025-06-10',
          linkUrl: '#',
          linkLabel: 'عرض التفاصيل',
        },
        {
          category: 'reports',
          catLabel: 'التقارير السنوية',
          thumbClass: 'ar-thumb-report',
          title: 'التقرير المالي السنوي 2024',
          desc: 'تقرير مالي مفصل يوثق مداخيل ومصاريف الجمعية لسنة 2024.',
          date: '2024-12-31',
          linkUrl: '#',
          linkLabel: 'عرض التفاصيل',
        },
        {
          category: 'images',
          catLabel: 'الصور',
          thumbClass: 'ar-thumb-image',
          title: 'ألبوم معرض الاكتشافات الأثرية',
          desc: 'مجموعة صور من المعرض الجهوي للمستكشفين بمشاركة 30 عارضاً.',
          date: '2025-07-03',
          linkUrl: '#',
          linkLabel: 'عرض التفاصيل',
        },
        {
          category: 'publications',
          catLabel: 'المجلات والمنشورات',
          thumbClass: 'ar-thumb-publication',
          title: 'مجلة AMARE — العدد الثاني',
          desc: 'العدد الثاني من مجلة AMARE يغطي أنشطة الجمعية في النصف الأول من 2025.',
          date: '2025-04-15',
          linkUrl: '#',
          linkLabel: 'عرض التفاصيل',
        },
        {
          category: 'videos',
          catLabel: 'الفيديوهات',
          thumbClass: 'ar-thumb-video',
          title: 'فيديو: حملة تشجير غابة المعمورة',
          desc: 'تغطية مرئية لحملة التشجير التي نظمتها الجمعية بغابة المعمورة.',
          date: '2025-05-22',
          linkUrl: '#',
          linkLabel: 'عرض التفاصيل',
        },
        {
          category: 'official',
          catLabel: 'الوثائق الرسمية',
          thumbClass: 'ar-thumb-official',
          title: 'القانون الأساسي للجمعية',
          desc: 'النظام الأساسي الرسمي للجمعية المغربية لهواة البحث والاستكشاف.',
          date: '2024-01-01',
          linkUrl: '#',
          linkLabel: 'عرض التفاصيل',
        },
        {
          category: 'announcements',
          catLabel: 'البيانات والإعلانات',
          thumbClass: 'ar-thumb-doc',
          title: 'إعلان فتح باب الانخراط لموسم 2025',
          desc: 'بلاغ رسمي يعلن عن فتح باب الانخراط والتسجيل للموسم الجديد.',
          date: '2025-01-10',
          linkUrl: '#',
          linkLabel: 'عرض التفاصيل',
        },
        {
          category: 'other',
          catLabel: 'ملفات متنوعة',
          thumbClass: 'ar-thumb-doc',
          title: 'أرشيف اتفاقيات الشراكة',
          desc: 'مجموعة اتفاقيات الشراكة الموقعة بين الجمعية ومختلف الشركاء.',
          date: '2024-06-01',
          linkUrl: '#',
          linkLabel: 'عرض التفاصيل',
        },
      ],
    },
  },

  // =====================================================================
  // 6. DOWNLOADS  (#arDownloads)
  // Download icons stay static (SVG in the page) — only title, size and
  // the file link are editable.
  // =====================================================================
  {
    id: 'sec-archive-downloads',
    type: 'custom',
    enabled: true,
    order: 6,
    data: {
      _renderer: 'arDownloads',
      eyebrow: 'مركز التحميل',
      heading: 'تحميل الملفات',
      items: [
        { title: 'القانون الأساسي للجمعية', size: '2.4 MB', fileUrl: '#', linkLabel: 'تحميل' },
        { title: 'التقرير السنوي 2025', size: '5.1 MB', fileUrl: '#', linkLabel: 'تحميل' },
        { title: 'نموذج طلب الانخراط', size: '1.2 MB', fileUrl: '#', linkLabel: 'تحميل' },
        { title: 'مجلة AMARE — العدد الثالث', size: '8.7 MB', fileUrl: '#', linkLabel: 'تحميل' },
        { title: 'دليل المستكشف — الطبعة الأولى', size: '3.9 MB', fileUrl: '#', linkLabel: 'تحميل' },
        { title: 'محضر الجمع العام 2025', size: '1.8 MB', fileUrl: '#', linkLabel: 'تحميل' },
      ],
    },
  },

  // =====================================================================
  // 7. FAQ  (#arFaq)
  // =====================================================================
  {
    id: 'sec-archive-faq',
    type: 'custom',
    enabled: true,
    order: 7,
    data: {
      _renderer: 'arFaq',
      eyebrow: 'الأسئلة الشائعة',
      heading: 'كل ما تريد معرفته عن الأرشيف',
      items: [
        {
          question: 'كيف أبحث داخل الأرشيف؟',
          answer:
            'يمكنك استخدام شريط البحث المتقدم للبحث بالكلمات المفتاحية، أو تصفية النتائج حسب الفئة والسنة للوصول إلى المحتوى الذي تبحث عنه بسهولة.',
        },
        {
          question: 'هل يمكن تحميل الوثائق؟',
          answer:
            'نعم، نوفر مركز تحميل يتيح لك تنزيل الوثائق الرسمية والتقارير والمنشورات بصيغة PDF مجاناً. بعض الوثائق قد تتطلب تسجيل الدخول للتحميل.',
        },
        {
          question: 'كيف يمكن طلب وثيقة قديمة؟',
          answer:
            'إذا لم تجد الوثيقة التي تبحث عنها في الأرشيف الرقمي، يمكنك التواصل مع فريق الأرشيف عبر نموذج الاتصال أو البريد الإلكتروني لتقديم طلب رسمي وسنساعدك في الحصول عليها.',
        },
        {
          question: 'هل تتم إضافة أرشيف جديد باستمرار؟',
          answer:
            'نعم، يتم تحديث الأرشيف بشكل دوري لإضافة الأنشطة الجديدة والوثائق والتقارير. نحرص على توثيق جميع أنشطة الجمعية وإضافتها إلى الأرشيف الرقمي باستمرار.',
        },
      ],
    },
  },

  // =====================================================================
  // 8. FINAL CTA  (#arCta)
  // =====================================================================
  {
    id: 'sec-archive-cta',
    type: 'custom',
    enabled: true,
    order: 8,
    data: {
      _renderer: 'arCta',
      heading: 'اكتشف تاريخ وإنجازات الجمعية.',
      buttons: [
        { id: 'btn-archive-cta-browse', label: 'استعرض الأرشيف', url: '#arLibrary', variant: 'primary' },
        { id: 'btn-archive-cta-contact', label: 'اتصل بنا', url: '../contact.html', variant: 'secondary' },
      ],
    },
  },
]
