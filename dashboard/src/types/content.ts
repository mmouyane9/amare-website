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

export interface PageSection<T extends SectionType = SectionType> {
  id: string
  type: T
  enabled: boolean
  order: number
  data: SectionDataMap[T]
}

export interface PageRow {
  id: string
  title: string
  slug: string
  template: string
  status: 'draft' | 'published' | 'archived'
  seo_title: string
  seo_description: string
  seo_keywords: string
  og_image: string
  sort_order: number
  is_homepage: boolean
  created_by: string | null
  updated_by: string | null
  created_at: string
  updated_at: string
}

export interface SectionRow {
  id: string
  page_id: string
  section_type: string
  section_key: string | null
  title: string | null
  description: string | null
  content: Record<string, unknown>
  settings: Record<string, unknown>
  styles: Record<string, unknown>
  visible: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

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

export function sectionRowToPageSection(row: SectionRow): PageSection {
  const data: Record<string, unknown> = { ...row.content, ...row.settings }
  if (Object.keys(row.styles).length > 0) {
    data._styles = row.styles
  }
  return {
    id: row.id,
    type: row.section_type as SectionType,
    enabled: row.visible,
    order: row.sort_order,
    data: data as never,
  }
}

export function pageSectionToRow(section: PageSection, pageId: string): {
  id: string
  page_id: string
  section_type: string
  section_key: string | null
  visible: boolean
  sort_order: number
  content: Record<string, unknown>
  settings: Record<string, unknown>
  styles: Record<string, unknown>
} {
  const raw = section.data as Record<string, unknown>
  const settings: Record<string, unknown> = {}
  const content: Record<string, unknown> = {}
  const styles: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(raw)) {
    if (key === '_styles') {
      Object.assign(styles, (value as Record<string, unknown>) ?? {})
    } else if (key.startsWith('_') && key !== '_renderer') {
      settings[key] = value
    } else {
      content[key] = value
    }
  }

  return {
    id: section.id,
    page_id: pageId,
    section_type: section.type,
    section_key: null,
    visible: section.enabled,
    sort_order: section.order,
    content,
    settings,
    styles,
  }
}
