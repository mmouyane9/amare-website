import { useState } from 'react'
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  Copy,
  EyeOff,
  ImageIcon,
  Plus,
  Trash2,
} from 'lucide-react'

import {
  SECTION_TYPES,
  SECTION_TYPE_LABELS,
  type PageSection,
  type SectionButton,
  type SectionFaqItem,
  type SectionImage,
  type SectionStat,
  type SectionType,
} from '@/types/content'
import {
  generateButtonId,
  generateFaqItemId,
  generateImageId,
  generateStatId,
} from '@/services/content.service'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// SectionEditor props
// ---------------------------------------------------------------------------

interface SectionEditorProps {
  section: PageSection
  index: number
  total: number
  onChange: (data: Record<string, unknown>) => void
  onToggle: (enabled: boolean) => void
  onDelete: () => void
  onDuplicate: () => void
  onMoveUp: () => void
  onMoveDown: () => void
}

// ---------------------------------------------------------------------------
// Shared field helpers
// ---------------------------------------------------------------------------

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-muted-foreground">{label}</label>
      {children}
    </div>
  )
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
}) {
  return (
    <FieldGroup label={label}>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-9 text-sm"
      />
    </FieldGroup>
  )
}

function TextareaField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
}) {
  return (
    <FieldGroup label={label}>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-h-20 resize-y text-sm"
      />
    </FieldGroup>
  )
}

function ImageField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <FieldGroup label={label}>
      <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-lg border border-dashed bg-muted/40">
        {value ? (
          <img src={value} alt={label} className="size-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-1.5 text-muted-foreground">
            <ImageIcon className="size-6" />
            <span className="text-xs">لا توجد صورة</span>
          </div>
        )}
      </div>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="رابط الصورة"
        className="h-9 text-sm"
      />
    </FieldGroup>
  )
}

function ButtonEditor({
  button,
  onChange,
  onDelete,
}: {
  button: SectionButton
  onChange: (b: SectionButton) => void
  onDelete: () => void
}) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-border/60 bg-muted/30 p-2.5">
      <div className="min-w-0 flex-1 space-y-2">
        <Input
          value={button.label}
          onChange={(e) => onChange({ ...button, label: e.target.value })}
          placeholder="نص الزر"
          className="h-8 text-sm"
        />
        <Input
          value={button.url}
          onChange={(e) => onChange({ ...button, url: e.target.value })}
          placeholder="الرابط"
          className="h-8 text-sm"
        />
        <select
          value={button.variant}
          onChange={(e) =>
            onChange({ ...button, variant: e.target.value as SectionButton['variant'] })
          }
          className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-xs"
        >
          <option value="primary">Primary</option>
          <option value="secondary">Secondary</option>
          <option value="outline">Outline</option>
        </select>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="shrink-0 text-muted-foreground hover:text-destructive"
        onClick={onDelete}
      >
        <Trash2 className="size-3.5" />
      </Button>
    </div>
  )
}

function StatEditor({
  stat,
  onChange,
  onDelete,
}: {
  stat: SectionStat
  onChange: (s: SectionStat) => void
  onDelete: () => void
}) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-border/60 bg-muted/30 p-2.5">
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex gap-2">
          <Input
            value={stat.value}
            onChange={(e) => onChange({ ...stat, value: e.target.value })}
            placeholder="الرقم"
            className="h-8 w-20 text-sm"
          />
          <Input
            value={stat.suffix}
            onChange={(e) => onChange({ ...stat, suffix: e.target.value })}
            placeholder="+"
            className="h-8 w-14 text-sm"
          />
        </div>
        <Input
          value={stat.label}
          onChange={(e) => onChange({ ...stat, label: e.target.value })}
          placeholder="التسمية"
          className="h-8 text-sm"
        />
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="shrink-0 text-muted-foreground hover:text-destructive"
        onClick={onDelete}
      >
        <Trash2 className="size-3.5" />
      </Button>
    </div>
  )
}

function GalleryImageEditor({
  image,
  onChange,
  onDelete,
}: {
  image: SectionImage
  onChange: (img: SectionImage) => void
  onDelete: () => void
}) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-border/60 bg-muted/30 p-2.5">
      <div className="relative size-14 shrink-0 overflow-hidden rounded-md bg-muted">
        {image.url ? (
          <img src={image.url} alt={image.alt} className="size-full object-cover" />
        ) : (
          <div className="flex size-full items-center justify-center">
            <ImageIcon className="size-4 text-muted-foreground" />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1 space-y-2">
        <Input
          value={image.url}
          onChange={(e) => onChange({ ...image, url: e.target.value })}
          placeholder="رابط الصورة"
          className="h-8 text-sm"
        />
        <Input
          value={image.alt}
          onChange={(e) => onChange({ ...image, alt: e.target.value })}
          placeholder="النص البديل"
          className="h-8 text-sm"
        />
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="shrink-0 text-muted-foreground hover:text-destructive"
        onClick={onDelete}
      >
        <Trash2 className="size-3.5" />
      </Button>
    </div>
  )
}

function FaqItemEditor({
  item,
  onChange,
  onDelete,
}: {
  item: SectionFaqItem
  onChange: (f: SectionFaqItem) => void
  onDelete: () => void
}) {
  return (
    <div className="space-y-2 rounded-lg border border-border/60 bg-muted/30 p-2.5">
      <div className="flex items-center gap-2">
        <Input
          value={item.question}
          onChange={(e) => onChange({ ...item, question: e.target.value })}
          placeholder="السؤال"
          className="h-8 flex-1 text-sm font-medium"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="shrink-0 text-muted-foreground hover:text-destructive"
          onClick={onDelete}
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>
      <Textarea
        value={item.answer}
        onChange={(e) => onChange({ ...item, answer: e.target.value })}
        placeholder="الجواب"
        className="min-h-16 resize-y text-sm"
      />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Section type editors
// ---------------------------------------------------------------------------

function HeroEditor({ section, onChange }: SectionEditorProps) {
  const data = section.data as Record<string, unknown>
  const buttons = (data.buttons ?? []) as SectionButton[]

  return (
    <div className="space-y-3">
      <TextField
        label="العنوان الرئيسي"
        value={(data.heading as string) ?? ''}
        onChange={(v) => onChange({ ...data, heading: v })}
      />
      <TextField
        label="العنوان الفرعي"
        value={(data.subheading as string) ?? ''}
        onChange={(v) => onChange({ ...data, subheading: v })}
      />
      <TextareaField
        label="الوصف"
        value={(data.description as string) ?? ''}
        onChange={(v) => onChange({ ...data, description: v })}
      />
      <ImageField
        label="صورة الخلفية"
        value={(data.backgroundImage as string) ?? ''}
        onChange={(v) => onChange({ ...data, backgroundImage: v })}
      />
      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-muted-foreground">الأزرار</label>
        <div className="space-y-2">
          {buttons.map((btn) => (
            <ButtonEditor
              key={btn.id}
              button={btn}
              onChange={(b) =>
                onChange({ ...data, buttons: buttons.map((x) => (x.id === b.id ? b : x)) })
              }
              onDelete={() => onChange({ ...data, buttons: buttons.filter((x) => x.id !== btn.id) })}
            />
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            onChange({
              ...data,
              buttons: [
                ...buttons,
                {
                  id: generateButtonId(),
                  label: 'زر جديد',
                  url: '#',
                  variant: 'primary',
                } satisfies SectionButton,
              ],
            })
          }
        >
          <Plus className="size-3.5" />
          إضافة زر
        </Button>
      </div>
    </div>
  )
}

function HeadingEditor({ section, onChange }: SectionEditorProps) {
  const data = section.data as Record<string, unknown>
  return (
    <div className="space-y-3">
      <TextField
        label="العنوان"
        value={(data.heading as string) ?? ''}
        onChange={(v) => onChange({ ...data, heading: v })}
      />
      <TextField
        label="العنوان الفرعي"
        value={(data.subheading as string) ?? ''}
        onChange={(v) => onChange({ ...data, subheading: v })}
      />
    </div>
  )
}

function TextEditor({ section, onChange }: SectionEditorProps) {
  const data = section.data as Record<string, unknown>
  return (
    <div className="space-y-3">
      <TextField
        label="العنوان"
        value={(data.heading as string) ?? ''}
        onChange={(v) => onChange({ ...data, heading: v })}
      />
      <TextareaField
        label="النص"
        value={(data.body as string) ?? ''}
        onChange={(v) => onChange({ ...data, body: v })}
      />
    </div>
  )
}

function ImageEditor({ section, onChange }: SectionEditorProps) {
  const data = section.data as Record<string, unknown>
  return (
    <div className="space-y-3">
      <ImageField
        label="الصورة"
        value={(data.url as string) ?? ''}
        onChange={(v) => onChange({ ...data, url: v })}
      />
      <TextField
        label="النص البديل"
        value={(data.alt as string) ?? ''}
        onChange={(v) => onChange({ ...data, alt: v })}
      />
      <TextField
        label="التعليق"
        value={(data.caption as string) ?? ''}
        onChange={(v) => onChange({ ...data, caption: v })}
      />
    </div>
  )
}

function ButtonsEditor({ section, onChange }: SectionEditorProps) {
  const data = section.data as Record<string, unknown>
  const buttons = (data.buttons ?? []) as SectionButton[]
  return (
    <div className="space-y-3">
      <TextField
        label="العنوان"
        value={(data.heading as string) ?? ''}
        onChange={(v) => onChange({ ...data, heading: v })}
      />
      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-muted-foreground">الأزرار</label>
        <div className="space-y-2">
          {buttons.map((btn) => (
            <ButtonEditor
              key={btn.id}
              button={btn}
              onChange={(b) =>
                onChange({ ...data, buttons: buttons.map((x) => (x.id === b.id ? b : x)) })
              }
              onDelete={() => onChange({ ...data, buttons: buttons.filter((x) => x.id !== btn.id) })}
            />
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            onChange({
              ...data,
              buttons: [
                ...buttons,
                { id: generateButtonId(), label: 'زر جديد', url: '#', variant: 'primary' },
              ],
            })
          }
        >
          <Plus className="size-3.5" />
          إضافة زر
        </Button>
      </div>
    </div>
  )
}

function StatisticsEditor({ section, onChange }: SectionEditorProps) {
  const data = section.data as Record<string, unknown>
  const stats = (data.stats ?? []) as SectionStat[]
  return (
    <div className="space-y-3">
      <TextField
        label="العنوان"
        value={(data.heading as string) ?? ''}
        onChange={(v) => onChange({ ...data, heading: v })}
      />
      <TextField
        label="الوصف"
        value={(data.description as string) ?? ''}
        onChange={(v) => onChange({ ...data, description: v })}
      />
      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-muted-foreground">الإحصائيات</label>
        <div className="space-y-2">
          {stats.map((stat) => (
            <StatEditor
              key={stat.id}
              stat={stat}
              onChange={(s) =>
                onChange({ ...data, stats: stats.map((x) => (x.id === s.id ? s : x)) })
              }
              onDelete={() =>
                onChange({ ...data, stats: stats.filter((x) => x.id !== stat.id) })
              }
            />
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            onChange({
              ...data,
              stats: [
                ...stats,
                { id: generateStatId(), value: '0', suffix: '+', label: 'تسمية' },
              ],
            })
          }
        >
          <Plus className="size-3.5" />
          إضافة إحصائية
        </Button>
      </div>
    </div>
  )
}

function GalleryEditor({ section, onChange }: SectionEditorProps) {
  const data = section.data as Record<string, unknown>
  const images = (data.images ?? []) as SectionImage[]
  return (
    <div className="space-y-3">
      <TextField
        label="العنوان"
        value={(data.heading as string) ?? ''}
        onChange={(v) => onChange({ ...data, heading: v })}
      />
      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-muted-foreground">الصور</label>
        <div className="space-y-2">
          {images.map((img) => (
            <GalleryImageEditor
              key={img.id}
              image={img}
              onChange={(i) =>
                onChange({ ...data, images: images.map((x) => (x.id === i.id ? i : x)) })
              }
              onDelete={() =>
                onChange({ ...data, images: images.filter((x) => x.id !== img.id) })
              }
            />
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            onChange({
              ...data,
              images: [
                ...images,
                { id: generateImageId(), url: '', alt: '' },
              ],
            })
          }
        >
          <Plus className="size-3.5" />
          إضافة صورة
        </Button>
      </div>
    </div>
  )
}

function CtaEditor({ section, onChange }: SectionEditorProps) {
  const data = section.data as Record<string, unknown>
  return (
    <div className="space-y-3">
      <TextField
        label="العنوان"
        value={(data.heading as string) ?? ''}
        onChange={(v) => onChange({ ...data, heading: v })}
      />
      <TextareaField
        label="الوصف"
        value={(data.description as string) ?? ''}
        onChange={(v) => onChange({ ...data, description: v })}
      />
      <TextField
        label="نص الزر"
        value={(data.buttonLabel as string) ?? ''}
        onChange={(v) => onChange({ ...data, buttonLabel: v })}
      />
      <TextField
        label="رابط الزر"
        value={(data.buttonUrl as string) ?? ''}
        onChange={(v) => onChange({ ...data, buttonUrl: v })}
      />
      <ImageField
        label="صورة الخلفية"
        value={(data.backgroundImage as string) ?? ''}
        onChange={(v) => onChange({ ...data, backgroundImage: v })}
      />
    </div>
  )
}

function FaqEditor({ section, onChange }: SectionEditorProps) {
  const data = section.data as Record<string, unknown>
  const items = (data.items ?? []) as SectionFaqItem[]
  return (
    <div className="space-y-3">
      <TextField
        label="العنوان"
        value={(data.heading as string) ?? ''}
        onChange={(v) => onChange({ ...data, heading: v })}
      />
      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-muted-foreground">
          الأسئلة الشائعة
        </label>
        <div className="space-y-2">
          {items.map((item) => (
            <FaqItemEditor
              key={item.id}
              item={item}
              onChange={(f) =>
                onChange({ ...data, items: items.map((x) => (x.id === f.id ? f : x)) })
              }
              onDelete={() =>
                onChange({ ...data, items: items.filter((x) => x.id !== item.id) })
              }
            />
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            onChange({
              ...data,
              items: [
                ...items,
                { id: generateFaqItemId(), question: '', answer: '' },
              ],
            })
          }
        >
          <Plus className="size-3.5" />
          إضافة سؤال
        </Button>
      </div>
    </div>
  )
}

function VideoEditor({ section, onChange }: SectionEditorProps) {
  const data = section.data as Record<string, unknown>
  return (
    <div className="space-y-3">
      <TextField
        label="العنوان"
        value={(data.heading as string) ?? ''}
        onChange={(v) => onChange({ ...data, heading: v })}
      />
      <TextField
        label="رابط الفيديو"
        value={(data.url as string) ?? ''}
        onChange={(v) => onChange({ ...data, url: v })}
        placeholder="https://youtube.com/watch?v=..."
      />
      <ImageField
        label="صورة الغلاف"
        value={(data.thumbnail as string) ?? ''}
        onChange={(v) => onChange({ ...data, thumbnail: v })}
      />
    </div>
  )
}

import { getCustomSectionEditor } from '@/pages/ContentEditor/components/CustomSectionEditors'

function CustomEditor({ section, onChange }: SectionEditorProps) {
  const data = section.data as Record<string, unknown>
  const Editor = getCustomSectionEditor(data)

  return <Editor data={data} onChange={onChange} />
}

// ---------------------------------------------------------------------------
// Section type registry
// ---------------------------------------------------------------------------

type SectionEditorComponent = React.ComponentType<SectionEditorProps>

const SECTION_EDITORS: Record<SectionType, SectionEditorComponent> = {
  hero: HeroEditor,
  heading: HeadingEditor,
  text: TextEditor,
  image: ImageEditor,
  buttons: ButtonsEditor,
  statistics: StatisticsEditor,
  gallery: GalleryEditor,
  cta: CtaEditor,
  faq: FaqEditor,
  video: VideoEditor,
  custom: CustomEditor,
}

// Add a new section type: register the editor here
export function registerSectionEditor(type: string, component: SectionEditorComponent): void {
  ;(SECTION_EDITORS as Record<string, SectionEditorComponent>)[type] = component
}

// ---------------------------------------------------------------------------
// Main SectionEditor component
// ---------------------------------------------------------------------------

export function SectionEditor({ index, total, ...props }: SectionEditorProps) {
  const { section, onToggle, onDelete, onDuplicate, onMoveUp, onMoveDown } = props
  const [expanded, setExpanded] = useState(true)

  const Editor = SECTION_EDITORS[section.type as SectionType] ?? CustomEditor

  return (
    <div
      className={cn(
        'rounded-xl border bg-card transition-shadow',
        section.enabled ? 'border-border' : 'border-destructive/20 opacity-60',
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-border/60 px-3 py-2">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
        >
          <ChevronDown
            className={cn(
              'size-3.5 shrink-0 text-muted-foreground transition-transform',
              expanded && 'rotate-180',
            )}
          />
          <span className="truncate text-xs font-semibold text-foreground">
            {SECTION_TYPE_LABELS[section.type as SectionType] ?? section.type}
          </span>
          <Badge variant="secondary" className="text-xs">
            {section.type}
          </Badge>
        </button>
        <button
          type="button"
          onClick={() => onToggle(!section.enabled)}
          className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          title={section.enabled ? 'تعطيل' : 'تفعيل'}
        >
          <EyeOff className={cn('size-3.5', !section.enabled && 'text-destructive')} />
        </button>
        <button
          type="button"
          onClick={onDuplicate}
          className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          title="نسخ"
        >
          <Copy className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={onMoveUp}
          disabled={index === 0}
          className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30"
          title="تحريك للأعلى"
        >
          <ArrowUp className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={onMoveDown}
          disabled={index === total - 1}
          className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30"
          title="تحريك للأسفل"
        >
          <ArrowDown className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="rounded-md p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          title="حذف"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>

      {/* Body */}
      <div
        className={cn(
          'grid transition-all duration-200 ease-in-out',
          expanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
        )}
      >
        <div className="overflow-hidden">
          <div className="space-y-3 px-3 py-3">
            <Editor index={index} total={total} {...props} />
          </div>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Add section dropdown
// ---------------------------------------------------------------------------

interface AddSectionMenuProps {
  onAdd: (type: SectionType) => void
}

export function AddSectionMenu({ onAdd }: AddSectionMenuProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 flex items-center gap-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">
        <Plus className="size-3.5" />
        أضف قسماً
      </span>
      {SECTION_TYPES.map((type) => (
        <Button
          key={type}
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onAdd(type)}
        >
          {SECTION_TYPE_LABELS[type]}
        </Button>
      ))}
    </div>
  )
}
