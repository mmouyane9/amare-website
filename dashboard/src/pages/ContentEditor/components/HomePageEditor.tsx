import { useState } from 'react'
import {
  Calendar,
  ChevronDown,
  Footprints,
  ImageIcon,
  Info,
  Mail,
  Newspaper,
  PanelTop,
  Sparkles,
  Store,
} from 'lucide-react'

import { HOME_PAGE_SECTIONS, type HomePageField } from '@/data/home-page-content'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

const SECTION_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'panel-top': PanelTop,
  'info': Info,
  'sparkles': Sparkles,
  'calendar': Calendar,
  'newspaper': Newspaper,
  'store': Store,
  'mail': Mail,
  'footprints': Footprints,
}

function SectionAccordionItem({
  section,
  defaultOpen,
}: {
  section: (typeof HOME_PAGE_SECTIONS)[number]
  defaultOpen: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  const Icon = SECTION_ICONS[section.icon] ?? PanelTop

  return (
    <div className="rounded-xl border border-border bg-card">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
      >
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-foreground">
            {section.title}
          </span>
          <span className="text-xs text-muted-foreground">
            {section.fields.length} حقول قابلة للتعديل
          </span>
        </span>
        <ChevronDown
          className={cn(
            'size-4 shrink-0 text-muted-foreground transition-transform duration-200',
            open && 'rotate-180',
          )}
        />
      </button>

      <div
        className={cn(
          'grid transition-all duration-200 ease-in-out',
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
        )}
      >
        <div className="overflow-hidden">
          <div className="space-y-3 border-t border-border/60 px-4 py-3">
            {section.fields.map((field) => (
              <FieldRenderer key={field.key} field={field} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function FieldRenderer({ field }: { field: HomePageField }) {
  const [value, setValue] = useState(field.value)

  if (field.type === 'textarea') {
    return (
      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-muted-foreground">
          {field.label}
        </label>
        <Textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="min-h-20 resize-y text-sm"
        />
      </div>
    )
  }

  if (field.type === 'image') {
    return (
      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-muted-foreground">
          {field.label}
        </label>
        <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-lg border border-dashed bg-muted/40">
          {value ? (
            <img src={value} alt={field.label} className="size-full object-cover" />
          ) : (
            <div className="flex flex-col items-center gap-1.5 text-muted-foreground">
              <ImageIcon className="size-6" />
              <span className="text-xs">لا توجد صورة</span>
            </div>
          )}
        </div>
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="رابط الصورة"
          className="h-9 text-sm"
        />
      </div>
    )
  }

  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-muted-foreground">
        {field.label}
      </label>
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="h-9 text-sm"
      />
    </div>
  )
}

export function HomePageEditor() {
  return (
    <div className="h-full overflow-y-auto bg-muted/30">
      <div className="mx-auto w-full max-w-2xl px-4 py-5 lg:px-6">
        <div className="mb-4">
          <p className="text-sm font-semibold text-foreground">الرئيسية</p>
          <p className="text-xs text-muted-foreground">/</p>
          <p className="mt-2 text-xs text-muted-foreground">
            {HOME_PAGE_SECTIONS.length} أقسام · حرر محتوى كل قسم أدناه
          </p>
        </div>

        <div className="space-y-3">
          {HOME_PAGE_SECTIONS.map((section, index) => (
            <SectionAccordionItem
              key={section.id}
              section={section}
              defaultOpen={index === 0}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
