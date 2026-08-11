/**
 * شركاؤنا — Reusable bilingual partner page CMS template.
 * _ar/_fr format matching the Central Office pattern.
 */

import type { PageSection } from '@/types/content'

export interface PartnerContent {
  name_ar: string; name_fr: string
  badge_ar: string; badge_fr: string
  subtitle_ar: string; subtitle_fr: string
  websiteUrl: string
  aboutEyebrow_ar: string; aboutEyebrow_fr: string
  aboutHeading_ar: string; aboutHeading_fr: string
  aboutParagraphs_ar: string[]; aboutParagraphs_fr: string[]
  aboutImage: string
  servicesEyebrow_ar: string; servicesEyebrow_fr: string
  servicesHeading_ar: string; servicesHeading_fr: string
  servicesDescription_ar: string; servicesDescription_fr: string
  services: { title_ar: string; title_fr: string; description_ar: string; description_fr: string }[]
  whyEyebrow_ar: string; whyEyebrow_fr: string
  whyHeading_ar: string; whyHeading_fr: string
  whyDescription_ar: string; whyDescription_fr: string
  whyCards: { title_ar: string; title_fr: string; description_ar: string; description_fr: string }[]
  galleryEyebrow_ar: string; galleryEyebrow_fr: string
  galleryHeading_ar: string; galleryHeading_fr: string
  galleryDescription_ar: string; galleryDescription_fr: string
  galleryImages: string[]
  contactHeading_ar: string; contactHeading_fr: string
  contactDescription_ar: string; contactDescription_fr: string
  email: string; phone: string; website: string; address: string
  formHeading_ar: string; formHeading_fr: string
  formDescription_ar: string; formDescription_fr: string
  ctaHeading_ar: string; ctaHeading_fr: string
  ctaButtons: { label_ar: string; label_fr: string; url: string }[]
}

function buildPartnerSections(p: PartnerContent, order: number): PageSection[] {
  return [
    {
      id: crypto.randomUUID(), type: 'hero', enabled: true, order,
      data: {
        heading_ar: p.name_ar, heading_fr: p.name_fr,
        subheading_ar: p.badge_ar, subheading_fr: p.badge_fr,
        description_ar: p.subtitle_ar, description_fr: p.subtitle_fr,
        backgroundImage: '',
        buttons: [
          { id: 'btn-pr-website', label_ar: p.ctaButtons[0]?.label_ar || 'زيارة الموقع الإلكتروني', label_fr: p.ctaButtons[0]?.label_fr || 'Visiter le site web', url: p.websiteUrl, variant: 'primary' },
          { id: 'btn-pr-contact', label_ar: p.ctaButtons[1]?.label_ar || 'تواصل مع الشريك', label_fr: p.ctaButtons[1]?.label_fr || 'Contacter le partenaire', url: '#prForm', variant: 'secondary' },
        ],
      },
    },
    {
      id: crypto.randomUUID(), type: 'custom', enabled: true, order: order + 1,
      data: {
        _renderer: 'partnerAbout',
        eyebrow_ar: p.aboutEyebrow_ar, eyebrow_fr: p.aboutEyebrow_fr,
        heading_ar: p.aboutHeading_ar, heading_fr: p.aboutHeading_fr,
        paragraphs_ar: p.aboutParagraphs_ar, paragraphs_fr: p.aboutParagraphs_fr,
        image: p.aboutImage,
      },
    },
    {
      id: crypto.randomUUID(), type: 'custom', enabled: true, order: order + 2,
      data: {
        _renderer: 'partnerServices',
        eyebrow_ar: p.servicesEyebrow_ar, eyebrow_fr: p.servicesEyebrow_fr,
        heading_ar: p.servicesHeading_ar, heading_fr: p.servicesHeading_fr,
        description_ar: p.servicesDescription_ar, description_fr: p.servicesDescription_fr,
        cards: p.services,
      },
    },
    {
      id: crypto.randomUUID(), type: 'custom', enabled: true, order: order + 3,
      data: {
        _renderer: 'partnerWhy',
        eyebrow_ar: p.whyEyebrow_ar, eyebrow_fr: p.whyEyebrow_fr,
        heading_ar: p.whyHeading_ar, heading_fr: p.whyHeading_fr,
        description_ar: p.whyDescription_ar, description_fr: p.whyDescription_fr,
        cards: p.whyCards,
      },
    },
    {
      id: crypto.randomUUID(), type: 'custom', enabled: true, order: order + 4,
      data: {
        _renderer: 'partnerGallery',
        eyebrow_ar: p.galleryEyebrow_ar, eyebrow_fr: p.galleryEyebrow_fr,
        heading_ar: p.galleryHeading_ar, heading_fr: p.galleryHeading_fr,
        description_ar: p.galleryDescription_ar, description_fr: p.galleryDescription_fr,
        images: p.galleryImages.map((url, i) => ({ id: `gimg-${i}`, url, alt: '' })),
      },
    },
    {
      id: crypto.randomUUID(), type: 'custom', enabled: true, order: order + 5,
      data: {
        _renderer: 'partnerContact',
        heading_ar: p.contactHeading_ar, heading_fr: p.contactHeading_fr,
        description_ar: p.contactDescription_ar, description_fr: p.contactDescription_fr,
        email: p.email, phone: p.phone, website: p.website, address: p.address,
      },
    },
    {
      id: crypto.randomUUID(), type: 'custom', enabled: true, order: order + 6,
      data: {
        _renderer: 'partnerForm',
        heading_ar: p.formHeading_ar, heading_fr: p.formHeading_fr,
        description_ar: p.formDescription_ar, description_fr: p.formDescription_fr,
      },
    },
    {
      id: crypto.randomUUID(), type: 'custom', enabled: true, order: order + 7,
      data: {
        _renderer: 'partnerCta',
        heading_ar: p.ctaHeading_ar, heading_fr: p.ctaHeading_fr,
        description: '',
        buttons: p.ctaButtons.map((b, i) => ({
          id: `btn-pr-cta-${i}`,
          label_ar: b.label_ar, label_fr: b.label_fr,
          url: b.url,
          variant: i === 0 ? 'primary' : 'secondary',
        })),
      },
    },
  ]
}

const SHARED_SERVICES = [
  { title_ar: 'التنقيب المعدني', title_fr: 'Prospection minière', description_ar: 'دراسات جيولوجية متقدمة للتنقيب عن المعادن والثروات الطبيعية في مختلف مناطق المغرب.', description_fr: "Études géologiques avancées pour la prospection des minéraux et des ressources naturelles dans les différentes régions du Maroc." },
  { title_ar: 'الدراسات الجيولوجية', title_fr: 'Études géologiques', description_ar: 'تحليل وتوثيق التكوينات الجيولوجية وتقديم استشارات متخصصة للمشاريع الاستكشافية.', description_fr: "Analyse et documentation des formations géologiques et conseil spécialisé pour les projets d'exploration." },
  { title_ar: 'رسم الخرائط', title_fr: 'Cartographie', description_ar: 'تصميم وإنتاج خرائط جيولوجية وطبوغرافية دقيقة باستخدام أحدث التقنيات الرقمية.', description_fr: 'Conception et production de cartes géologiques et topographiques précises utilisant les dernières technologies numériques.' },
  { title_ar: 'التحاليل المخبرية', title_fr: 'Analyses en laboratoire', description_ar: 'تحاليل متطورة للعينات المعدنية والصخرية باستخدام أحدث الأجهزة والتقنيات المخبرية.', description_fr: "Analyses avancées d'échantillons minéraux et rocheux utilisant les derniers équipements et techniques de laboratoire." },
]

const SHARED_WHY = [
  { title_ar: 'خبرة مهنية', title_fr: 'Expertise professionnelle', description_ar: 'نمتلك خبرة تمتد لسنوات في مجال التنقيب والاستكشاف المعدني بالمغرب.', description_fr: "Nous possédons une expérience de plusieurs années dans le domaine de la prospection et de l'exploration minière au Maroc." },
  { title_ar: 'شريك موثوق', title_fr: 'Partenaire fiable', description_ar: 'نلتزم بأعلى معايير الجودة والمهنية في جميع مشاريعنا وخدماتنا.', description_fr: 'Nous respectons les plus hauts standards de qualité et de professionnalisme dans tous nos projets et services.' },
  { title_ar: 'خدمات عالية الجودة', title_fr: 'Services de haute qualité', description_ar: 'نقدم خدمات متكاملة تلبي احتياجات شركائنا بأعلى مستوى من الدقة والكفاءة.', description_fr: "Nous offrons des services complets répondant aux besoins de nos partenaires avec le plus haut niveau de précision et d'efficacité." },
  { title_ar: 'تعاون وطني ودولي', title_fr: 'Coopération nationale et internationale', description_ar: 'نعمل في إطار تعاون وطني ودولي لتعزيز البحث والاستكشاف المعدني.', description_fr: "Nous travaillons dans le cadre d'une coopération nationale et internationale pour promouvoir la recherche et l'exploration minière." },
]

export const LE_FOUILLEURMA: PartnerContent = {
  name_ar: 'LeFouilleurma', name_fr: 'LeFouilleurma',
  badge_ar: 'شريك وطني', badge_fr: 'Partenaire national',
  subtitle_ar: 'شريك وطني للجمعية المغربية لهواة البحث والاستكشاف، متخصص في بيع وشراء أجهزة الكشف عن المعادن والكنوز على المستوى الوطني.',
  subtitle_fr: "Partenaire national de l'Association Marocaine des Amateurs de Recherche et d'Exploration, spécialisé dans la vente et l'achat de détecteurs de métaux et de trésors au niveau national.",
  websiteUrl: 'https://www.lefouilleurma.ma',
  aboutEyebrow_ar: 'عن LeFouilleurma', aboutEyebrow_fr: 'À propos de LeFouilleurma',
  aboutHeading_ar: 'شريككم الموثوق في مجال التنقيب والاستكشاف', aboutHeading_fr: 'Votre partenaire de confiance en prospection et exploration',
  aboutParagraphs_ar: [
    'LeFouilleurma هي شركة مغربية متخصصة في بيع وشراء أجهزة الكشف عن المعادن والكنوز. تقدم الشركة مجموعة واسعة من الأجهزة المتطورة لتلبية احتياجات الهواة والمحترفين على حد سواء.',
    'نعمل مع الجمعية المغربية لهواة البحث والاستكشاف في إطار شراكة وطنية تهدف إلى توفير أحدث أجهزة الكشف والتنقيب لأعضاء الجمعية بأسعار تفضيلية.',
  ],
  aboutParagraphs_fr: [
    "LeFouilleurma est une entreprise marocaine spécialisée dans la vente et l'achat de détecteurs de métaux et de trésors. L'entreprise propose une large gamme d'appareils avancés pour répondre aux besoins des amateurs et des professionnels.",
    "Nous travaillons avec l'Association Marocaine des Amateurs de Recherche et d'Exploration dans le cadre d'un partenariat national visant à fournir les derniers équipements de détection et de prospection aux membres de l'association à des prix préférentiels.",
  ],
  aboutImage: '',
  servicesEyebrow_ar: 'خدماتنا', servicesEyebrow_fr: 'Nos services',
  servicesHeading_ar: 'ماذا نقدم؟', servicesHeading_fr: 'Que proposons-nous ?',
  servicesDescription_ar: 'نقدم مجموعة متكاملة من الخدمات المتخصصة في مجال التنقيب والاستكشاف.',
  servicesDescription_fr: 'Nous offrons une gamme complète de services spécialisés en prospection et exploration.',
  services: SHARED_SERVICES,
  whyEyebrow_ar: 'لماذا الشراكة معنا؟', whyEyebrow_fr: 'Pourquoi un partenariat avec nous ?',
  whyHeading_ar: 'مميزات شراكتنا', whyHeading_fr: 'Les avantages de notre partenariat',
  whyDescription_ar: 'نعمل جنبًا إلى جنب مع شركائنا لتحقيق النجاح المشترك.',
  whyDescription_fr: 'Nous travaillons main dans la main avec nos partenaires pour atteindre le succès commun.',
  whyCards: SHARED_WHY,
  galleryEyebrow_ar: 'معرض الصور', galleryEyebrow_fr: 'Galerie photos',
  galleryHeading_ar: 'صور من أعمالنا', galleryHeading_fr: 'Photos de nos travaux',
  galleryDescription_ar: 'جانب من أنشطتنا ومشاريعنا المشتركة.',
  galleryDescription_fr: 'Un aperçu de nos activités et projets communs.',
  galleryImages: ['', '', '', '', '', ''],
  contactHeading_ar: 'تواصل معنا', contactHeading_fr: 'Contactez-nous',
  contactDescription_ar: 'نحن هنا للإجابة على استفساراتكم.', contactDescription_fr: 'Nous sommes là pour répondre à vos questions.',
  email: 'contact@lefouilleurma.ma', phone: '+212 666 000 000', website: 'www.lefouilleurma.ma', address: 'شارع الزرقطوني، أكادير، المغرب',
  formHeading_ar: 'تواصل مع LeFouilleurma', formHeading_fr: 'Contacter LeFouilleurma',
  formDescription_ar: 'أرسل لنا استفسارك وسنرد عليك في أقرب وقت.',
  formDescription_fr: 'Envoyez-nous votre demande et nous vous répondrons dans les plus brefs délais.',
  ctaHeading_ar: 'هل أنت مهتم بالعمل مع هذا الشريك؟', ctaHeading_fr: 'Intéressé par un partenariat ?',
  ctaButtons: [
    { label_ar: 'زيارة الموقع الإلكتروني', label_fr: 'Visiter le site web', url: 'https://www.lefouilleurma.ma' },
    { label_ar: 'تواصل مع الشريك', label_fr: 'Contacter le partenaire', url: '#prForm' },
  ],
}

export const SENOTEC: PartnerContent = {
  name_ar: 'SENOTEC', name_fr: 'SENOTEC',
  badge_ar: 'شريك دولي', badge_fr: 'Partenaire international',
  subtitle_ar: 'شريك دولي للجمعية المغربية لهواة البحث والاستكشاف، متخصص في الحلول التقنية والأمنية المتطورة على المستوى الدولي.',
  subtitle_fr: "Partenaire international de l'Association Marocaine des Amateurs de Recherche et d'Exploration, spécialisé dans les solutions techniques et de sécurité avancées au niveau international.",
  websiteUrl: 'https://www.senotec.com',
  aboutEyebrow_ar: 'عن SENOTEC', aboutEyebrow_fr: 'À propos de SENOTEC',
  aboutHeading_ar: 'شريككم الموثوق في مجال التنقيب والاستكشاف', aboutHeading_fr: 'Votre partenaire de confiance en prospection et exploration',
  aboutParagraphs_ar: [
    'SENOTEC هي شركة دولية متخصصة في تقديم الحلول التقنية والأمنية المتطورة. تمتلك الشركة خبرة واسعة في مجال أنظمة المراقبة والحماية الإلكترونية للمؤسسات والمنشآت.',
    'نعمل مع الجمعية المغربية لهواة البحث والاستكشاف في إطار شراكة دولية تهدف إلى تعزيز الأمن والسلامة في الأنشطة الميدانية والاستكشافية.',
  ],
  aboutParagraphs_fr: [
    "SENOTEC est une entreprise internationale spécialisée dans les solutions techniques et de sécurité avancées. L'entreprise possède une vaste expérience dans les systèmes de surveillance et de protection électronique pour les institutions et les installations.",
    "Nous travaillons avec l'Association Marocaine des Amateurs de Recherche et d'Exploration dans le cadre d'un partenariat international visant à renforcer la sécurité dans les activités de terrain et d'exploration.",
  ],
  aboutImage: '',
  servicesEyebrow_ar: 'خدماتنا', servicesEyebrow_fr: 'Nos services',
  servicesHeading_ar: 'ماذا نقدم؟', servicesHeading_fr: 'Que proposons-nous ?',
  servicesDescription_ar: 'نقدم مجموعة متكاملة من الخدمات المتخصصة في مجال التنقيب والاستكشاف.',
  servicesDescription_fr: 'Nous offrons une gamme complète de services spécialisés en prospection et exploration.',
  services: SHARED_SERVICES,
  whyEyebrow_ar: 'لماذا الشراكة معنا؟', whyEyebrow_fr: 'Pourquoi un partenariat avec nous ?',
  whyHeading_ar: 'مميزات شراكتنا', whyHeading_fr: 'Les avantages de notre partenariat',
  whyDescription_ar: 'نعمل جنبًا إلى جنب مع شركائنا لتحقيق النجاح المشترك.',
  whyDescription_fr: 'Nous travaillons main dans la main avec nos partenaires pour atteindre le succès commun.',
  whyCards: SHARED_WHY,
  galleryEyebrow_ar: 'معرض الصور', galleryEyebrow_fr: 'Galerie photos',
  galleryHeading_ar: 'صور من أعمالنا', galleryHeading_fr: 'Photos de nos travaux',
  galleryDescription_ar: 'جانب من أنشطتنا ومشاريعنا المشتركة.',
  galleryDescription_fr: 'Un aperçu de nos activités et projets communs.',
  galleryImages: ['', '', '', '', '', ''],
  contactHeading_ar: 'تواصل معنا', contactHeading_fr: 'Contactez-nous',
  contactDescription_ar: 'نحن هنا للإجابة على استفساراتكم.', contactDescription_fr: 'Nous sommes là pour répondre à vos questions.',
  email: 'contact@senotec.com', phone: '+212 522 000 000', website: 'www.senotec.com', address: 'شارع الحسن الثاني، الرباط، المغرب',
  formHeading_ar: 'تواصل مع SENOTEC', formHeading_fr: 'Contacter SENOTEC',
  formDescription_ar: 'أرسل لنا استفسارك وسنرد عليك في أقرب وقت.',
  formDescription_fr: 'Envoyez-nous votre demande et nous vous répondrons dans les plus brefs délais.',
  ctaHeading_ar: 'هل أنت مهتم بالعمل مع هذا الشريك؟', ctaHeading_fr: 'Intéressé par un partenariat ?',
  ctaButtons: [
    { label_ar: 'زيارة الموقع الإلكتروني', label_fr: 'Visiter le site web', url: 'https://www.senotec.com' },
    { label_ar: 'تواصل مع الشريك', label_fr: 'Contacter le partenaire', url: '#prForm' },
  ],
}

export const ASTROMET: PartnerContent = {
  name_ar: 'ASTROMET', name_fr: 'ASTROMET',
  badge_ar: 'شريك استراتيجي', badge_fr: 'Partenaire stratégique',
  subtitle_ar: 'شريك استراتيجي للجمعية المغربية لهواة البحث والاستكشاف، متخصص في مجال التنقيب والاستكشاف المعدني بالمغرب.',
  subtitle_fr: "Partenaire stratégique de l'Association Marocaine des Amateurs de Recherche et d'Exploration, spécialisé dans la prospection et l'exploration minière au Maroc.",
  websiteUrl: 'https://www.astromet.ma',
  aboutEyebrow_ar: 'عن ASTROMET', aboutEyebrow_fr: "À propos d'ASTROMET",
  aboutHeading_ar: 'شريككم الموثوق في مجال التنقيب والاستكشاف', aboutHeading_fr: 'Votre partenaire de confiance en prospection et exploration',
  aboutParagraphs_ar: [
    'ASTROMET هي شركة مغربية رائدة في مجال التنقيب والاستكشاف المعدني. تقوم الشركة على خبرة واسعة تمتد لسنوات عديدة في مجال الدراسات الجيولوجية والتنقيب عن المعادن.',
    'نعمل مع الجمعية المغربية لهواة البحث والاستكشاف في إطار شراكة استراتيجية تهدف إلى تعزيز التعاون العلمي والتقني في مجالات الاستكشاف والبحث الميداني.',
  ],
  aboutParagraphs_fr: [
    "ASTROMET est une entreprise marocaine leader dans le domaine de la prospection et de l'exploration minière. L'entreprise s'appuie sur une vaste expérience de nombreuses années dans les études géologiques et la prospection minière.",
    "Nous travaillons avec l'Association Marocaine des Amateurs de Recherche et d'Exploration dans le cadre d'un partenariat stratégique visant à renforcer la coopération scientifique et technique dans les domaines de l'exploration et de la recherche sur le terrain.",
  ],
  aboutImage: '',
  servicesEyebrow_ar: 'خدماتنا', servicesEyebrow_fr: 'Nos services',
  servicesHeading_ar: 'ماذا نقدم؟', servicesHeading_fr: 'Que proposons-nous ?',
  servicesDescription_ar: 'نقدم مجموعة متكاملة من الخدمات المتخصصة في مجال التنقيب والاستكشاف.',
  servicesDescription_fr: 'Nous offrons une gamme complète de services spécialisés en prospection et exploration.',
  services: SHARED_SERVICES,
  whyEyebrow_ar: 'لماذا الشراكة معنا؟', whyEyebrow_fr: 'Pourquoi un partenariat avec nous ?',
  whyHeading_ar: 'مميزات شراكتنا', whyHeading_fr: 'Les avantages de notre partenariat',
  whyDescription_ar: 'نعمل جنبًا إلى جنب مع شركائنا لتحقيق النجاح المشترك.',
  whyDescription_fr: 'Nous travaillons main dans la main avec nos partenaires pour atteindre le succès commun.',
  whyCards: SHARED_WHY,
  galleryEyebrow_ar: 'معرض الصور', galleryEyebrow_fr: 'Galerie photos',
  galleryHeading_ar: 'صور من أعمالنا', galleryHeading_fr: 'Photos de nos travaux',
  galleryDescription_ar: 'جانب من أنشطتنا ومشاريعنا المشتركة.',
  galleryDescription_fr: 'Un aperçu de nos activités et projets communs.',
  galleryImages: ['', '', '', '', '', ''],
  contactHeading_ar: 'تواصل معنا', contactHeading_fr: 'Contactez-nous',
  contactDescription_ar: 'نحن هنا للإجابة على استفساراتكم.', contactDescription_fr: 'Nous sommes là pour répondre à vos questions.',
  email: 'contact@astromet.ma', phone: '+212 500 000 000', website: 'www.astromet.ma', address: 'شارع محمد الخامس، الدار البيضاء، المغرب',
  formHeading_ar: 'تواصل مع ASTROMET', formHeading_fr: 'Contacter ASTROMET',
  formDescription_ar: 'أرسل لنا استفسارك وسنرد عليك في أقرب وقت.',
  formDescription_fr: 'Envoyez-nous votre demande et nous vous répondrons dans les plus brefs délais.',
  ctaHeading_ar: 'هل أنت مهتم بالعمل مع هذا الشريك؟', ctaHeading_fr: 'Intéressé par un partenariat ?',
  ctaButtons: [
    { label_ar: 'زيارة الموقع الإلكتروني', label_fr: 'Visiter le site web', url: 'https://www.astromet.ma' },
    { label_ar: 'تواصل مع الشريك', label_fr: 'Contacter le partenaire', url: '#prForm' },
  ],
}

export const ASSOCIATION_DETECTION_CENTRE: PartnerContent = {
  name_ar: 'مركز الكشف والاستكشاف', name_fr: "Centre de Détection et d'Exploration",
  badge_ar: 'شريك استراتيجي', badge_fr: 'Partenaire stratégique',
  subtitle_ar: 'شريك استراتيجي للجمعية المغربية لهواة البحث والاستكشاف، مركز متخصص في الكشف والتنقيب والتدريب على استخدام أجهزة الاستكشاف.',
  subtitle_fr: "Partenaire stratégique de l'Association Marocaine des Amateurs de Recherche et d'Exploration, centre spécialisé dans la détection, la prospection et la formation à l'utilisation des équipements d'exploration.",
  websiteUrl: 'https://www.detection-centre.ma',
  aboutEyebrow_ar: 'عن مركز الكشف والاستكشاف', aboutEyebrow_fr: 'À propos du Centre de Détection',
  aboutHeading_ar: 'شريككم الموثوق في مجال التنقيب والاستكشاف', aboutHeading_fr: 'Votre partenaire de confiance',
  aboutParagraphs_ar: [
    'مركز الكشف والاستكشاف هو مؤسسة متخصصة في التدريب والتكوين على استخدام أجهزة الكشف عن المعادن والتنقيب عن الكنوز.',
    'نعمل مع الجمعية المغربية لهواة البحث والاستكشاف في إطار شراكة استراتيجية تهدف إلى تطوير مهارات الأعضاء في مجال الكشف والتنقيب.',
  ],
  aboutParagraphs_fr: [
    "Le Centre de Détection et d'Exploration est une institution spécialisée dans la formation à l'utilisation des détecteurs de métaux et à la prospection.",
    "Nous travaillons avec l'Association Marocaine des Amateurs de Recherche et d'Exploration dans le cadre d'un partenariat stratégique visant à développer les compétences des membres en détection et prospection.",
  ],
  aboutImage: '',
  servicesEyebrow_ar: 'خدماتنا', servicesEyebrow_fr: 'Nos services',
  servicesHeading_ar: 'ماذا نقدم؟', servicesHeading_fr: 'Que proposons-nous ?',
  servicesDescription_ar: 'نقدم مجموعة متكاملة من الخدمات المتخصصة في مجال التنقيب والاستكشاف.',
  servicesDescription_fr: 'Nous offrons une gamme complète de services spécialisés en prospection et exploration.',
  services: SHARED_SERVICES,
  whyEyebrow_ar: 'لماذا الشراكة معنا؟', whyEyebrow_fr: 'Pourquoi un partenariat avec nous ?',
  whyHeading_ar: 'مميزات شراكتنا', whyHeading_fr: 'Les avantages de notre partenariat',
  whyDescription_ar: 'نعمل جنبًا إلى جنب مع شركائنا لتحقيق النجاح المشترك.',
  whyDescription_fr: 'Nous travaillons main dans la main avec nos partenaires pour atteindre le succès commun.',
  whyCards: SHARED_WHY,
  galleryEyebrow_ar: 'معرض الصور', galleryEyebrow_fr: 'Galerie photos',
  galleryHeading_ar: 'صور من أعمالنا', galleryHeading_fr: 'Photos de nos travaux',
  galleryDescription_ar: 'جانب من أنشطتنا ومشاريعنا المشتركة.',
  galleryDescription_fr: 'Un aperçu de nos activités et projets communs.',
  galleryImages: ['', '', '', '', '', ''],
  contactHeading_ar: 'تواصل معنا', contactHeading_fr: 'Contactez-nous',
  contactDescription_ar: 'نحن هنا للإجابة على استفساراتكم.', contactDescription_fr: 'Nous sommes là pour répondre à vos questions.',
  email: 'contact@detection-centre.ma', phone: '+212 539 000 000', website: 'www.detection-centre.ma', address: 'شارع فلسطين، طنجة، المغرب',
  formHeading_ar: 'تواصل مع مركز الكشف', formHeading_fr: 'Contacter le Centre de Détection',
  formDescription_ar: 'أرسل لنا استفسارك وسنرد عليك في أقرب وقت.',
  formDescription_fr: 'Envoyez-nous votre demande et nous vous répondrons dans les plus brefs délais.',
  ctaHeading_ar: 'هل أنت مهتم بالعمل مع هذا الشريك؟', ctaHeading_fr: 'Intéressé par un partenariat ?',
  ctaButtons: [
    { label_ar: 'زيارة الموقع الإلكتروني', label_fr: 'Visiter le site web', url: 'https://www.detection-centre.ma' },
    { label_ar: 'تواصل مع الشريك', label_fr: 'Contacter le partenaire', url: '#prForm' },
  ],
}

export const ANCPP: PartnerContent = {
  name_ar: 'ANCPP', name_fr: 'ANCPP',
  badge_ar: 'شريك وطني', badge_fr: 'Partenaire national',
  subtitle_ar: 'شريك وطني للجمعية المغربية لهواة البحث والاستكشاف، الجمعية الوطنية لمحترفي الصيد البحري بالمغرب.',
  subtitle_fr: "Partenaire national de l'Association Marocaine des Amateurs de Recherche et d'Exploration, la Chambre Nationale des Pêches Maritimes au Maroc.",
  websiteUrl: 'https://www.ancpp.ma',
  aboutEyebrow_ar: 'عن ANCPP', aboutEyebrow_fr: "À propos d'ANCPP",
  aboutHeading_ar: 'شريككم الموثوق في مجال التنقيب والاستكشاف', aboutHeading_fr: 'Votre partenaire de confiance',
  aboutParagraphs_ar: [
    'ANCPP هي الجمعية الوطنية لمحترفي الصيد البحري بالمغرب. تمثل الجمعية مصالح الصيادين المحترفين وتعمل على تطوير قطاع الصيد البحري وحماية الثروة السمكية الوطنية.',
    'نعمل مع الجمعية المغربية لهواة البحث والاستكشاف في إطار شراكة وطنية تهدف إلى تعزيز التعاون في مجال الاستكشاف البحري وحماية البيئة البحرية المغربية.',
  ],
  aboutParagraphs_fr: [
    "ANCPP est la Chambre Nationale des Pêches Maritimes au Maroc. Elle représente les intérêts des pêcheurs professionnels et œuvre pour le développement du secteur de la pêche maritime et la protection des ressources halieutiques nationales.",
    "Nous travaillons avec l'Association Marocaine des Amateurs de Recherche et d'Exploration dans le cadre d'un partenariat national visant à renforcer la coopération dans le domaine de l'exploration marine et la protection de l'environnement marin marocain.",
  ],
  aboutImage: '',
  servicesEyebrow_ar: 'خدماتنا', servicesEyebrow_fr: 'Nos services',
  servicesHeading_ar: 'ماذا نقدم؟', servicesHeading_fr: 'Que proposons-nous ?',
  servicesDescription_ar: 'نقدم مجموعة متكاملة من الخدمات المتخصصة في مجال التنقيب والاستكشاف.',
  servicesDescription_fr: 'Nous offrons une gamme complète de services spécialisés en prospection et exploration.',
  services: SHARED_SERVICES,
  whyEyebrow_ar: 'لماذا الشراكة معنا؟', whyEyebrow_fr: 'Pourquoi un partenariat avec nous ?',
  whyHeading_ar: 'مميزات شراكتنا', whyHeading_fr: 'Les avantages de notre partenariat',
  whyDescription_ar: 'نعمل جنبًا إلى جنب مع شركائنا لتحقيق النجاح المشترك.',
  whyDescription_fr: 'Nous travaillons main dans la main avec nos partenaires pour atteindre le succès commun.',
  whyCards: SHARED_WHY,
  galleryEyebrow_ar: 'معرض الصور', galleryEyebrow_fr: 'Galerie photos',
  galleryHeading_ar: 'صور من أعمالنا', galleryHeading_fr: 'Photos de nos travaux',
  galleryDescription_ar: 'جانب من أنشطتنا ومشاريعنا المشتركة.',
  galleryDescription_fr: 'Un aperçu de nos activités et projets communs.',
  galleryImages: ['', '', '', '', '', ''],
  contactHeading_ar: 'تواصل معنا', contactHeading_fr: 'Contactez-nous',
  contactDescription_ar: 'نحن هنا للإجابة على استفساراتكم.', contactDescription_fr: 'Nous sommes là pour répondre à vos questions.',
  email: 'contact@ancpp.ma', phone: '+212 528 000 000', website: 'www.ancpp.ma', address: 'ميناء أكادير، أكادير، المغرب',
  formHeading_ar: 'تواصل مع ANCPP', formHeading_fr: 'Contacter ANCPP',
  formDescription_ar: 'أرسل لنا استفسارك وسنرد عليك في أقرب وقت.',
  formDescription_fr: 'Envoyez-nous votre demande et nous vous répondrons dans les plus brefs délais.',
  ctaHeading_ar: 'هل أنت مهتم بالعمل مع هذا الشريك؟', ctaHeading_fr: 'Intéressé par un partenariat ?',
  ctaButtons: [
    { label_ar: 'زيارة الموقع الإلكتروني', label_fr: 'Visiter le site web', url: 'https://www.ancpp.ma' },
    { label_ar: 'تواصل مع الشريك', label_fr: 'Contacter le partenaire', url: '#prForm' },
  ],
}

export const OMSDS: PartnerContent = {
  name_ar: 'OMSDS', name_fr: 'OMSDS',
  badge_ar: 'شريك رئيسي', badge_fr: 'Partenaire principal',
  subtitle_ar: 'شريك رئيسي للجمعية المغربية لهواة البحث والاستكشاف، منظمة مغربية للتنمية الاجتماعية والتضامن تعمل على دعم المبادرات المجتمعية.',
  subtitle_fr: "Partenaire principal de l'Association Marocaine des Amateurs de Recherche et d'Exploration, organisation marocaine pour le développement social et la solidarité œuvrant pour le soutien des initiatives communautaires.",
  websiteUrl: 'https://www.omsds.org',
  aboutEyebrow_ar: 'عن OMSDS', aboutEyebrow_fr: "À propos d'OMSDS",
  aboutHeading_ar: 'شريككم الموثوق في مجال التنقيب والاستكشاف', aboutHeading_fr: 'Votre partenaire de confiance',
  aboutParagraphs_ar: [
    'OMSDS هي منظمة مغربية للتنمية الاجتماعية والتضامن، تعمل على دعم وتمكين المجتمع المدني من خلال برامج تنموية واجتماعية متنوعة تستهدف الفئات المحتاجة.',
    'نعمل مع الجمعية المغربية لهواة البحث والاستكشاف في إطار شراكة مجتمعية تهدف إلى دعم الأنشطة الاجتماعية والتطوعية وتعزيز قيم التضامن والتكافل.',
  ],
  aboutParagraphs_fr: [
    "OMSDS est une organisation marocaine pour le développement social et la solidarité, œuvrant pour le soutien et l'autonomisation de la société civile à travers divers programmes de développement et sociaux ciblant les groupes défavorisés.",
    "Nous travaillons avec l'Association Marocaine des Amateurs de Recherche et d'Exploration dans le cadre d'un partenariat communautaire visant à soutenir les activités sociales et bénévoles et à promouvoir les valeurs de solidarité.",
  ],
  aboutImage: '',
  servicesEyebrow_ar: 'خدماتنا', servicesEyebrow_fr: 'Nos services',
  servicesHeading_ar: 'ماذا نقدم؟', servicesHeading_fr: 'Que proposons-nous ?',
  servicesDescription_ar: 'نقدم مجموعة متكاملة من الخدمات المتخصصة في مجال التنقيب والاستكشاف.',
  servicesDescription_fr: 'Nous offrons une gamme complète de services spécialisés en prospection et exploration.',
  services: SHARED_SERVICES,
  whyEyebrow_ar: 'لماذا الشراكة معنا؟', whyEyebrow_fr: 'Pourquoi un partenariat avec nous ?',
  whyHeading_ar: 'مميزات شراكتنا', whyHeading_fr: 'Les avantages de notre partenariat',
  whyDescription_ar: 'نعمل جنبًا إلى جنب مع شركائنا لتحقيق النجاح المشترك.',
  whyDescription_fr: 'Nous travaillons main dans la main avec nos partenaires pour atteindre le succès commun.',
  whyCards: SHARED_WHY,
  galleryEyebrow_ar: 'معرض الصور', galleryEyebrow_fr: 'Galerie photos',
  galleryHeading_ar: 'صور من أعمالنا', galleryHeading_fr: 'Photos de nos travaux',
  galleryDescription_ar: 'جانب من أنشطتنا ومشاريعنا المشتركة.',
  galleryDescription_fr: 'Un aperçu de nos activités et projets communs.',
  galleryImages: ['', '', '', '', '', ''],
  contactHeading_ar: 'تواصل معنا', contactHeading_fr: 'Contactez-nous',
  contactDescription_ar: 'نحن هنا للإجابة على استفساراتكم.', contactDescription_fr: 'Nous sommes là pour répondre à vos questions.',
  email: 'contact@omsds.org', phone: '+212 537 000 000', website: 'www.omsds.org', address: 'شارع محمد السادس، مراكش، المغرب',
  formHeading_ar: 'تواصل مع OMSDS', formHeading_fr: 'Contacter OMSDS',
  formDescription_ar: 'أرسل لنا استفسارك وسنرد عليك في أقرب وقت.',
  formDescription_fr: 'Envoyez-nous votre demande et nous vous répondrons dans les plus brefs délais.',
  ctaHeading_ar: 'هل أنت مهتم بالعمل مع هذا الشريك؟', ctaHeading_fr: 'Intéressé par un partenariat ?',
  ctaButtons: [
    { label_ar: 'زيارة الموقع الإلكتروني', label_fr: 'Visiter le site web', url: 'https://www.omsds.org' },
    { label_ar: 'تواصل مع الشريك', label_fr: 'Contacter le partenaire', url: '#prForm' },
  ],
}

const PARTNER_SLUGS: Record<string, string> = {
  'LeFouilleurma': '/partners/lefouilleurma',
  'SENOTEC': '/partners/senotec',
  'ASTROMET': '/partners/astromet',
  'AssociationDetectionCentre': '/partners/detection-centre',
  'ANCPP': '/partners/ancpp',
  'OMSDS': '/partners/omsds',
}

const SLUG_TO_NAME: Record<string, string> = {
  'lefouilleurma': 'LeFouilleurma',
  'scnotce': 'SENOTEC',
  'astromet': 'ASTROMET',
  'detection-centre': 'AssociationDetectionCentre',
  'ancpp': 'ANCPP',
  'omsds': 'OMSDS',
}

const NAME_TO_PARTNER: Record<string, PartnerContent> = {
  'LeFouilleurma': LE_FOUILLEURMA,
  'SENOTEC': SENOTEC,
  'ASTROMET': ASTROMET,
  'AssociationDetectionCentre': ASSOCIATION_DETECTION_CENTRE,
  'ANCPP': ANCPP,
  'OMSDS': OMSDS,
}

export function getPartnerSections(name: string): PageSection[] {
  const partner = NAME_TO_PARTNER[name] || LE_FOUILLEURMA
  const idx = Object.keys(SLUG_TO_NAME).indexOf(Object.keys(SLUG_TO_NAME).find(k => SLUG_TO_NAME[k] === name) || '')
  const order = idx >= 0 ? idx * 100 + 1 : 1
  return buildPartnerSections(partner, order)
}

export function getPartnerSlug(name: string): string {
  return PARTNER_SLUGS[name] || `/partners/${name.toLowerCase().replace(/\s+/g, '-')}`
}

export function getPartnerNameFromKey(key: string): string {
  return SLUG_TO_NAME[key] || key
}

export { PARTNER_SLUGS, SLUG_TO_NAME }
