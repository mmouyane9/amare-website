/**
 * شركاؤنا — Reusable partner page CMS template with full 8 sections.
 */

import type { PageSection } from '@/types/content'

export interface PartnerContent {
  name: string
  badge: string
  subtitle: string
  websiteUrl: string
  /* About */
  aboutEyebrow: string
  aboutHeading: string
  aboutParagraphs: string[]
  aboutImage: string
  /* Services */
  servicesEyebrow: string
  servicesHeading: string
  servicesDescription: string
  services: { title: string; description: string }[]
  /* Why partner */
  whyEyebrow: string
  whyHeading: string
  whyDescription: string
  whyCards: { title: string; description: string }[]
  /* Gallery */
  galleryEyebrow: string
  galleryHeading: string
  galleryDescription: string
  galleryImages: string[]
  /* Contact info */
  contactHeading: string
  contactDescription: string
  email: string
  phone: string
  website: string
  address: string
  /* Contact form */
  formHeading: string
  formDescription: string
  /* CTA */
  ctaHeading: string
  ctaButtons: { label: string; url: string }[]
}

function buildPartnerSections(p: PartnerContent, order: number): PageSection[] {
  return [
    {
      id: crypto.randomUUID(),
      type: 'hero',
      enabled: true,
      order,
      data: {
        heading: p.name,
        subheading: p.badge,
        description: p.subtitle,
        backgroundImage: '',
        buttons: [
          { id: 'btn-pr-website', label: p.ctaButtons[0]?.label || 'زيارة الموقع الإلكتروني', url: p.websiteUrl, variant: 'primary' },
          { id: 'btn-pr-contact', label: p.ctaButtons[1]?.label || 'تواصل مع الشريك', url: '#prForm', variant: 'secondary' },
        ],
      },
    },
    {
      id: crypto.randomUUID(),
      type: 'custom',
      enabled: true,
      order: order + 1,
      data: {
        _renderer: 'partnerAbout',
        eyebrow: p.aboutEyebrow,
        heading: p.aboutHeading,
        paragraphs: p.aboutParagraphs,
        image: p.aboutImage,
      },
    },
    {
      id: crypto.randomUUID(),
      type: 'custom',
      enabled: true,
      order: order + 2,
      data: {
        _renderer: 'partnerServices',
        eyebrow: p.servicesEyebrow,
        heading: p.servicesHeading,
        description: p.servicesDescription,
        cards: p.services,
      },
    },
    {
      id: crypto.randomUUID(),
      type: 'custom',
      enabled: true,
      order: order + 3,
      data: {
        _renderer: 'partnerWhy',
        eyebrow: p.whyEyebrow,
        heading: p.whyHeading,
        description: p.whyDescription,
        cards: p.whyCards,
      },
    },
    {
      id: crypto.randomUUID(),
      type: 'custom',
      enabled: true,
      order: order + 4,
      data: {
        _renderer: 'partnerGallery',
        eyebrow: p.galleryEyebrow,
        heading: p.galleryHeading,
        description: p.galleryDescription,
        images: p.galleryImages.map((url, i) => ({ id: `gimg-${i}`, url, alt: '' })),
      },
    },
    {
      id: crypto.randomUUID(),
      type: 'custom',
      enabled: true,
      order: order + 5,
      data: {
        _renderer: 'partnerContact',
        heading: p.contactHeading,
        description: p.contactDescription,
        email: p.email,
        phone: p.phone,
        website: p.website,
        address: p.address,
      },
    },
    {
      id: crypto.randomUUID(),
      type: 'custom',
      enabled: true,
      order: order + 6,
      data: {
        _renderer: 'partnerForm',
        heading: p.formHeading,
        description: p.formDescription,
      },
    },
    {
      id: crypto.randomUUID(),
      type: 'custom',
      enabled: true,
      order: order + 7,
      data: {
        _renderer: 'partnerCta',
        heading: p.ctaHeading,
        description: '',
        buttons: p.ctaButtons.map((b, i) => ({
          id: `btn-pr-cta-${i}`,
          label: b.label,
          url: b.url,
          variant: i === 0 ? 'primary' : 'secondary',
        })),
      },
    },
  ]
}

export const LE_FOUILLEURMA: PartnerContent = {
  name: 'LeFouilleurma',
  badge: 'شريك وطني',
  subtitle: 'شريك وطني للجمعية المغربية لهواة البحث والاستكشاف، متخصص في بيع وشراء أجهزة الكشف عن المعادن والكنوز على المستوى الوطني.',
  websiteUrl: 'https://www.lefouilleurma.ma',
  aboutEyebrow: 'عن LeFouilleurma',
  aboutHeading: 'شريككم الموثوق في مجال التنقيب والاستكشاف',
  aboutParagraphs: [
    'LeFouilleurma هي شركة مغربية متخصصة في بيع وشراء أجهزة الكشف عن المعادن والكنوز. تقدم الشركة مجموعة واسعة من الأجهزة المتطورة لتلبية احتياجات الهواة والمحترفين على حد سواء.',
    'نعمل مع الجمعية المغربية لهواة البحث والاستكشاف في إطار شراكة وطنية تهدف إلى توفير أحدث أجهزة الكشف والتنقيب لأعضاء الجمعية بأسعار تفضيلية.',
  ],
  aboutImage: '',
  servicesEyebrow: 'خدماتنا',
  servicesHeading: 'ماذا نقدم؟',
  servicesDescription: 'نقدم مجموعة متكاملة من الخدمات المتخصصة في مجال التنقيب والاستكشاف.',
  services: [
    { title: 'التنقيب المعدني', description: 'دراسات جيولوجية متقدمة للتنقيب عن المعادن والثروات الطبيعية في مختلف مناطق المغرب.' },
    { title: 'الدراسات الجيولوجية', description: 'تحليل وتوثيق التكوينات الجيولوجية وتقديم استشارات متخصصة للمشاريع الاستكشافية.' },
    { title: 'رسم الخرائط', description: 'تصميم وإنتاج خرائط جيولوجية وطبوغرافية دقيقة باستخدام أحدث التقنيات الرقمية.' },
    { title: 'التحاليل المخبرية', description: 'تحاليل متطورة للعينات المعدنية والصخرية باستخدام أحدث الأجهزة والتقنيات المخبرية.' },
  ],
  whyEyebrow: 'لماذا الشراكة معنا؟',
  whyHeading: 'مميزات شراكتنا',
  whyDescription: 'نعمل جنبًا إلى جنب مع شركائنا لتحقيق النجاح المشترك.',
  whyCards: [
    { title: 'خبرة مهنية', description: 'نمتلك خبرة تمتد لسنوات في مجال التنقيب والاستكشاف المعدني بالمغرب.' },
    { title: 'شريك موثوق', description: 'نلتزم بأعلى معايير الجودة والمهنية في جميع مشاريعنا وخدماتنا.' },
    { title: 'خدمات عالية الجودة', description: 'نقدم خدمات متكاملة تلبي احتياجات شركائنا بأعلى مستوى من الدقة والكفاءة.' },
    { title: 'تعاون وطني ودولي', description: 'نعمل في إطار تعاون وطني ودولي لتعزيز البحث والاستكشاف المعدني.' },
  ],
  galleryEyebrow: 'معرض الصور',
  galleryHeading: 'صور من أعمالنا',
  galleryDescription: 'جانب من أنشطتنا ومشاريعنا المشتركة.',
  galleryImages: ['', '', '', '', '', ''],
  contactHeading: 'تواصل معنا',
  contactDescription: 'نحن هنا للإجابة على استفساراتكم.',
  email: 'contact@lefouilleurma.ma',
  phone: '+212 666 000 000',
  website: 'www.lefouilleurma.ma',
  address: 'شارع الزرقطوني، أكادير، المغرب',
  formHeading: 'تواصل مع LeFouilleurma',
  formDescription: 'أرسل لنا استفسارك وسنرد عليك في أقرب وقت.',
  ctaHeading: 'هل أنت مهتم بالعمل مع هذا الشريك؟',
  ctaButtons: [
    { label: 'زيارة الموقع الإلكتروني', url: 'https://www.lefouilleurma.ma' },
    { label: 'تواصل مع الشريك', url: '#prForm' },
  ],
}

export const SENOTEC: PartnerContent = {
  name: 'SENOTEC',
  badge: 'شريك دولي',
  subtitle: 'شريك دولي للجمعية المغربية لهواة البحث والاستكشاف، متخصص في الحلول التقنية والأمنية المتطورة على المستوى الدولي.',
  websiteUrl: 'https://www.senotec.com',
  aboutEyebrow: 'عن SENOTEC',
  aboutHeading: 'شريككم الموثوق في مجال التنقيب والاستكشاف',
  aboutImage: '',
  aboutParagraphs: [
    'SENOTEC هي شركة دولية متخصصة في تقديم الحلول التقنية والأمنية المتطورة. تمتلك الشركة خبرة واسعة في مجال أنظمة المراقبة والحماية الإلكترونية للمؤسسات والمنشآت.',
    'نعمل مع الجمعية المغربية لهواة البحث والاستكشاف في إطار شراكة دولية تهدف إلى تعزيز الأمن والسلامة في الأنشطة الميدانية والاستكشافية.',
  ],
  servicesEyebrow: 'خدماتنا',
  servicesHeading: 'ماذا نقدم؟',
  servicesDescription: 'نقدم مجموعة متكاملة من الخدمات المتخصصة في مجال التنقيب والاستكشاف.',
  services: [
    { title: 'التنقيب المعدني', description: 'دراسات جيولوجية متقدمة للتنقيب عن المعادن والثروات الطبيعية في مختلف مناطق المغرب.' },
    { title: 'الدراسات الجيولوجية', description: 'تحليل وتوثيق التكوينات الجيولوجية وتقديم استشارات متخصصة للمشاريع الاستكشافية.' },
    { title: 'رسم الخرائط', description: 'تصميم وإنتاج خرائط جيولوجية وطبوغرافية دقيقة باستخدام أحدث التقنيات الرقمية.' },
    { title: 'التحاليل المخبرية', description: 'تحاليل متطورة للعينات المعدنية والصخرية باستخدام أحدث الأجهزة والتقنيات المخبرية.' },
  ],
  whyEyebrow: 'لماذا الشراكة معنا؟',
  whyHeading: 'مميزات شراكتنا',
  whyDescription: 'نعمل جنبًا إلى جنب مع شركائنا لتحقيق النجاح المشترك.',
  whyCards: [
    { title: 'خبرة مهنية', description: 'نمتلك خبرة تمتد لسنوات في مجال التنقيب والاستكشاف المعدني بالمغرب.' },
    { title: 'شريك موثوق', description: 'نلتزم بأعلى معايير الجودة والمهنية في جميع مشاريعنا وخدماتنا.' },
    { title: 'خدمات عالية الجودة', description: 'نقدم خدمات متكاملة تلبي احتياجات شركائنا بأعلى مستوى من الدقة والكفاءة.' },
    { title: 'تعاون وطني ودولي', description: 'نعمل في إطار تعاون وطني ودولي لتعزيز البحث والاستكشاف المعدني.' },
  ],
  galleryEyebrow: 'معرض الصور',
  galleryHeading: 'صور من أعمالنا',
  galleryDescription: 'جانب من أنشطتنا ومشاريعنا المشتركة.',
  galleryImages: ['', '', '', '', '', ''],
  contactHeading: 'تواصل معنا',
  contactDescription: 'نحن هنا للإجابة على استفساراتكم.',
  email: 'contact@senotec.com',
  phone: '+212 522 000 000',
  website: 'www.senotec.com',
  address: 'شارع الحسن الثاني، الرباط، المغرب',
  formHeading: 'تواصل مع SENOTEC',
  formDescription: 'أرسل لنا استفسارك وسنرد عليك في أقرب وقت.',
  ctaHeading: 'هل أنت مهتم بالعمل مع هذا الشريك؟',
  ctaButtons: [
    { label: 'زيارة الموقع الإلكتروني', url: 'https://www.senotec.com' },
    { label: 'تواصل مع الشريك', url: '#prForm' },
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
  'senotec': 'SENOTEC',
  'astromet': 'ASTROMET',
  'detection-centre': 'AssociationDetectionCentre',
  'ancpp': 'ANCPP',
  'omsds': 'OMSDS',
}

const NAME_TO_PARTNER: Record<string, PartnerContent> = {
  'LeFouilleurma': LE_FOUILLEURMA,
  'SENOTEC': SENOTEC,
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
