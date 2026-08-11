import {
  ImageIcon,
  Plus,
  Trash2,
} from 'lucide-react'

import {
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
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

// ---------------------------------------------------------------------------
// SectionEditor props
// ---------------------------------------------------------------------------

export interface SectionEditorProps {
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

export function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-muted-foreground">{label}</label>
      {children}
    </div>
  )
}

export function TextField({
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

export function TextareaField({
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

export function ImageField({
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
      <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-xl border border-dashed border-[#E5E7EB] bg-gray-50">
        {value ? (
          <img src={value} alt={label} className="size-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-1.5 text-muted-foreground">
            <ImageIcon className="size-6" />
            <span className="text-xs">No image</span>
          </div>
        )}
      </div>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Image URL"
        className="h-9 text-sm"
      />
    </FieldGroup>
  )
}

export function ButtonEditor({
  button,
  onChange,
  onDelete,
}: {
  button: SectionButton
  onChange: (b: SectionButton) => void
  onDelete: () => void
}) {
  return (
    <div className="flex items-start gap-2 rounded-xl border border-[#E5E7EB] bg-gray-50 p-3">
      <div className="min-w-0 flex-1 space-y-2">
        <Input
          value={button.label}
          onChange={(e) => onChange({ ...button, label: e.target.value })}
          placeholder="Button text"
          className="h-8 text-sm"
        />
        <Input
          value={button.url}
          onChange={(e) => onChange({ ...button, url: e.target.value })}
          placeholder="URL"
          className="h-8 text-sm"
        />
        <select
          value={button.variant}
          onChange={(e) =>
            onChange({ ...button, variant: e.target.value as SectionButton['variant'] })
          }
          className="h-8 w-full rounded-lg border border-[#E5E7EB] bg-transparent px-2.5 text-xs"
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

export function StatEditor({
  stat,
  onChange,
  onDelete,
}: {
  stat: SectionStat
  onChange: (s: SectionStat) => void
  onDelete: () => void
}) {
  return (
    <div className="flex items-start gap-2 rounded-xl border border-[#E5E7EB] bg-gray-50 p-3">
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex gap-2">
          <Input
            value={stat.value}
            onChange={(e) => onChange({ ...stat, value: e.target.value })}
            placeholder="Number"
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
          placeholder="Label"
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

export function GalleryImageEditor({
  image,
  onChange,
  onDelete,
}: {
  image: SectionImage
  onChange: (img: SectionImage) => void
  onDelete: () => void
}) {
  return (
    <div className="flex items-start gap-2 rounded-xl border border-[#E5E7EB] bg-gray-50 p-3">
      <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-muted">
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
          placeholder="Image URL"
          className="h-8 text-sm"
        />
        <Input
          value={image.alt}
          onChange={(e) => onChange({ ...image, alt: e.target.value })}
          placeholder="Alt text"
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

export function FaqItemEditor({
  item,
  onChange,
  onDelete,
}: {
  item: SectionFaqItem
  onChange: (f: SectionFaqItem) => void
  onDelete: () => void
}) {
  return (
    <div className="space-y-2 rounded-xl border border-[#E5E7EB] bg-gray-50 p-3">
      <div className="flex items-center gap-2">
        <Input
          value={item.question}
          onChange={(e) => onChange({ ...item, question: e.target.value })}
          placeholder="Question"
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
        placeholder="Answer"
        className="min-h-16 resize-y text-sm"
      />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Section type editors
// ---------------------------------------------------------------------------

export function HeroEditor({ section, onChange }: SectionEditorProps) {
  const data = section.data as Record<string, unknown>
  const buttons = (data.buttons ?? []) as Array<{ id: string; label_ar?: string; label_fr?: string; url: string; variant: string }>

  return (
    <div className="space-y-3">
      <div className="border border-[#E5E7EB] rounded-lg p-3 space-y-2 bg-[#F8FAFC]">
        <span className="text-xs font-bold text-[#123B78]">Title</span>
        <div className="grid grid-cols-2 gap-2">
          <FieldGroup label="العربية">
            <Input value={(data.heading_ar as string) ?? ''} onChange={(e) => onChange({ ...data, heading_ar: e.target.value })} placeholder="بالعربية" className="h-8 text-sm" />
          </FieldGroup>
          <FieldGroup label="Français">
            <Input value={(data.heading_fr as string) ?? ''} onChange={(e) => onChange({ ...data, heading_fr: e.target.value })} placeholder="en français" className="h-8 text-sm" />
          </FieldGroup>
        </div>
      </div>

      <div className="border border-[#E5E7EB] rounded-lg p-3 space-y-2 bg-[#F8FAFC]">
        <span className="text-xs font-bold text-[#123B78]">Subtitle</span>
        <div className="grid grid-cols-2 gap-2">
          <FieldGroup label="العربية">
            <Input value={(data.subheading_ar as string) ?? ''} onChange={(e) => onChange({ ...data, subheading_ar: e.target.value })} placeholder="بالعربية" className="h-8 text-sm" />
          </FieldGroup>
          <FieldGroup label="Français">
            <Input value={(data.subheading_fr as string) ?? ''} onChange={(e) => onChange({ ...data, subheading_fr: e.target.value })} placeholder="en français" className="h-8 text-sm" />
          </FieldGroup>
        </div>
      </div>

      <div className="border border-[#E5E7EB] rounded-lg p-3 space-y-2 bg-[#F8FAFC]">
        <span className="text-xs font-bold text-[#123B78]">Description</span>
        <div className="grid grid-cols-2 gap-2">
          <FieldGroup label="العربية">
            <Textarea value={(data.description_ar as string) ?? ''} onChange={(e) => onChange({ ...data, description_ar: e.target.value })} placeholder="بالعربية" className="min-h-20 resize-y text-sm" />
          </FieldGroup>
          <FieldGroup label="Français">
            <Textarea value={(data.description_fr as string) ?? ''} onChange={(e) => onChange({ ...data, description_fr: e.target.value })} placeholder="en français" className="min-h-20 resize-y text-sm" />
          </FieldGroup>
        </div>
      </div>

      <ImageField
        label="Background Image"
        value={(data.backgroundImage as string) ?? ''}
        onChange={(v) => onChange({ ...data, backgroundImage: v })}
      />

      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-muted-foreground">Buttons</label>
        <div className="space-y-2">
          {buttons.map((btn) => (
            <div key={btn.id} className="relative space-y-2 rounded-xl border border-[#E5E7EB] bg-gray-50 p-3">
              <div className="border border-[#E5E7EB] rounded-lg p-2 space-y-1 bg-white">
                <span className="text-xs font-bold text-[#64748B]">Label</span>
                <div className="grid grid-cols-2 gap-2">
                  <Input value={btn.label_ar ?? ''} onChange={(e) => onChange({ ...data, buttons: buttons.map((x) => (x.id === btn.id ? { ...x, label_ar: e.target.value } : x)) })} placeholder="بالعربية" className="h-8 text-sm" />
                  <Input value={btn.label_fr ?? ''} onChange={(e) => onChange({ ...data, buttons: buttons.map((x) => (x.id === btn.id ? { ...x, label_fr: e.target.value } : x)) })} placeholder="en français" className="h-8 text-sm" />
                </div>
              </div>
              <Input value={btn.url} onChange={(e) => onChange({ ...data, buttons: buttons.map((x) => (x.id === btn.id ? { ...x, url: e.target.value } : x)) })} placeholder="URL" className="h-8 text-sm" />
              <select
                value={btn.variant}
                onChange={(e) => onChange({ ...data, buttons: buttons.map((x) => (x.id === btn.id ? { ...x, variant: e.target.value } : x)) })}
                className="h-8 w-full rounded-lg border border-[#E5E7EB] bg-transparent px-2.5 text-xs"
              >
                <option value="primary">Primary</option>
                <option value="secondary">Secondary</option>
                <option value="outline">Outline</option>
              </select>
              <button type="button" onClick={() => onChange({ ...data, buttons: buttons.filter((x) => x.id !== btn.id) })} className="absolute right-2 top-2 rounded p-0.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                <Trash2 className="size-3.5" />
              </button>
            </div>
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
                  label_ar: '',
                  label_fr: '',
                  url: '#',
                  variant: 'primary',
                },
              ],
            })
          }
        >
          <Plus className="size-3.5" />
          Add Button
        </Button>
      </div>
    </div>
  )
}

export function HeadingEditor({ section, onChange }: SectionEditorProps) {
  const data = section.data as Record<string, unknown>
  return (
    <div className="space-y-3">
      <TextField
        label="Heading"
        value={(data.heading as string) ?? ''}
        onChange={(v) => onChange({ ...data, heading: v })}
      />
      <TextField
        label="Subtitle"
        value={(data.subheading as string) ?? ''}
        onChange={(v) => onChange({ ...data, subheading: v })}
      />
    </div>
  )
}

export function TextEditor({ section, onChange }: SectionEditorProps) {
  const data = section.data as Record<string, unknown>
  return (
    <div className="space-y-3">
      <TextField
        label="Heading"
        value={(data.heading as string) ?? ''}
        onChange={(v) => onChange({ ...data, heading: v })}
      />
      <TextareaField
        label="Body Text"
        value={(data.body as string) ?? ''}
        onChange={(v) => onChange({ ...data, body: v })}
      />
    </div>
  )
}

export function ImageEditor({ section, onChange }: SectionEditorProps) {
  const data = section.data as Record<string, unknown>
  return (
    <div className="space-y-3">
      <ImageField
        label="Image"
        value={(data.url as string) ?? ''}
        onChange={(v) => onChange({ ...data, url: v })}
      />
      <TextField
        label="Alt Text"
        value={(data.alt as string) ?? ''}
        onChange={(v) => onChange({ ...data, alt: v })}
      />
      <TextField
        label="Caption"
        value={(data.caption as string) ?? ''}
        onChange={(v) => onChange({ ...data, caption: v })}
      />
    </div>
  )
}

export function ButtonsEditor({ section, onChange }: SectionEditorProps) {
  const data = section.data as Record<string, unknown>
  const buttons = (data.buttons ?? []) as SectionButton[]
  return (
    <div className="space-y-3">
      <TextField
        label="Heading"
        value={(data.heading as string) ?? ''}
        onChange={(v) => onChange({ ...data, heading: v })}
      />
      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-muted-foreground">Buttons</label>
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
                { id: generateButtonId(), label: 'New Button', url: '#', variant: 'primary' },
              ],
            })
          }
        >
          <Plus className="size-3.5" />
          Add Button
        </Button>
      </div>
    </div>
  )
}

export function StatisticsEditor({ section, onChange }: SectionEditorProps) {
  const data = section.data as Record<string, unknown>
  const stats = (data.stats ?? []) as SectionStat[]
  return (
    <div className="space-y-3">
      <TextField
        label="Heading"
        value={(data.heading as string) ?? ''}
        onChange={(v) => onChange({ ...data, heading: v })}
      />
      <TextField
        label="Description"
        value={(data.description as string) ?? ''}
        onChange={(v) => onChange({ ...data, description: v })}
      />
      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-muted-foreground">Statistics</label>
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
                { id: generateStatId(), value: '0', suffix: '+', label: 'Label' },
              ],
            })
          }
        >
          <Plus className="size-3.5" />
          Add Stat
        </Button>
      </div>
    </div>
  )
}

export function GalleryEditor({ section, onChange }: SectionEditorProps) {
  const data = section.data as Record<string, unknown>
  const images = (data.images ?? []) as SectionImage[]
  return (
    <div className="space-y-3">
      <TextField
        label="Heading"
        value={(data.heading as string) ?? ''}
        onChange={(v) => onChange({ ...data, heading: v })}
      />
      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-muted-foreground">Images</label>
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
          Add Image
        </Button>
      </div>
    </div>
  )
}

export function CtaEditor({ section, onChange }: SectionEditorProps) {
  const data = section.data as Record<string, unknown>
  return (
    <div className="space-y-3">
      <div className="border border-[#E5E7EB] rounded-lg p-3 space-y-2 bg-[#F8FAFC]">
        <span className="text-xs font-bold text-[#123B78]">Heading</span>
        <div className="grid grid-cols-2 gap-2">
          <FieldGroup label="العربية">
            <Input value={(data.heading_ar as string) ?? ''} onChange={(e) => onChange({ ...data, heading_ar: e.target.value })} placeholder="بالعربية" className="h-8 text-sm" />
          </FieldGroup>
          <FieldGroup label="Français">
            <Input value={(data.heading_fr as string) ?? ''} onChange={(e) => onChange({ ...data, heading_fr: e.target.value })} placeholder="en français" className="h-8 text-sm" />
          </FieldGroup>
        </div>
      </div>

      <div className="border border-[#E5E7EB] rounded-lg p-3 space-y-2 bg-[#F8FAFC]">
        <span className="text-xs font-bold text-[#123B78]">Description</span>
        <div className="grid grid-cols-2 gap-2">
          <FieldGroup label="العربية">
            <Textarea value={(data.description_ar as string) ?? ''} onChange={(e) => onChange({ ...data, description_ar: e.target.value })} placeholder="بالعربية" className="min-h-16 resize-y text-sm" />
          </FieldGroup>
          <FieldGroup label="Français">
            <Textarea value={(data.description_fr as string) ?? ''} onChange={(e) => onChange({ ...data, description_fr: e.target.value })} placeholder="en français" className="min-h-16 resize-y text-sm" />
          </FieldGroup>
        </div>
      </div>

      <div className="border border-[#E5E7EB] rounded-lg p-3 space-y-2 bg-[#F8FAFC]">
        <span className="text-xs font-bold text-[#123B78]">Button Text</span>
        <div className="grid grid-cols-2 gap-2">
          <FieldGroup label="العربية">
            <Input value={(data.buttonLabel_ar as string) ?? ''} onChange={(e) => onChange({ ...data, buttonLabel_ar: e.target.value })} placeholder="بالعربية" className="h-8 text-sm" />
          </FieldGroup>
          <FieldGroup label="Français">
            <Input value={(data.buttonLabel_fr as string) ?? ''} onChange={(e) => onChange({ ...data, buttonLabel_fr: e.target.value })} placeholder="en français" className="h-8 text-sm" />
          </FieldGroup>
        </div>
      </div>

      <input
        type="text"
        value={(data.buttonUrl as string) ?? ''}
        onChange={(e) => onChange({ ...data, buttonUrl: e.target.value })}
        placeholder="Button URL"
        className="h-9 w-full rounded-lg border border-[#E5E7EB] bg-transparent px-3 text-sm"
      />

      <ImageField
        label="Background Image"
        value={(data.backgroundImage as string) ?? ''}
        onChange={(v) => onChange({ ...data, backgroundImage: v })}
      />
    </div>
  )
}

export function FaqEditor({ section, onChange }: SectionEditorProps) {
  const data = section.data as Record<string, unknown>
  const items = (data.items ?? []) as SectionFaqItem[]
  return (
    <div className="space-y-3">
      <TextField
        label="Heading"
        value={(data.heading as string) ?? ''}
        onChange={(v) => onChange({ ...data, heading: v })}
      />
      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-muted-foreground">Questions</label>
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
          Add Question
        </Button>
      </div>
    </div>
  )
}

export function VideoEditor({ section, onChange }: SectionEditorProps) {
  const data = section.data as Record<string, unknown>
  return (
    <div className="space-y-3">
      <TextField
        label="Heading"
        value={(data.heading as string) ?? ''}
        onChange={(v) => onChange({ ...data, heading: v })}
      />
      <TextField
        label="Video URL"
        value={(data.url as string) ?? ''}
        onChange={(v) => onChange({ ...data, url: v })}
        placeholder="https://youtube.com/watch?v=..."
      />
      <ImageField
        label="Thumbnail"
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

export const SECTION_EDITORS: Record<SectionType, SectionEditorComponent> = {
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

export function registerSectionEditor(type: string, component: SectionEditorComponent): void {
  ;(SECTION_EDITORS as Record<string, SectionEditorComponent>)[type] = component
}
