import { useMemo } from 'react'
import {
  AlignLeft,
  BarChart3,
  Copy,
  EyeOff,
  GripVertical,
  HelpCircle,
  ImageIcon,
  Layout,
  Link2,
  Megaphone,
  MessageCircle,
  MoreHorizontal,
  PanelTop,
  Play,
  Puzzle,
  Type,
} from 'lucide-react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import type { PageSection, SectionType } from '@/types/content'

const SECTION_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  hero: Layout,
  heading: Type,
  text: AlignLeft,
  image: ImageIcon,
  buttons: Link2,
  statistics: BarChart3,
  gallery: PanelTop,
  cta: Megaphone,
  faq: HelpCircle,
  video: Play,
  custom: Puzzle,
  about: MessageCircle,
  featuresGrid: PanelTop,
  activitiesGrid: PanelTop,
  newsGrid: PanelTop,
  footer: Layout,
}

const SECTION_ICON_FALLBACK = Puzzle

function resolveIcon(type: SectionType, data: Record<string, unknown>): React.ComponentType<{ className?: string }> {
  if (type === 'custom') {
    const renderer = data._renderer as string | undefined
    if (renderer && SECTION_ICON[renderer]) return SECTION_ICON[renderer]!
  }
  return SECTION_ICON[type] ?? SECTION_ICON_FALLBACK
}

const SECTION_DESCRIPTION: Record<string, string> = {
  hero: 'Main banner with heading, description, and call-to-action',
  heading: 'Section heading with subtitle',
  text: 'Rich text content block',
  image: 'Single image with caption',
  buttons: 'Call-to-action buttons group',
  statistics: 'Animated counters and key metrics',
  gallery: 'Image gallery grid',
  cta: 'Call-to-action banner with button',
  faq: 'Frequently asked questions accordion',
  video: 'Embedded video player',
  custom: 'Custom structured content',
}

function getDescription(type: SectionType, data: Record<string, unknown>): string {
  if (type === 'custom') {
    const renderer = data._renderer as string | undefined
    if (renderer) return `${renderer} — Custom layout`
    return 'Custom structured content'
  }
  return SECTION_DESCRIPTION[type] ?? ''
}

function getPreview(type: SectionType, data: Record<string, unknown>): string {
  if (type === 'custom') {
    const renderer = data._renderer as string | undefined
    if (renderer) return renderer
    return 'custom'
  }
  return type
}

const TYPE_LABEL: Record<string, string> = {
  hero: 'Hero',
  heading: 'Heading',
  text: 'Text',
  image: 'Image',
  buttons: 'Buttons',
  statistics: 'Statistics',
  gallery: 'Gallery',
  cta: 'CTA',
  faq: 'FAQ',
  video: 'Video',
  custom: 'Custom',
}

interface SectionCardProps {
  section: PageSection
  isSelected: boolean
  onSelect: (sectionId: string) => void
  onToggle: (enabled: boolean) => void
  onDuplicate: () => void
  onDelete: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  isFirst: boolean
  isLast: boolean
}

export function SectionCard({
  section,
  isSelected,
  onSelect,
  onToggle,
  onDuplicate,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: SectionCardProps) {
  const data = section.data as Record<string, unknown>
  const Icon = useMemo(() => resolveIcon(section.type, data), [section.type, data])

  const displayType = section.type === 'custom'
    ? ((data._renderer as string) ?? 'custom')
    : section.type

  const label = getPreview(section.type, data)
  const title =
    (data.heading as string) ||
    (data.title as string) ||
    (data.eyebrow as string) ||
    (data.brandName as string) ||
    (data.quote as string) ||
    displayType

  const description = getDescription(section.type, data)
  console.log('[SectionCard] render — id:', section.id, 'type:', section.type, 'enabled:', section.enabled, 'title:', title)

  return (
    <div
      className={cn(
        'group relative rounded-2xl border bg-white transition-all duration-200 cursor-pointer',
        isSelected
          ? 'border-primary/40 shadow-lg shadow-primary/5 ring-1 ring-primary/20'
          : section.enabled
            ? 'border-[#E5E7EB] shadow-sm hover:shadow-md hover:border-primary/20'
            : 'border-destructive/15 opacity-60',
      )}
      onClick={() => onSelect(section.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect(section.id)
        }
      }}
    >
      <div className="flex items-center gap-4 p-4">
        <div className="flex cursor-grab items-center text-muted-foreground/40 transition-colors group-hover:text-muted-foreground/70">
          <GripVertical className="size-4" />
        </div>

        <div
          className={cn(
            'flex size-10 shrink-0 items-center justify-center rounded-xl transition-colors',
            isSelected
              ? 'bg-primary/10 text-primary'
              : 'bg-gray-50 text-muted-foreground group-hover:bg-primary/5 group-hover:text-primary/70',
          )}
        >
          <Icon className="size-5" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-semibold text-foreground">
              {title || displayType}
            </span>
            <span
              className={cn(
                'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium capitalize',
                section.enabled
                  ? 'bg-emerald-50 text-emerald-600'
                  : 'bg-muted text-muted-foreground',
              )}
            >
              {section.enabled ? 'Visible' : 'Hidden'}
            </span>
          </div>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {displayType === 'custom' ? label : description}
          </p>
        </div>

        <div
          className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={onDuplicate}
            className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            title="Duplicate"
          >
            <Copy className="size-3.5" />
          </button>

          <button
            type="button"
            onClick={() => onToggle(!section.enabled)}
            className={cn(
              'flex size-7 items-center justify-center rounded-lg transition-colors',
              section.enabled
                ? 'text-muted-foreground hover:bg-muted hover:text-foreground'
                : 'text-destructive hover:bg-destructive/10',
            )}
            title={section.enabled ? 'Hide' : 'Show'}
          >
            <EyeOff className="size-3.5" />
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <MoreHorizontal className="size-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={onDuplicate}>
                <Copy className="size-3.5" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onToggle(!section.enabled)}>
                <EyeOff className="size-3.5" />
                {section.enabled ? 'Hide' : 'Show'}
              </DropdownMenuItem>
              {!isFirst && (
                <DropdownMenuItem onClick={onMoveUp}>Move Up</DropdownMenuItem>
              )}
              {!isLast && (
                <DropdownMenuItem onClick={onMoveDown}>Move Down</DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={onDelete}
                className="text-destructive focus:text-destructive"
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}
