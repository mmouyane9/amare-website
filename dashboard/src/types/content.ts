export const SECTION_TYPES = [
  'hero',
  'heading',
  'text',
  'image',
  'buttons',
  'statistics',
  'gallery',
  'cta',
  'faq',
  'video',
  'custom',
] as const

export type SectionType = (typeof SECTION_TYPES)[number]

export const SECTION_TYPE_LABELS: Record<SectionType, string> = {
  hero: 'Hero',
  heading: 'عنوان (Heading)',
  text: 'نص (Text)',
  image: 'صورة (Image)',
  buttons: 'أزرار (Buttons)',
  statistics: 'إحصائيات (Statistics)',
  gallery: 'معرض صور (Gallery)',
  cta: 'دعوة للإجراء (CTA)',
  faq: 'أسئلة شائعة (FAQ)',
  video: 'فيديو (Video)',
  custom: 'مخصص (Custom)',
}

// ---------------------------------------------------------------------------
// Section data shapes
// ---------------------------------------------------------------------------

export interface SectionButton {
  id: string
  label: string
  url: string
  variant: 'primary' | 'secondary' | 'outline'
}

export interface SectionStat {
  id: string
  value: string
  suffix: string
  label: string
}

export interface SectionImage {
  id: string
  url: string
  alt: string
}

export interface SectionFaqItem {
  id: string
  question: string
  answer: string
}

export type SectionDataMap = {
  hero: {
    heading: string
    subheading: string
    description: string
    backgroundImage: string
    buttons: SectionButton[]
  }
  heading: {
    heading: string
    subheading: string
  }
  text: {
    heading: string
    body: string
  }
  image: {
    url: string
    alt: string
    caption: string
  }
  buttons: {
    heading: string
    buttons: SectionButton[]
  }
  statistics: {
    heading: string
    description: string
    stats: SectionStat[]
  }
  gallery: {
    heading: string
    images: SectionImage[]
  }
  cta: {
    heading: string
    description: string
    buttonLabel: string
    buttonUrl: string
    backgroundImage: string
  }
  faq: {
    heading: string
    items: SectionFaqItem[]
  }
  video: {
    url: string
    thumbnail: string
    heading: string
  }
  custom: Record<string, unknown>
}

// ---------------------------------------------------------------------------
// Section model
// ---------------------------------------------------------------------------

export interface PageSection<T extends SectionType = SectionType> {
  id: string
  type: T
  enabled: boolean
  order: number
  data: SectionDataMap[T]
}

export interface PageContent {
  sections: PageSection[]
}

// ---------------------------------------------------------------------------
// Supabase row shape
// ---------------------------------------------------------------------------

export interface ContentPageRow {
  id: string
  page_key: string
  title: string
  slug: string
  content: PageContent
  seo_title: string
  seo_description: string
  seo_keywords: string
  og_image: string
  status: 'draft' | 'published'
  is_homepage: boolean
  sort_order: number
  template: string
  is_system: boolean
  created_at: string
  updated_at: string
  updated_by: string | null
}

// ---------------------------------------------------------------------------
// Default data for each section type
// ---------------------------------------------------------------------------

export function defaultSectionData<T extends SectionType>(type: T): Record<string, unknown> {
  switch (type) {
    case 'hero':
      return { heading: '', subheading: '', description: '', backgroundImage: '', buttons: [] }
    case 'heading':
      return { heading: '', subheading: '' }
    case 'text':
      return { heading: '', body: '' }
    case 'image':
      return { url: '', alt: '', caption: '' }
    case 'buttons':
      return { heading: '', buttons: [] }
    case 'statistics':
      return { heading: '', description: '', stats: [] }
    case 'gallery':
      return { heading: '', images: [] }
    case 'cta':
      return { heading: '', description: '', buttonLabel: '', buttonUrl: '', backgroundImage: '' }
    case 'faq':
      return { heading: '', items: [] }
    case 'video':
      return { url: '', thumbnail: '', heading: '' }
    case 'custom':
      return {}
  }
}
