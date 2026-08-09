/**
 * شركاؤنا — Reusable partner page CMS template.
 *
 * Each partner shares the same 4-section structure.
 * Only the content values differ per partner.
 */

import type { PageSection } from '@/types/content'

export interface PartnerContent {
  name: string
  badge: string
  subtitle: string
  websiteUrl: string
  eyebrow: string
  aboutParagraphs: string[]
  email: string
  phone: string
  website: string
  address: string
  ctaHeading: string
  ctaButtonLabel: string
  ctaButtonUrl: string
}

function buildPartnerSections(p: PartnerContent, seedOrder: number): PageSection[] {
  return [
    {
      id: `sec-partner-hero-${p.name.toLowerCase().replace(/\s+/g, '-')}`,
      type: 'hero',
      enabled: true,
      order: seedOrder,
      data: {
        heading: p.name,
        subheading: p.badge,
        description: p.subtitle,
        backgroundImage: '',
        buttons: [
          { id: 'btn-pr-website', label: 'زيارة الموقع الإلكتروني', url: p.websiteUrl, variant: 'primary' },
          { id: 'btn-pr-contact', label: 'تواصل مع الشريك', url: '#prForm', variant: 'secondary' },
        ],
      },
    },
    {
      id: `sec-partner-about-${p.name.toLowerCase().replace(/\s+/g, '-')}`,
      type: 'custom',
      enabled: true,
      order: seedOrder + 1,
      data: {
        _renderer: 'partnerAbout',
        eyebrow: p.eyebrow,
        heading: p.name,
        paragraphs: p.aboutParagraphs,
      },
    },
    {
      id: `sec-partner-contact-${p.name.toLowerCase().replace(/\s+/g, '-')}`,
      type: 'custom',
      enabled: true,
      order: seedOrder + 2,
      data: {
        _renderer: 'partnerContact',
        email: p.email,
        phone: p.phone,
        website: p.website,
        address: p.address,
      },
    },
    {
      id: `sec-partner-cta-${p.name.toLowerCase().replace(/\s+/g, '-')}`,
      type: 'custom',
      enabled: true,
      order: seedOrder + 3,
      data: {
        _renderer: 'partnerCta',
        heading: p.ctaHeading,
        description: '',
        buttonLabel: p.ctaButtonLabel,
        buttonUrl: p.ctaButtonUrl,
      },
    },
  ]
}

export const PARTNERS: PartnerContent[] = [
  {
    name: 'LeFouilleurma',
    badge: 'شريك وطني',
    subtitle: 'شريك وطني للجمعية المغربية لهواة البحث والاستكشاف، متخصص في بيع وشراء أجهزة الكشف عن المعادن والكنوز على المستوى الوطني.',
    websiteUrl: '#',
    eyebrow: 'عن LeFouilleurma',
    aboutParagraphs: [
      'LeFouilleurma هي شركة مغربية متخصصة في بيع وشراء أجهزة الكشف عن المعادن والكنوز. تقدم الشركة مجموعة واسعة من الأجهزة المتطورة لتلبية احتياجات الهواة والمحترفين على حد سواء.',
      'نعمل مع الجمعية المغربية لهواة البحث والاستكشاف في إطار شراكة وطنية تهدف إلى توفير أحدث أجهزة الكشف والتنقيب لأعضاء الجمعية بأسعار تفضيلية.',
    ],
    email: 'contact@lefouilleurma.ma',
    phone: '+212 666 000 000',
    website: 'www.lefouilleurma.ma',
    address: 'شارع الزرقطوني، أكادير، المغرب',
    ctaHeading: 'هل أنت مستعد للشراكة معنا؟',
    ctaButtonLabel: 'تواصل معنا',
    ctaButtonUrl: '#prForm',
  },
  {
    name: 'SENOTEC',
    badge: 'شريك دولي',
    subtitle: 'شريك دولي للجمعية المغربية لهواة البحث والاستكشاف، متخصص في الحلول التقنية والأمنية المتطورة على المستوى الدولي.',
    websiteUrl: '#',
    eyebrow: 'عن SENOTEC',
    aboutParagraphs: [
      'SENOTEC هي شركة دولية متخصصة في تقديم الحلول التقنية والأمنية المتطورة. تمتلك الشركة خبرة واسعة في مجال أنظمة المراقبة والحماية الإلكترونية للمؤسسات والمنشآت.',
      'نعمل مع الجمعية المغربية لهواة البحث والاستكشاف في إطار شراكة دولية تهدف إلى تعزيز الأمن والسلامة في الأنشطة الميدانية والاستكشافية.',
    ],
    email: 'contact@senotec.com',
    phone: '+212 522 000 000',
    website: 'www.senotec.com',
    address: 'شارع الحسن الثاني، الرباط، المغرب',
    ctaHeading: 'هل أنت مستعد للشراكة معنا؟',
    ctaButtonLabel: 'تواصل معنا',
    ctaButtonUrl: '#prForm',
  },
  {
    name: 'ASTROMET',
    badge: 'شريك استراتيجي',
    subtitle: 'شريك استراتيجي للجمعية المغربية لهواة البحث والاستكشاف، متخصص في مجال التنقيب والاستكشاف المعدني بالمغرب.',
    websiteUrl: '#',
    eyebrow: 'عن ASTROMET',
    aboutParagraphs: [
      'ASTROMET هي شركة مغربية رائدة في مجال التنقيب والاستكشاف المعدني. تقوم الشركة على خبرة واسعة تمتد لسنوات عديدة في مجال الدراسات الجيولوجية والتنقيب عن المعادن.',
      'نعمل مع الجمعية المغربية لهواة البحث والاستكشاف في إطار شراكة استراتيجية تهدف إلى تعزيز التعاون العلمي والتقني في مجالات الاستكشاف والبحث الميداني.',
    ],
    email: 'contact@astromet.ma',
    phone: '+212 500 000 000',
    website: 'www.astromet.ma',
    address: 'شارع محمد الخامس، الدار البيضاء، المغرب',
    ctaHeading: 'هل أنت مستعد للشراكة معنا؟',
    ctaButtonLabel: 'تواصل معنا',
    ctaButtonUrl: '#prForm',
  },
  {
    name: 'AssociationDetectionCentre',
    badge: 'شريك استراتيجي',
    subtitle: 'شريك استراتيجي للجمعية المغربية لهواة البحث والاستكشاف، مركز متخصص في الكشف والتنقيب والتدريب على استخدام أجهزة الاستكشاف.',
    websiteUrl: '#',
    eyebrow: 'عن AssociationDetectionCentre',
    aboutParagraphs: [
      'AssociationDetectionCentre هو مركز متخصص في الكشف والتنقيب والتدريب على استخدام أحدث أجهزة الاستكشاف. يقدم المركز دورات تكوينية وورشات عملية لتطوير مهارات المنقبين والمستكشفين.',
      'نعمل مع الجمعية المغربية لهواة البحث والاستكشاف في إطار شراكة استراتيجية تهدف إلى توفير التكوين والتدريب المتخصص لأعضاء الجمعية في مجال استخدام أجهزة الكشف والتنقيب.',
    ],
    email: 'contact@detection-centre.ma',
    phone: '+212 539 000 000',
    website: 'www.detection-centre.ma',
    address: 'شارع فلسطين، طنجة، المغرب',
    ctaHeading: 'هل أنت مستعد للشراكة معنا؟',
    ctaButtonLabel: 'تواصل معنا',
    ctaButtonUrl: '#prForm',
  },
  {
    name: 'ANCPP',
    badge: 'شريك وطني',
    subtitle: 'شريك وطني للجمعية المغربية لهواة البحث والاستكشاف، الجمعية الوطنية لمحترفي الصيد البحري بالمغرب.',
    websiteUrl: '#',
    eyebrow: 'عن ANCPP',
    aboutParagraphs: [
      'ANCPP هي الجمعية الوطنية لمحترفي الصيد البحري بالمغرب. تمثل الجمعية مصالح الصيادين المحترفين وتعمل على تطوير قطاع الصيد البحري وحماية الثروة السمكية الوطنية.',
      'نعمل مع الجمعية المغربية لهواة البحث والاستكشاف في إطار شراكة وطنية تهدف إلى تعزيز التعاون في مجال الاستكشاف البحري وحماية البيئة البحرية المغربية.',
    ],
    email: 'contact@ancpp.ma',
    phone: '+212 528 000 000',
    website: 'www.ancpp.ma',
    address: 'ميناء أكادير، أكادير، المغرب',
    ctaHeading: 'هل أنت مستعد للشراكة معنا؟',
    ctaButtonLabel: 'تواصل معنا',
    ctaButtonUrl: '#prForm',
  },
  {
    name: 'OMSDS',
    badge: 'شريك رئيسي',
    subtitle: 'شريك رئيسي للجمعية المغربية لهواة البحث والاستكشاف، منظمة مغربية للتنمية الاجتماعية والتضامن تعمل على دعم المبادرات المجتمعية.',
    websiteUrl: '#',
    eyebrow: 'عن OMSDS',
    aboutParagraphs: [
      'OMSDS هي منظمة مغربية للتنمية الاجتماعية والتضامن، تعمل على دعم وتمكين المجتمع المدني من خلال برامج تنموية واجتماعية متنوعة تستهدف الفئات المحتاجة.',
      'نعمل مع الجمعية المغربية لهواة البحث والاستكشاف في إطار شراكة مجتمعية تهدف إلى دعم الأنشطة الاجتماعية والتطوعية وتعزيز قيم التضامن والتكافل.',
    ],
    email: 'contact@omsds.org',
    phone: '+212 537 000 000',
    website: 'www.omsds.org',
    address: 'شارع محمد السادس، مراكش، المغرب',
    ctaHeading: 'هل أنت مستعد للشراكة معنا؟',
    ctaButtonLabel: 'تواصل معنا',
    ctaButtonUrl: '#prForm',
  },
]

const PARTNER_SLUGS: Record<string, string> = {
  'LeFouilleurma': '/partners/lefouilleurma',
  'SENOTEC': '/partners/senotec',
  'ASTROMET': '/partners/astromet',
  'AssociationDetectionCentre': '/partners/detection-centre',
  'ANCPP': '/partners/ancpp',
  'OMSDS': '/partners/omsds',
}

export function getPartnerSections(name: string): PageSection[] {
  const partner = PARTNERS.find((p) => p.name === name)
  if (!partner) return []
  // Use different order ranges per partner: 1-4, 101-104, 201-204, etc.
  const idx = PARTNERS.indexOf(partner)
  const seedOrder = idx * 100 + 1
  return buildPartnerSections(partner, seedOrder)
}

export function getPartnerSlug(name: string): string {
  return PARTNER_SLUGS[name] || `/partners/${name.toLowerCase().replace(/\s+/g, '-')}`
}

export { PARTNER_SLUGS }

const SLUG_TO_NAME: Record<string, string> = {
  'lefouilleurma': 'LeFouilleurma',
  'senotec': 'SENOTEC',
  'astromet': 'ASTROMET',
  'detection-centre': 'AssociationDetectionCentre',
  'ancpp': 'ANCPP',
  'omsds': 'OMSDS',
}

export function getPartnerNameFromKey(key: string): string {
  return SLUG_TO_NAME[key] || key
}
