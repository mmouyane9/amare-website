export type BlockKind = 'heading' | 'paragraph' | 'image' | 'buttons' | 'section'

export type PublishStatus = 'draft' | 'published'

export interface CtaButton {
  id: string
  label: string
  href: string
}

export interface ContentBlock {
  id: string
  kind: BlockKind
  label: string
  enabled: boolean
  heading?: string
  paragraph?: string
  imageUrl?: string
  imageAlt?: string
  buttons?: CtaButton[]
}

export interface SeoFields {
  title: string
  metaDescription: string
  ogImage: string
  slug: string
}

export interface ContentPage {
  id: string
  name: string
  status: PublishStatus
  updatedAt: string
  seo: SeoFields
  blocks: ContentBlock[]
}
