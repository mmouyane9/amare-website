/**
 * SOS AMARE page content — extracted from /Our services/sos-amare.html
 *
 * This file is the JSON representation of the current live SOS AMARE page.
 * Every section, heading, paragraph, card, and link is captured exactly
 * as it appears in the source HTML.
 *
 * NOTE: the page contains no content images (SVG icons only), so no
 * image fields are defined.
 */

import type { PageSection } from '@/types/content'

// ---------------------------------------------------------------------------
// CMS JSON — exact representation of the live SOS AMARE page
// ---------------------------------------------------------------------------

export const SOS_AMARE_SECTIONS: PageSection[] = [
  // =====================================================================
  // 1. HERO  (#sosHero)
  // =====================================================================
  {
    id: 'sec-sos-hero',
    type: 'hero',
    enabled: true,
    order: 1,
    data: {
      heading: 'SOS AMARE',
      subheading: 'خدمة المساعدة المجتمعية',
      description: 'نساعدك في العثور على أغراضك المفقودة بسرعة وبمساعدة المجتمع.',
      backgroundImage: '',
      buttons: [
        { id: 'btn-sos-hero-report', label: 'الإبلاغ عن غرض مفقود', url: '#sosForm', variant: 'primary' },
      ],
    },
  },

  // =====================================================================
  // 2. HOW IT WORKS  (#sosHow)
  // =====================================================================
  {
    id: 'sec-sos-how',
    type: 'custom',
    enabled: true,
    order: 2,
    data: {
      _renderer: 'sosHow',
      eyebrow: 'كيف تعمل الخدمة',
      heading: 'خطوات بسيطة لاستعادة أغراضك',
      description: 'نعمل معًا كمجتمع لمساعدتك في العثور على ما فقدته بأسرع وقت ممكن.',
      steps: [
        {
          title: 'الإبلاغ عن الغرض المفقود',
          description: 'قم بملء النموذج بمعلومات دقيقة عن الغرض الذي فقدته.',
        },
        {
          title: 'مراجعة البلاغ',
          description: 'يقوم فريقنا بمراجعة وتدقيق المعلومات قبل النشر.',
        },
        {
          title: 'نشر البلاغ عبر الجمعية',
          description: 'ننشر البلاغ عبر قنوات الجمعية ليصل إلى أكبر عدد من المجتمع.',
        },
        {
          title: 'التواصل مع صاحب الغرض عند العثور عليه',
          description: 'بمجرد العثور على الغرض، نتواصل معك مباشرة لإعادته.',
        },
      ],
    },
  },

  // =====================================================================
  // 3. LOST ITEM CATEGORIES  (#sosCats)
  // =====================================================================
  {
    id: 'sec-sos-categories',
    type: 'custom',
    enabled: true,
    order: 3,
    data: {
      _renderer: 'sosCategories',
      eyebrow: 'فئات الأغراض',
      heading: 'ماذا يمكنك أن تبلغ عنه؟',
      description: 'يمكنك الإبلاغ عن أي غرض مفقود من الفئات التالية أو غيرها.',
      categories: [
        { title: 'البطاقات الوطنية' },
        { title: 'جواز السفر' },
        { title: 'رخصة السياقة' },
        { title: 'المحافظ' },
        { title: 'الهواتف' },
        { title: 'المفاتيح' },
        { title: 'الوثائق' },
        { title: 'أغراض أخرى' },
      ],
    },
  },

  // =====================================================================
  // 4. REPORT FORM heading block  (#sosForm)
  //    The interactive form itself stays hardcoded in the HTML.
  // =====================================================================
  {
    id: 'sec-sos-form',
    type: 'custom',
    enabled: true,
    order: 4,
    data: {
      _renderer: 'sosForm',
      eyebrow: 'نموذج التبليغ',
      heading: 'أبلغ عن غرض مفقود',
      description: 'املأ النموذج أدناه وسنتواصل معك في أقرب وقت.',
    },
  },

  // =====================================================================
  // 5. GREEN NUMBER  (#sosGreen)
  // =====================================================================
  {
    id: 'sec-sos-green',
    type: 'custom',
    enabled: true,
    order: 5,
    data: {
      _renderer: 'sosGreen',
      heading: 'الرقم الأخضر',
      description:
        'إذا كنت بحاجة إلى مساعدة عاجلة أو عثرت على غرض مفقود، يمكنك التواصل معنا مباشرة.',
      number: '0800 00 00 00',
      hours: 'ساعات العمل: من الإثنين إلى السبت | 9:00 - 18:00',
      buttons: [
        { id: 'btn-sos-green-call', label: 'اتصل الآن', url: 'tel:0800000000', variant: 'primary' },
        { id: 'btn-sos-green-wa', label: 'واتساب', url: 'http://wa.me/+212684869996', variant: 'secondary' },
      ],
    },
  },

  // =====================================================================
  // 6. FAQ  (#sosFaq)
  // =====================================================================
  {
    id: 'sec-sos-faq',
    type: 'custom',
    enabled: true,
    order: 6,
    data: {
      _renderer: 'sosFaq',
      eyebrow: 'الأسئلة الشائعة',
      heading: 'كل ما تحتاج معرفته',
      description: 'إجابات على أكثر الأسئلة شيوعاً حول خدمة SOS AMARE.',
      items: [
        {
          question: 'كيف أبلغ عن غرض مفقود؟',
          answer:
            'يمكنك الإبلاغ عن غرضك المفقود من خلال ملء النموذج أعلاه في هذه الصفحة. كل ما عليك هو إدخال معلوماتك الشخصية ووصف دقيق للغرض المفقود ومكان وزمان فقدانه. بعد ذلك سيقوم فريقنا بمراجعة البلاغ ونشره.',
        },
        {
          question: 'كم يستغرق نشر البلاغ؟',
          answer:
            'نقوم بمراجعة البلاغات خلال 24 ساعة من استلامها. بعد التأكد من صحة المعلومات، يتم نشر البلاغ فوراً عبر قنوات الجمعية الرسمية ليصل إلى أكبر عدد ممكن من المجتمع.',
        },
        {
          question: 'هل الخدمة مجانية؟',
          answer:
            'نعم، خدمة SOS AMARE مجانية بالكامل. هي جزء من الخدمات المجتمعية التي تقدمها الجمعية المغربية لهواة البحث والاستكشاف لمساعدة المجتمع دون أي مقابل مادي.',
        },
        {
          question: 'ماذا أفعل إذا عثرت على غرض مفقود؟',
          answer:
            'إذا عثرت على غرض مفقود، يمكنك التواصل معنا مباشرة عبر الرقم الأخضر أو واتساب. سنقوم بمطابقة الغرض مع البلاغات الموجودة لدينا والتواصل مع صاحبه. كما يمكنك تسليمه لأقرب فرع من فروع الجمعية.',
        },
      ],
    },
  },

  // =====================================================================
  // 7. FINAL CTA  (#sosCta)
  // =====================================================================
  {
    id: 'sec-sos-cta',
    type: 'custom',
    enabled: true,
    order: 7,
    data: {
      _renderer: 'sosCta',
      heading: 'ساعدنا في إعادة المفقودات إلى أصحابها.',
      description: '',
      buttons: [
        { id: 'btn-sos-cta-report', label: 'الإبلاغ عن غرض مفقود', url: '#sosForm', variant: 'primary' },
        { id: 'btn-sos-cta-contact', label: 'الاتصال بنا', url: '../contact.html', variant: 'secondary' },
      ],
    },
  },
]
