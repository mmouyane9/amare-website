/**
 * اتصل بنا (CONTACT) page content — extracted from /contact.html
 *
 * This file is the JSON representation of the current live Contact page.
 * Every section heading, the 4 contact cards (address / phone / email /
 * working hours), the info-card text, the social links, the contact form
 * labels + placeholders + subject options, the Google Maps URL, the 4 FAQ
 * items and the final CTA are captured exactly as they appear in the source
 * HTML.
 *
 * NOTE: the page has NO content images — hero art is pure CSS and the cards
 * render inline SVG icons — so there are no image fields.
 *
 * The contact page reuses the GLOBAL website_settings for its contact info
 * elements (data-amare-setting attributes filled by supabase/website-settings.js).
 * This loader carries the same values in the Contact page's own sections and
 * re-applies them on the 'amare:settingschange' event, so the Contact page
 * CMS content is authoritative for this page while the footer/navbar keep the
 * global values. Social links and the map URL are '#' / the embed URL in the
 * source — preserved as-is and editable (no invented URLs).
 */

import type { PageSection } from '@/types/content'

// ---------------------------------------------------------------------------
// CMS JSON — exact representation of the live Contact page
// ---------------------------------------------------------------------------

export const CONTACT_PAGE_SECTIONS: PageSection[] = [
  // =====================================================================
  // 1. HERO  (#home)
  // =====================================================================
  {
    id: 'sec-contact-hero',
    type: 'hero',
    enabled: true,
    order: 1,
    data: {
      heading: 'يسعدنا التواصل معكم',
      subheading: 'تواصل معنا',
      description:
        'إذا كانت لديكم أي استفسارات أو اقتراحات أو ترغبون في الانضمام إلى الجمعية، لا تترددوا في التواصل معنا.',
      backgroundImage: '',
      buttons: [
        { id: 'btn-contact-hero-message', label: 'أرسل رسالة', url: '#contactFormSection', variant: 'primary' },
        { id: 'btn-contact-hero-faq', label: 'الأسئلة الشائعة', url: '#contactFaq', variant: 'secondary' },
      ],
    },
  },

  // =====================================================================
  // 2. CONTACT CARDS  (#contactCards)
  // The 4 contact info fields (address / phone / email / working hours).
  // Icons stay static (SVG in the page) — title, value and detail are
  // editable. The same values feed the info-card list in the form section.
  // =====================================================================
  {
    id: 'sec-contact-cards',
    type: 'custom',
    enabled: true,
    order: 2,
    data: {
      _renderer: 'contactCards',
      eyebrow: 'معلومات سريعة',
      heading: 'قنوات التواصل',
      description: 'اختر الطريقة الأنسب للتواصل مع فريق الجمعية وسنرد عليكم في أقرب وقت ممكن.',
      items: [
        { id: 'address', title: 'العنوان', value: 'المغرب', detail: 'أيت ملول، أكادير' },
        { id: 'phone', title: 'الهاتف', value: '+212 684 869 996', detail: '' },
        { id: 'email', title: 'البريد الإلكتروني', value: 'association.amare.agadir@gmail.com', detail: '' },
        { id: 'hours', title: 'ساعات العمل', value: 'الإثنين - الجمعة', detail: '09:00 - 18:00' },
      ],
    },
  },

  // =====================================================================
  // 3. CONTACT FORM + INFO CARD  (#contactFormSection)
  // Section head + info-card text + social links + form labels/placeholders
  // + subject options + submit label. The info-card VALUES (address, phone,
  // email, hours) come from the contactCards section (single source of
  // truth). Form validation stays in contact.html's inline JS — untouched.
  // =====================================================================
  {
    id: 'sec-contact-form',
    type: 'custom',
    enabled: true,
    order: 3,
    data: {
      _renderer: 'contactForm',
      eyebrow: 'أرسل لنا رسالة',
      heading: 'نحن هنا من أجلكم',
      description: 'املأ النموذج التالي وسيتواصل معكم فريقنا في أقرب وقت.',
      infoTitle: 'معلومات التواصل',
      infoDescription:
        'فريقنا جاهز للرد على استفساراتكم من الإثنين إلى الجمعة. لا تترددوا في التواصل معنا عبر أي وسيلة تناسبكم.',
      socialTitle: 'تابعونا على',
      social: [
        { id: 'fb', label: 'فيسبوك', url: '#' },
        { id: 'ig', label: 'إنستغرام', url: '#' },
        { id: 'in', label: 'لينكدإن', url: '#' },
        { id: 'yt', label: 'يوتيوب', url: '#' },
      ],
      formTitle: 'أرسل لنا رسالة',
      formDescription: 'جميع الحقول إلزامية. سيتم الرد على رسالتك في أقرب وقت ممكن.',
      fields: [
        { id: 'name', label: 'الاسم الكامل', placeholder: 'أدخل اسمك الكامل' },
        { id: 'email', label: 'البريد الإلكتروني', placeholder: 'example@email.com' },
        { id: 'phone', label: 'رقم الهاتف', placeholder: '+212 6XX XX XX XX' },
        { id: 'subject', label: 'الموضوع', placeholder: 'اختر موضوع الرسالة' },
        { id: 'message', label: 'الرسالة', placeholder: 'اكتب رسالتك هنا...' },
      ],
      subjects: ['استفسار', 'انضمام إلى الجمعية', 'اقتراح', 'تطوع', 'أخرى'],
      submitLabel: 'إرسال الرسالة',
    },
  },

  // =====================================================================
  // 4. MAP  (#contactMap)
  // mapUrl = the Google Maps embed URL of the current iframe src.
  // =====================================================================
  {
    id: 'sec-contact-map',
    type: 'custom',
    enabled: true,
    order: 4,
    data: {
      _renderer: 'contactMap',
      eyebrow: 'العثور علينا',
      heading: 'موقعنا',
      mapUrl: 'https://www.google.com/maps?q=30.385528,-9.448611&z=16&output=embed',
    },
  },

  // =====================================================================
  // 5. FAQ  (#contactFaq)
  // =====================================================================
  {
    id: 'sec-contact-faq',
    type: 'custom',
    enabled: true,
    order: 5,
    data: {
      _renderer: 'contactFaq',
      eyebrow: 'الأسئلة الشائعة',
      heading: 'لديكم أسئلة؟ لدينا إجابات',
      description: 'جمعنا لكم الإجابات عن أكثر الأسئلة تكرارًا حول الجمعية وطرق التواصل.',
      items: [
        {
          question: 'كيف يمكنني الانضمام للجمعية؟',
          answer:
            'يمكنكم الانضمام إلى الجمعية عبر ملء استمارة الانخراط المتوفرة على صفحة "انخرط معنا"، أو بزيارة مقر الجمعية مباشرة، أو بمراسلتنا عبر البريد الإلكتروني. تُدرَس جميع الطلبات خلال أسبوع واحد من التوصل بها.',
        },
        {
          question: 'كيف أتواصل مع الإدارة؟',
          answer:
            'يمكنكم التواصل مع الإدارة عبر الهاتف +212 684 869 996 من الإثنين إلى الجمعة بين 09:00 و18:00، أو عبر البريد الإلكتروني association.amare.agadir@gmail.com، وسنعاود الاتصال بكم في أقرب وقت ممكن.',
        },
        {
          question: 'هل يمكنني التطوع؟',
          answer:
            'بالتأكيد! نرحب دائمًا بالمتطوعين الجدد. يمكنكم التسجيل عبر نموذج الانخراط أو التواصل معنا مباشرة، وسيتواصل معكم فريق التطوع لتحديد الأنشطة والمجالات التي تناسب مهاراتكم واهتماماتكم.',
        },
        {
          question: 'كيف أقدم اقتراحاً؟',
          answer:
            'يمكنكم إرسال اقتراحاتكم عبر نموذج التواصل في هذه الصفحة مع تحديد الموضوع "اقتراح"، أو عبر البريد الإلكتروني مباشرة. نعتمد على أفكاركم وملاحظاتكم لتطوير برامجنا وتحسين خدماتنا.',
        },
      ],
    },
  },

  // =====================================================================
  // 6. FINAL CTA  (#contactCta)
  // =====================================================================
  {
    id: 'sec-contact-cta',
    type: 'custom',
    enabled: true,
    order: 6,
    data: {
      _renderer: 'contactCta',
      heading: 'نحن هنا للإجابة عن جميع استفساراتكم',
      description: 'انضموا إلى عائلة الجمعية وساهموا معنا في صنع أثر حقيقي في المجتمع.',
      button: { label: 'انضم إلينا', url: 'Join us/join-us-online.html' },
    },
  },
]
