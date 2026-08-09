/**
 * أنشطتنا page content — extracted from /Our activities/index.html
 */

import type { PageSection } from '@/types/content'

export const ACTIVITIES_PAGE_SECTIONS: PageSection[] = [
  {
    id: 'sec-activities-hero',
    type: 'hero',
    enabled: true,
    order: 1,
    data: {
      heading: 'أنشطة الجمعية',
      subheading: 'أنشطتنا',
      description:
        'نظمت الجمعية المغربية لهواة البحث والاستكشاف مجموعة متنوعة من الأنشطة والمبادرات التي تجمع بين الاستكشاف والتكوين والعمل البيئي والتواصل المجتمعي.',
      backgroundImage: '',
      buttons: [],
    },
  },
  {
    id: 'sec-activities-grid',
    type: 'custom',
    enabled: true,
    order: 2,
    data: {
      _renderer: 'activitiesGrid',
      heading: 'أنشطتنا',
      description: '',
      cards: [
        {
          title: 'الخرجات',
          description: 'خرجات ميدانية للاستكشاف والتعرف على المواقع والمجالات الطبيعية.',
        },
        {
          title: 'مسابقات وراليات',
          description: 'تنظيم مسابقات وراليات تجمع بين روح التحدي والاستكشاف.',
        },
        {
          title: 'تكوينات',
          description: 'تكوينات وورشات لتطوير مهارات الأعضاء والمهتمين بمجال الاستكشاف.',
        },
        {
          title: 'معارض',
          description: 'المشاركة وتنظيم معارض للتعريف بأنشطة الجمعية وإنجازاتها.',
        },
        {
          title: 'لقاءات',
          description: 'لقاءات وفعاليات تجمع الأعضاء والشركاء والمهتمين.',
        },
        {
          title: 'حملات بيئية',
          description: 'مبادرات وحملات تهدف إلى حماية البيئة والتحسيس بأهمية المحافظة عليها.',
        },
      ],
    },
  },
  {
    id: 'sec-activities-cta',
    type: 'custom',
    enabled: true,
    order: 3,
    data: {
      _renderer: 'activitiesCta',
      heading: 'اكتشف أنشطتنا',
      description: 'تابع آخر أنشطة الجمعية ومبادراتها.',
      buttons: [
        { id: 'btn-act-news', label: 'آخر الأخبار', url: '../News/news.html', variant: 'primary' },
        { id: 'btn-act-contact', label: 'تواصل معنا', url: '../contact.html', variant: 'secondary' },
      ],
    },
  },
]
