import {
  Heading,
  Image,
  Link2,
  PanelTop,
  Type,
  type LucideIcon,
} from 'lucide-react'

import type { BlockKind, ContentBlock } from '@/types/cms'

interface BlockKindMeta {
  label: string
  icon: LucideIcon
}

export const BLOCK_KIND_META: Record<BlockKind, BlockKindMeta> = {
  heading: { label: 'Heading', icon: Heading },
  paragraph: { label: 'Text', icon: Type },
  image: { label: 'Image', icon: Image },
  buttons: { label: 'Buttons', icon: Link2 },
  section: { label: 'Section', icon: PanelTop },
}

export const ADD_BLOCK_KINDS: BlockKind[] = [
  'section',
  'heading',
  'paragraph',
  'image',
  'buttons',
]

export function createBlock(kind: BlockKind, index: number): ContentBlock {
  const id = `${kind}-${Date.now().toString(36)}-${index}`
  const base = {
    id,
    kind,
    enabled: true,
  }

  switch (kind) {
    case 'heading':
      return { ...base, label: 'New heading', heading: 'New heading' }
    case 'paragraph':
      return {
        ...base,
        label: 'New paragraph',
        paragraph: 'Write your paragraph here…',
      }
    case 'image':
      return { ...base, label: 'New image', imageUrl: '', imageAlt: '' }
    case 'buttons':
      return {
        ...base,
        label: 'New buttons',
        buttons: [{ id: `${id}-cta`, label: 'Button', href: '/' }],
      }
    case 'section':
      return {
        ...base,
        label: 'New section',
        heading: 'Section heading',
        paragraph: 'Describe this section…',
      }
  }
}

export function blockSearchText(block: ContentBlock): string {
  return [
    block.label,
    block.heading,
    block.paragraph,
    block.imageAlt,
    block.buttons?.map((button) => button.label).join(' '),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}
