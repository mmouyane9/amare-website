/**
 * AMARE MAGAZINE page content — extracted from /Our services/amare-magazine.html
 *
 * This file is the JSON representation of the current live AMARE Magazine page.
 * Every section, heading, paragraph, card, and link is captured exactly
 * as it appears in the source HTML.
 *
 * NOTE: the page contains no content images (SVG placeholders only), so the
 * image fields below are seeded empty ('') — each is independently editable
 * in the Content Editor and the public loader keeps the placeholder until a
 * real image URL is set.
 */

import type { PageSection } from '@/types/content'

// ---------------------------------------------------------------------------
// CMS JSON — exact representation of the live AMARE Magazine page
// ---------------------------------------------------------------------------

export const AMARE_MAGAZINE_SECTIONS: PageSection[] = [
  // =====================================================================
  // 1. HERO  (#magHero)
  // =====================================================================
  {
    id: 'sec-mag-hero',
    type: 'hero',
    enabled: true,
    order: 1,
    data: {
      heading: 'مجلة AMARE',
      subheading: '',
      description:
        'مجلة رقمية تنشر آخر المقالات والأخبار والدراسات والقصص المرتبطة بالبحث والاستكشاف وأنشطة الجمعية.',
      backgroundImage: '',
      buttons: [
        { id: 'btn-mag-hero-latest', label: 'اقرأ أحدث المقالات', url: '#magLatest', variant: 'primary' },
        { id: 'btn-mag-hero-browse', label: 'تصفح المجلة', url: '#magCats', variant: 'secondary' },
      ],
    },
  },

  // =====================================================================
  // 2. FEATURED ARTICLE  (#magFeatured)
  // =====================================================================
  {
    id: 'sec-mag-featured',
    type: 'custom',
    enabled: true,
    order: 2,
    data: {
      _renderer: 'magFeatured',
      badge: 'دراسات',
      heading: 'اكتشاف مواقع أثرية جديدة في الجنوب الشرقي للمغرب',
      excerpt:
        'في إطار الأنشطة الميدانية للجمعية، تمكن فريق من المستكشفين من توثيق مجموعة من المواقع الأثرية غير المكتشفة سابقاً في منطقة الجنوب الشرقي، مما يفتح آفاقاً جديدة للبحث العلمي.',
      date: '15 يونيو 2026',
      readTime: '8 دقائق قراءة',
      image: '',
      linkUrl: '#',
      linkLabel: 'اقرأ المزيد',
    },
  },

  // =====================================================================
  // 3. LATEST ARTICLES  (#magLatest)
  // =====================================================================
  {
    id: 'sec-mag-latest',
    type: 'custom',
    enabled: true,
    order: 3,
    data: {
      _renderer: 'magLatest',
      eyebrow: 'أحدث المقالات',
      heading: 'آخر ما نشر في المجلة',
      description: 'تصفح أحدث المقالات والدراسات والتقارير التي ينشرها فريق المجلة.',
      articles: [
        {
          image: '',
          badge: 'التراث',
          title: 'الحفاظ على التراث المادي في القرى الجبلية المغربية',
          excerpt:
            'دراسة ميدانية حول أهمية الحفاظ على التراث المعماري التقليدي في القرى الجبلية بالمغرب ودور المجتمع المحلي في ذلك.',
          date: '10 يوليو 2026',
          readTime: '6 دقائق',
          linkUrl: '#',
        },
        {
          image: '',
          badge: 'البيئة',
          title: 'تأثير التغيرات المناخية على النظم البيئية في الأطلس الكبير',
          excerpt:
            'تقرير شامل حول تأثير التغيرات المناخية على التنوع البيولوجي والغطاء النباتي في سلسلة جبال الأطلس الكبير.',
          date: '5 يوليو 2026',
          readTime: '7 دقائق',
          linkUrl: '#',
        },
        {
          image: '',
          badge: 'الاستكشاف',
          title: 'رحلة استكشافية إلى مغارة فريواطو: اكتشافات جديدة تحت الأرض',
          excerpt:
            'فريق من مستكشفي الجمعية يخوض مغامرة استكشافية داخل واحدة من أكبر المغارات في شمال المغرب ويكتشف ممرات جديدة.',
          date: '28 يونيو 2026',
          readTime: '5 دقائق',
          linkUrl: '#',
        },
        {
          image: '',
          badge: 'الأنشطة',
          title: 'تغطية خاصة: المسابقة الوطنية للبحث والاستكشاف 2026',
          excerpt:
            'تغطية شاملة لفعاليات المسابقة الوطنية للبحث والاستكشاف التي نظمتها الجمعية بمشاركة مئات المستكشفين من جميع الجهات.',
          date: '20 يونيو 2026',
          readTime: '10 دقائق',
          linkUrl: '#',
        },
        {
          image: '',
          badge: 'التقارير',
          title: 'حصيلة أنشطة الجمعية للنصف الأول من سنة 2026',
          excerpt:
            'تقرير إحصائي مفصل يلخص أبرز أنشطة وإنجازات الجمعية المغربية لهواة البحث والاستكشاف خلال النصف الأول من العام.',
          date: '12 يونيو 2026',
          readTime: '4 دقائق',
          linkUrl: '#',
        },
        {
          image: '',
          badge: 'المقالات',
          title: 'دور البحث العلمي في حماية المواقع الأثرية بالمغرب',
          excerpt:
            'مقال تحليلي يناقش أهمية البحث العلمي والتوثيق الأثري في حماية المواقع التاريخية من الاندثار والنهب.',
          date: '1 يونيو 2026',
          readTime: '6 دقائق',
          linkUrl: '#',
        },
      ],
    },
  },

  // =====================================================================
  // 4. CATEGORIES  (#magCats)
  // =====================================================================
  {
    id: 'sec-mag-cats',
    type: 'custom',
    enabled: true,
    order: 4,
    data: {
      _renderer: 'magCats',
      eyebrow: 'تصفح حسب التصنيف',
      heading: 'فئات المجلة',
      description: 'استكشف محتوى المجلة حسب الفئة التي تهمك.',
      categories: [
        { title: 'الأخبار', count: '12 مقالاً' },
        { title: 'المقالات', count: '18 مقالاً' },
        { title: 'الدراسات', count: '9 مقالات' },
        { title: 'التقارير', count: '7 مقالات' },
        { title: 'الأنشطة', count: '15 مقالاً' },
        { title: 'البيئة', count: '10 مقالات' },
        { title: 'التراث', count: '14 مقالاً' },
        { title: 'الاستكشاف', count: '16 مقالاً' },
      ],
    },
  },

  // =====================================================================
  // 5. NEWSLETTER  (#magNewsletter)
  // =====================================================================
  {
    id: 'sec-mag-newsletter',
    type: 'custom',
    enabled: true,
    order: 5,
    data: {
      _renderer: 'magNewsletter',
      heading: 'اشترك في مجلة AMARE',
      description: 'توصل بأحدث المقالات والدراسات والأخبار مباشرة على بريدك الإلكتروني.',
      buttonLabel: 'اشترك الآن',
    },
  },

  // =====================================================================
  // 6. FINAL CTA  (#magCta)
  // =====================================================================
  {
    id: 'sec-mag-cta',
    type: 'custom',
    enabled: true,
    order: 6,
    data: {
      _renderer: 'magCta',
      heading: 'اكتشف المزيد من المقالات والمواضيع المميزة.',
      buttons: [
        { id: 'btn-mag-cta-all', label: 'جميع المقالات', url: '#magLatest', variant: 'primary' },
        { id: 'btn-mag-cta-contact', label: 'تواصل معنا', url: '../contact.html', variant: 'secondary' },
      ],
    },
  },
]
