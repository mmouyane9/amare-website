/**
 * أنشطتنا page content — bilingual _ar/_fr format
 */

import type { PageSection } from '@/types/content'

export const ACTIVITIES_PAGE_SECTIONS: PageSection[] = [
  {
    id: 'sec-activities-hero',
    type: 'hero',
    enabled: true,
    order: 1,
    data: {
      heading_ar: 'أنشطة الجمعية',
      heading_fr: "Activités de l'association",
      subheading_ar: 'أنشطتنا',
      subheading_fr: 'Nos activités',
      description_ar:
        'نظمت الجمعية المغربية لهواة البحث والاستكشاف مجموعة متنوعة من الأنشطة والمبادرات التي تجمع بين الاستكشاف والتكوين والعمل البيئي والتواصل المجتمعي.',
      description_fr:
        "L'Association Marocaine des Amateurs de Recherche et d'Exploration a organisé une diversité d'activités et d'initiatives alliant exploration, formation, action environnementale et communication communautaire.",
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
      heading_ar: 'أنشطتنا',
      heading_fr: 'Nos activités',
      description_ar: '',
      description_fr: '',
      cards: [
        {
          title_ar: 'الخرجات',
          title_fr: 'Sorties',
          description_ar: 'خرجات ميدانية للاستكشاف والتعرف على المواقع والمجالات الطبيعية.',
          description_fr: "Sorties de terrain pour l'exploration et la découverte des sites et espaces naturels.",
        },
        {
          title_ar: 'مسابقات وراليات',
          title_fr: 'Compétitions et rallyes',
          description_ar: 'تنظيم مسابقات وراليات تجمع بين روح التحدي والاستكشاف.',
          description_fr: "Organisation de compétitions et de rallyes alliant esprit de défi et exploration.",
        },
        {
          title_ar: 'تكوينات',
          title_fr: 'Formations',
          description_ar: 'تكوينات وورشات لتطوير مهارات الأعضاء والمهتمين بمجال الاستكشاف.',
          description_fr: "Formations et ateliers pour développer les compétences des membres et des passionnés d'exploration.",
        },
        {
          title_ar: 'معارض',
          title_fr: 'Expositions',
          description_ar: 'المشاركة وتنظيم معارض للتعريف بأنشطة الجمعية وإنجازاتها.',
          description_fr: "Participation et organisation d'expositions pour faire connaître les activités et réalisations de l'association.",
        },
        {
          title_ar: 'لقاءات',
          title_fr: 'Rencontres',
          description_ar: 'لقاءات وفعاليات تجمع الأعضاء والشركاء والمهتمين.',
          description_fr: "Rencontres et événements rassemblant les membres, les partenaires et les passionnés.",
        },
        {
          title_ar: 'حملات بيئية',
          title_fr: 'Campagnes environnementales',
          description_ar: 'مبادرات وحملات تهدف إلى حماية البيئة والتحسيس بأهمية المحافظة عليها.',
          description_fr: "Initiatives et campagnes visant à protéger l'environnement et à sensibiliser à l'importance de sa préservation.",
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
      heading_ar: 'اكتشف أنشطتنا',
      heading_fr: 'Découvrez nos activités',
      description_ar: 'تابع آخر أنشطة الجمعية ومبادراتها.',
      description_fr: "Suivez les dernières activités et initiatives de l'association.",
      buttons: [
        { id: 'btn-act-news', label_ar: 'آخر الأخبار', label_fr: 'Dernières actualités', url: '../News/news.html', variant: 'primary' },
        { id: 'btn-act-contact', label_ar: 'تواصل معنا', label_fr: 'Contactez-nous', url: '../contact.html', variant: 'secondary' },
      ],
    },
  },
]
