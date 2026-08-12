/**
 * اتصل بنا (CONTACT) page content — bilingual _ar/_fr format
 *
 * Mirrors the SQL migration 00032_contact_bilingual.sql.
 * Every section supports Arabic and French via paired fields.
 * Non-translatable fields (url, id, mapUrl, variant) remain shared.
 */

import type { PageSection } from '@/types/content'

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
      heading_ar: 'يسعدنا التواصل معكم',
      heading_fr: 'Nous serions ravis de vous entendre',
      subheading_ar: 'تواصل معنا',
      subheading_fr: 'Contactez-nous',
      description_ar:
        'إذا كانت لديكم أي استفسارات أو اقتراحات أو ترغبون في الانضمام إلى الجمعية، لا تترددوا في التواصل معنا.',
      description_fr:
        "Si vous avez des questions, des suggestions ou souhaitez rejoindre l'association, n'hésitez pas à nous contacter.",
      backgroundImage: '',
      buttons: [
        { id: 'btn-contact-hero-message', label_ar: 'أرسل رسالة', label_fr: 'Envoyer un message', url: '#contactFormSection', variant: 'primary' },
        { id: 'btn-contact-hero-faq', label_ar: 'الأسئلة الشائعة', label_fr: 'Questions fréquentes', url: '#contactFaq', variant: 'secondary' },
      ],
    },
  },

  // =====================================================================
  // 2. CONTACT CARDS  (#contactCards)
  // =====================================================================
  {
    id: 'sec-contact-cards',
    type: 'custom',
    enabled: true,
    order: 2,
    data: {
      _renderer: 'contactCards',
      eyebrow_ar: 'معلومات سريعة',
      eyebrow_fr: 'Informations rapides',
      heading_ar: 'قنوات التواصل',
      heading_fr: 'Canaux de contact',
      description_ar: 'اختر الطريقة الأنسب للتواصل مع فريق الجمعية وسنرد عليكم في أقرب وقت ممكن.',
      description_fr:
        "Choisissez le moyen le plus adapté pour contacter l'équipe de l'association et nous vous répondrons dans les plus brefs délais.",
      items: [
        { id: 'address', title_ar: 'العنوان', title_fr: 'Adresse', value_ar: 'المغرب', value_fr: 'Maroc', detail_ar: 'أيت ملول، أكادير', detail_fr: 'Aït Melloul, Agadir' },
        { id: 'phone', title_ar: 'الهاتف', title_fr: 'Téléphone', value_ar: '+212 684 869 996', value_fr: '+212 684 869 996', detail_ar: '', detail_fr: '' },
        { id: 'email', title_ar: 'البريد الإلكتروني', title_fr: 'E-mail', value_ar: 'association.amare.agadir@gmail.com', value_fr: 'association.amare.agadir@gmail.com', detail_ar: '', detail_fr: '' },
        { id: 'hours', title_ar: 'ساعات العمل', title_fr: 'Heures de travail', value_ar: 'الإثنين - الجمعة', value_fr: 'Lundi - Vendredi', detail_ar: '09:00 - 18:00', detail_fr: '09:00 - 18:00' },
      ],
    },
  },

  // =====================================================================
  // 3. CONTACT FORM + INFO CARD  (#contactFormSection)
  // =====================================================================
  {
    id: 'sec-contact-form',
    type: 'custom',
    enabled: true,
    order: 3,
    data: {
      _renderer: 'contactForm',
      eyebrow_ar: 'أرسل لنا رسالة',
      eyebrow_fr: 'Envoyez-nous un message',
      heading_ar: 'نحن هنا من أجلكم',
      heading_fr: 'Nous sommes là pour vous',
      description_ar: 'املأ النموذج التالي وسيتواصل معكم فريقنا في أقرب وقت.',
      description_fr:
        'Remplissez le formulaire suivant et notre équipe vous contactera dans les plus brefs délais.',
      infoTitle_ar: 'معلومات التواصل',
      infoTitle_fr: 'Informations de contact',
      infoDescription_ar:
        'فريقنا جاهز للرد على استفساراتكم من الإثنين إلى الجمعة. لا تترددوا في التواصل معنا عبر أي وسيلة تناسبكم.',
      infoDescription_fr:
        "Notre équipe est prête à répondre à vos questions du lundi au vendredi. N'hésitez pas à nous contacter par le moyen qui vous convient.",
      socialTitle_ar: 'تابعونا على',
      socialTitle_fr: 'Suivez-nous sur',
      social: [
        { id: 'fb', label_ar: 'فيسبوك', label_fr: 'Facebook', url: '#' },
        { id: 'ig', label_ar: 'إنستغرام', label_fr: 'Instagram', url: '#' },
        { id: 'in', label_ar: 'لينكدإن', label_fr: 'LinkedIn', url: '#' },
        { id: 'yt', label_ar: 'يوتيوب', label_fr: 'YouTube', url: '#' },
      ],
      formTitle_ar: 'أرسل لنا رسالة',
      formTitle_fr: 'Envoyez-nous un message',
      formDescription_ar: 'جميع الحقول إلزامية. سيتم الرد على رسالتك في أقرب وقت ممكن.',
      formDescription_fr:
        'Tous les champs sont obligatoires. Vous recevrez une réponse dans les plus brefs délais.',
      fields: [
        { id: 'name', label_ar: 'الاسم الكامل', label_fr: 'Nom complet', placeholder_ar: 'أدخل اسمك الكامل', placeholder_fr: 'Entrez votre nom complet' },
        { id: 'email', label_ar: 'البريد الإلكتروني', label_fr: 'E-mail', placeholder_ar: 'example@email.com', placeholder_fr: 'exemple@email.com' },
        { id: 'phone', label_ar: 'رقم الهاتف', label_fr: 'Téléphone', placeholder_ar: '+212 6XX XX XX XX', placeholder_fr: '+212 6XX XX XX XX' },
        { id: 'subject', label_ar: 'الموضوع', label_fr: 'Sujet', placeholder_ar: 'اختر موضوع الرسالة', placeholder_fr: 'Choisissez le sujet du message' },
        { id: 'message', label_ar: 'الرسالة', label_fr: 'Message', placeholder_ar: 'اكتب رسالتك هنا...', placeholder_fr: 'Écrivez votre message ici...' },
      ],
      subjects_ar: ['استفسار', 'انضمام إلى الجمعية', 'اقتراح', 'تطوع', 'أخرى'],
      subjects_fr: ["Demande d'information", "Adhésion à l'association", 'Suggestion', 'Bénévolat', 'Autre'],
      submitLabel_ar: 'إرسال الرسالة',
      submitLabel_fr: 'Envoyer le message',
    },
  },

  // =====================================================================
  // 4. MAP  (#contactMap)
  // =====================================================================
  {
    id: 'sec-contact-map',
    type: 'custom',
    enabled: true,
    order: 4,
    data: {
      _renderer: 'contactMap',
      eyebrow_ar: 'العثور علينا',
      eyebrow_fr: 'Nous trouver',
      heading_ar: 'موقعنا',
      heading_fr: 'Notre emplacement',
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
      eyebrow_ar: 'الأسئلة الشائعة',
      eyebrow_fr: 'Questions fréquentes',
      heading_ar: 'لديكم أسئلة؟ لدينا إجابات',
      heading_fr: 'Vous avez des questions ? Nous avons des réponses',
      description_ar: 'جمعنا لكم الإجابات عن أكثر الأسئلة تكرارًا حول الجمعية وطرق التواصل.',
      description_fr:
        "Nous avons rassemblé pour vous les réponses aux questions les plus fréquentes sur l'association et les moyens de contact.",
      items: [
        {
          question_ar: 'كيف يمكنني الانضمام للجمعية؟',
          question_fr: "Comment puis-je adhérer à l'association ?",
          answer_ar: 'يمكنكم الانضمام إلى الجمعية عبر ملء استمارة الانخراط المتوفرة على صفحة "انخرط معنا"، أو بزيارة مقر الجمعية مباشرة، أو بمراسلتنا عبر البريد الإلكتروني. تُدرَس جميع الطلبات خلال أسبوع واحد من التوصل بها.',
          answer_fr: "Vous pouvez adhérer à l'association en remplissant le formulaire d'adhésion disponible sur la page \"Rejoignez-nous\", en visitant le siège de l'association, ou en nous contactant par e-mail. Toutes les demandes sont examinées dans un délai d'une semaine.",
        },
        {
          question_ar: 'كيف أتواصل مع الإدارة؟',
          question_fr: "Comment contacter l'administration ?",
          answer_ar: 'يمكنكم التواصل مع الإدارة عبر الهاتف +212 684 869 996 من الإثنين إلى الجمعة بين 09:00 و18:00، أو عبر البريد الإلكتروني association.amare.agadir@gmail.com، وسنعاود الاتصال بكم في أقرب وقت ممكن.',
          answer_fr: 'Vous pouvez contacter l\'administration par téléphone au +212 684 869 996 du lundi au vendredi entre 09:00 et 18:00, ou par e-mail à association.amare.agadir@gmail.com. Nous vous répondrons dans les plus brefs délais.',
        },
        {
          question_ar: 'هل يمكنني التطوع؟',
          question_fr: 'Puis-je devenir bénévole ?',
          answer_ar: 'بالتأكيد! نرحب دائمًا بالمتطوعين الجدد. يمكنكم التسجيل عبر نموذج الانخراط أو التواصل معنا مباشرة، وسيتواصل معكم فريق التطوع لتحديد الأنشطة والمجالات التي تناسب مهاراتكم واهتماماتكم.',
          answer_fr: "Bien sûr ! Nous accueillons toujours de nouveaux bénévoles. Vous pouvez vous inscrire via le formulaire d'adhésion ou nous contacter directement. Notre équipe de bénévolat vous contactera pour déterminer les activités et domaines qui correspondent à vos compétences et intérêts.",
        },
        {
          question_ar: 'كيف أقدم اقتراحاً؟',
          question_fr: 'Comment soumettre une suggestion ?',
          answer_ar: 'يمكنكم إرسال اقتراحاتكم عبر نموذج التواصل في هذه الصفحة مع تحديد الموضوع "اقتراح"، أو عبر البريد الإلكتروني مباشرة. نعتمد على أفكاركم وملاحظاتكم لتطوير برامجنا وتحسين خدماتنا.',
          answer_fr: "Vous pouvez envoyer vos suggestions via le formulaire de contact sur cette page en sélectionnant le sujet \"Suggestion\", ou directement par e-mail. Nous comptons sur vos idées et remarques pour développer nos programmes et améliorer nos services.",
        },
      ],
    },
  },

  // =====================================================================
  // 6. CTA BANNER  (#contactCta)
  // =====================================================================
  {
    id: 'sec-contact-cta',
    type: 'custom',
    enabled: true,
    order: 6,
    data: {
      _renderer: 'contactCta',
      heading_ar: 'نحن هنا للإجابة عن جميع استفساراتكم',
      heading_fr: 'Nous sommes là pour répondre à toutes vos questions',
      description_ar: 'انضموا إلى عائلة الجمعية وساهموا معنا في صنع أثر حقيقي في المجتمع.',
      description_fr: "Rejoignez la famille de l'association et contribuez avec nous à avoir un impact réel dans la communauté.",
      button: { label_ar: 'انضم إلينا', label_fr: 'Rejoignez-nous', url: 'Join us/join-us-online.html' },
    },
  },
]
