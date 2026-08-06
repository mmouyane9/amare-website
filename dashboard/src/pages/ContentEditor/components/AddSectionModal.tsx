import {
  AlignLeft,
  BarChart3,
  Code2,
  HelpCircle,
  Images,
  Layout,
  LayoutGrid,
  Link2,
  MapPin,
  Megaphone,
  MessageCircle,
  Play,
  Plus,
  Puzzle,
  Sparkles,
  Star,
  TrendingUp,
  Type,
  Users,
} from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import type { SectionType } from '@/types/content'

interface BlockItem {
  type: SectionType | null
  label: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  customRenderer?: string
}

const BLOCKS: BlockItem[] = [
  { type: 'hero', label: 'Hero', description: 'Main banner with headline and CTA', icon: Sparkles },
  { type: 'heading', label: 'Heading', description: 'Section title with subtitle', icon: Type },
  { type: 'text', label: 'Text Block', description: 'Rich text content area', icon: AlignLeft },
  { type: 'image', label: 'Image', description: 'Single image with caption', icon: Layout },
  { type: 'buttons', label: 'Buttons', description: 'Call-to-action button group', icon: Link2 },
  { type: 'statistics', label: 'Statistics', description: 'Animated counters and metrics', icon: TrendingUp },
  { type: 'gallery', label: 'Gallery', description: 'Image gallery grid', icon: Images },
  { type: 'cta', label: 'CTA Banner', description: 'Prominent call-to-action banner', icon: Megaphone },
  { type: 'faq', label: 'FAQ', description: 'Frequently asked questions accordion', icon: HelpCircle },
  { type: 'video', label: 'Video', description: 'Embedded video player', icon: Play },
  { type: 'custom', label: 'Features Grid', description: 'Feature highlights in grid layout', icon: LayoutGrid, customRenderer: 'featuresGrid' },
  { type: 'custom', label: 'Activities Grid', description: 'Activities displayed in cards', icon: BarChart3, customRenderer: 'activitiesGrid' },
  { type: 'custom', label: 'News Grid', description: 'News articles in card layout', icon: Star, customRenderer: 'newsGrid' },
  { type: 'custom', label: 'About Section', description: 'Company about with features and stats', icon: Users, customRenderer: 'about' },
  { type: 'custom', label: 'Team', description: 'Team members grid section', icon: Users },
  { type: 'custom', label: 'Partners', description: 'Partner logos carousel', icon: LayoutGrid },
  { type: 'custom', label: 'Map', description: 'Interactive map with location', icon: MapPin },
  { type: 'custom', label: 'Footer', description: 'Site footer with links and contact', icon: Layout, customRenderer: 'footer' },
  { type: 'custom', label: 'Custom HTML', description: 'Free-form custom content block', icon: Code2 },
  { type: 'custom', label: 'Timeline', description: 'Chronological timeline display', icon: BarChart3 },
  { type: 'custom', label: 'Testimonials', description: 'Customer testimonials carousel', icon: MessageCircle },
  { type: 'custom', label: 'Cards', description: 'Card-based content grid', icon: Puzzle },
  { type: 'custom', label: 'Services', description: 'Services listing section', icon: LayoutGrid },
]

interface AddSectionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddSection: (type: SectionType, renderer?: string) => void
}

export function AddSectionModal({ open, onOpenChange, onAddSection }: AddSectionModalProps) {
  const handleSelect = (block: BlockItem) => {
    if (block.type) {
      onAddSection(block.type, block.customRenderer)
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85svh] max-w-2xl gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b border-[#E5E7EB] px-6 py-4">
          <DialogTitle className="flex items-center gap-2 text-base font-semibold">
            <Plus className="size-4 text-primary" />
            Add Section
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Choose a block to add to your page
          </p>
        </DialogHeader>

        <div className="overflow-y-auto p-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {BLOCKS.map((block) => {
              const Icon = block.icon
              return (
                <button
                  key={`${block.type}-${block.label}`}
                  type="button"
                  onClick={() => handleSelect(block)}
                  className={cn(
                    'flex flex-col items-center gap-2.5 rounded-2xl border border-[#E5E7EB] bg-white p-4 text-center transition-all duration-200',
                    'hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 hover:-translate-y-0.5',
                  )}
                >
                  <span className="flex size-10 items-center justify-center rounded-xl bg-gray-50 text-muted-foreground transition-colors group-hover:bg-primary/5 group-hover:text-primary">
                    <Icon className="size-5" />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-foreground">{block.label}</p>
                    <p className="mt-0.5 text-[11px] leading-tight text-muted-foreground">
                      {block.description}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
