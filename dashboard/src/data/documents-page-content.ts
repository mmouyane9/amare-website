/**
 * وثائق الانخراط (JOIN US — Documents) page content — extracted from /Join us/documents.html
 *
 * This file is the JSON representation of the current live Documents page.
 * Every section, heading, paragraph, card, link, and FAQ is captured exactly
 * as it appears in the source HTML.
 *
 * NOTE: the page has NO content images (only the shared AMARE logo used by the
 * navbar/footer), so no image fields exist at all. Every document download link
 * is a '#' placeholder in the source — preserved as-is and independently
 * editable in the Content Editor (no invented URLs).
 */

import type { PageSection } from '@/types/content'

// ---------------------------------------------------------------------------
// CMS JSON — exact representation of the live Documents page
// ---------------------------------------------------------------------------

export const DOCUMENTS_SECTIONS: PageSection[] = [
  // =====================================================================
  // 1. HERO  (#hero)
  // =====================================================================
  {
    id: 'sec-doc-hero',
    type: 'hero',
    enabled: true,
    order: 1,
    data: {
      heading: 'وثائق الانخراط',
      headingEm: 'الانخراط',
      subheading: 'وثائق الانخراط',
      description:
        'يمكنك من خلال هذه الصفحة تحميل جميع الوثائق الضرورية الخاصة بالانخراط في الجمعية المغربية لهواة البحث والاستكشاف.',
      backgroundImage: '',
      buttons: [
        { id: 'btn-doc-hero-download', label: 'تحميل الوثائق', url: '#doc-grid', variant: 'primary' },
        { id: 'btn-doc-hero-req', label: 'متطلبات العضوية', url: '#doc-requirements', variant: 'secondary' },
      ],
    },
  },

  // =====================================================================
  // 2. DOCUMENTS GRID  (#doc-grid)
  // =====================================================================
  {
    id: 'sec-doc-grid',
    type: 'custom',
    enabled: true,
    order: 2,
    data: {
      _renderer: 'docGrid',
      eyebrow: 'الوثائق المطلوبة',
      heading: 'جميع وثائق الانخراط',
      description: 'قم بتحميل الوثائق اللازمة لعملية الانخراط في الجمعية',
      documents: [
        {
          title: 'استمارة الانخراط',
          description:
            'استمارة رسمية لطلب الانضمام إلى الجمعية، تتضمن المعلومات الشخصية والبيانات الأساسية.',
          format: 'PDF',
          size: '1.2 MB',
          date: '15 يونيو 2026',
          buttonLabel: 'تحميل الاستمارة',
          url: '#',
        },
        {
          title: 'القانون الداخلي',
          description:
            'جميع حقوق وواجبات أعضاء الجمعية، والضوابط التنظيمية التي تحكم سير العمل بالجمعية.',
          format: 'PDF',
          size: '980 KB',
          date: '15 يونيو 2026',
          buttonLabel: 'تحميل القانون',
          url: '#',
        },
        {
          title: 'ميثاق العضوية',
          description:
            'القيم والمبادئ التي يلتزم بها جميع الأعضاء، ويشمل حقوق ومسؤوليات كل عضو في الجمعية.',
          format: 'DOCX',
          size: '750 KB',
          date: '15 يونيو 2026',
          buttonLabel: 'تحميل الميثاق',
          url: '#',
        },
        {
          title: 'التزام العضو',
          description:
            'وثيقة الالتزام بشروط وقوانين الجمعية التي يجب على كل عضو التوقيع عليها والإلتزام ببنودها.',
          format: 'PDF',
          size: '620 KB',
          date: '15 يونيو 2026',
          buttonLabel: 'تحميل الوثيقة',
          url: '#',
        },
      ],
    },
  },

  // =====================================================================
  // 3. DOWNLOAD ALL  (#doc-download)
  // =====================================================================
  {
    id: 'sec-doc-download',
    type: 'custom',
    enabled: true,
    order: 3,
    data: {
      _renderer: 'docDownload',
      heading: 'تحميل جميع الوثائق',
      description:
        'يمكنك تحميل جميع وثائق الانخراط في ملف واحد مضغوط لتسهيل عملية التسجيل والاطلاع على كل الوثائق دفعة واحدة.',
      buttonLabel: 'تحميل جميع الوثائق',
      url: '#',
    },
  },

  // =====================================================================
  // 4. MEMBERSHIP REQUIREMENTS  (#doc-requirements)
  // =====================================================================
  {
    id: 'sec-doc-requirements',
    type: 'custom',
    enabled: true,
    order: 4,
    data: {
      _renderer: 'docRequirements',
      eyebrow: 'متطلبات العضوية',
      heading: 'شروط الانخراط في الجمعية',
      description: 'للتأكد من استكمال جميع المتطلبات، يرجى مراجعة القائمة التالية',
      items: [
        'تعبئة استمارة الانخراط.',
        'إرفاق نسخة من البطاقة الوطنية.',
        'صورة شخصية.',
        'الموافقة على القانون الداخلي.',
        'إرسال الطلب عبر المنصة.',
      ],
    },
  },

  // =====================================================================
  // 5. FAQ  (#doc-faq)
  // =====================================================================
  {
    id: 'sec-doc-faq',
    type: 'custom',
    enabled: true,
    order: 5,
    data: {
      _renderer: 'docFaq',
      eyebrow: 'الأسئلة الشائعة',
      heading: 'استفسارات حول الوثائق',
      description: 'أجوبة على أكثر الأسئلة شيوعًا بخصوص وثائق الانخراط',
      items: [
        {
          question: 'ما هي الوثائق المطلوبة للانخراط؟',
          answer:
            'الوثائق المطلوبة للانخراط في الجمعية هي: استمارة الانخراط معبأة، نسخة من البطاقة الوطنية، صورة شخصية حديثة، بالإضافة إلى الموافقة على القانون الداخلي والتوقيع على وثيقة التزام العضو. يمكنك تحميل جميع هذه الوثائق من هذه الصفحة.',
        },
        {
          question: 'هل يمكن تعبئة الاستمارة إلكترونياً؟',
          answer:
            'نعم، يمكنك تعبئة استمارة الانخراط إلكترونياً من خلال صفحة الانخراط الإلكتروني. بعد تعبئة الاستمارة وإرفاق الوثائق المطلوبة، سيتم إنشاء ملف PDF يحتوي على جميع البيانات ويمكنك طباعته وتوقيعه.',
        },
        {
          question: 'هل يمكن تحميل الوثائق أكثر من مرة؟',
          answer:
            'بالتأكيد، جميع الوثائق المتاحة للتحميل في هذه الصفحة يمكن تحميلها وتنزيلها عدد غير محدود من المرات. الوثائق متاحة بشكل دائم لجميع الزوار والأعضاء.',
        },
        {
          question: 'كيف أرسل الوثائق بعد تعبئتها؟',
          answer:
            'بعد تحميل الوثائق وتعبئتها، يمكنك إما إرسالها عبر البريد الإلكتروني للجمعية، أو التوجه إلى مقر الجمعية لتسليمها شخصياً. كما يمكنك استخدام منصة الانخراط الإلكتروني لرفع الوثائق مباشرة وإرسال طلبك إلكترونياً.',
        },
      ],
    },
  },

  // =====================================================================
  // 6. FINAL CTA  (#doc-cta)
  // =====================================================================
  {
    id: 'sec-doc-cta',
    type: 'custom',
    enabled: true,
    order: 6,
    data: {
      _renderer: 'docCta',
      heading: 'جاهز لإرسال طلب الانخراط؟',
      headingEm: 'طلب الانخراط؟',
      description:
        'بعد تحميل الوثائق وتعبئتها يمكنك الانتقال مباشرة إلى صفحة الانخراط الإلكتروني وإرسال طلبك. يمكنك أيضاً الاطلاع على وثيقة الالتزام والقانون الأساسي.',
      buttons: [
        { id: 'btn-doc-cta-commitment', label: 'وثيقة الالتزام', url: 'commitment.html', variant: 'secondary' },
        { id: 'btn-doc-cta-bylaws', label: 'القانون الأساسي', url: 'bylaws.html', variant: 'secondary' },
        { id: 'btn-doc-cta-join', label: 'الانخراط الإلكتروني', url: 'index.html#join-form', variant: 'primary' },
        { id: 'btn-doc-cta-application', label: 'استمارة الانخراط', url: 'application.html', variant: 'secondary' },
        { id: 'btn-doc-cta-regulations', label: 'النظام الداخلي', url: 'internal-regulations.html', variant: 'secondary' },
      ],
    },
  },
]
