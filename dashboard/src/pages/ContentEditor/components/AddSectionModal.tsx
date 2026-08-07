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
  { type: 'hero', label: 'الرئيسية', description: 'شريط رئيسي مع عنوان ودعوة للإجراء', icon: Sparkles },
  { type: 'heading', label: 'عنوان', description: 'عنوان القسم مع عنوان فرعي', icon: Type },
  { type: 'text', label: 'نص', description: 'منطقة محتوى نصي', icon: AlignLeft },
  { type: 'image', label: 'صورة', description: 'صورة مفردة مع تعليق', icon: Layout },
  { type: 'buttons', label: 'أزرار', description: 'مجموعة أزرار دعوة للإجراء', icon: Link2 },
  { type: 'statistics', label: 'إحصائيات', description: 'عدادات ومؤشرات متحركة', icon: TrendingUp },
  { type: 'gallery', label: 'معرض صور', description: 'شبكة معرض الصور', icon: Images },
  { type: 'cta', label: 'شريط دعوة للإجراء', description: 'شريط بارز لدعوة للإجراء', icon: Megaphone },
  { type: 'faq', label: 'أسئلة شائعة', description: 'قائمة منسدلة للأسئلة الشائعة', icon: HelpCircle },
  { type: 'video', label: 'فيديو', description: 'مشغل فيديو مضمّن', icon: Play },
  { type: 'custom', label: 'شبكة الميزات', description: 'أبرز الميزات في تخطيط شبكي', icon: LayoutGrid, customRenderer: 'featuresGrid' },
  { type: 'custom', label: 'شبكة الأنشطة', description: 'الأنشطة معروضة في بطاقات', icon: BarChart3, customRenderer: 'activitiesGrid' },
  { type: 'custom', label: 'شبكة الأخبار', description: 'مقالات إخبارية في تخطيط بطاقات', icon: Star, customRenderer: 'newsGrid' },
  { type: 'custom', label: 'قسم عن الجمعية', description: 'معلومات عن الجمعية مع الميزات والإحصائيات', icon: Users, customRenderer: 'about' },
  { type: 'custom', label: 'الفريق', description: 'قسم شبكي لأعضاء الفريق', icon: Users },
  { type: 'custom', label: 'الشركاء', description: 'دوارة شعارات الشركاء', icon: LayoutGrid },
  { type: 'custom', label: 'خريطة', description: 'خريطة تفاعلية مع الموقع', icon: MapPin },
  { type: 'custom', label: 'تذييل الصفحة', description: 'تذييل الموقع مع الروابط ومعلومات الاتصال', icon: Layout, customRenderer: 'footer' },
  { type: 'custom', label: 'HTML مخصص', description: 'كتلة محتوى مخصصة حرة', icon: Code2 },
  { type: 'custom', label: 'الجدول الزمني', description: 'عرض زمني ترتيبي', icon: BarChart3 },
  { type: 'custom', label: 'آراء العملاء', description: 'دوارة آراء العملاء', icon: MessageCircle },
  { type: 'custom', label: 'بطاقات', description: 'شبكة محتوى قائمة على البطاقات', icon: Puzzle },
  { type: 'custom', label: 'الخدمات', description: 'قسم عرض الخدمات', icon: LayoutGrid },
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
            إضافة قسم
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            اختر كتلة لإضافتها إلى صفحتك
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
