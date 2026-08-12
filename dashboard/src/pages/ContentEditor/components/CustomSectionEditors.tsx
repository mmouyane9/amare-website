import { ImageIcon, Plus, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-muted-foreground">{label}</label>
      {children}
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
      {children}
    </p>
  )
}

// ---------------------------------------------------------------------------
// RepeaterItem — generic card with delete button
// ---------------------------------------------------------------------------

function RepeaterItem({
  onDelete,
  children,
}: {
  onDelete: () => void
  children: React.ReactNode
}) {
  return (
    <div className="relative space-y-2 rounded-lg border border-border/60 bg-muted/30 p-2.5">
      {children}
      <button
        type="button"
        onClick={onDelete}
        className="absolute right-2 top-2 rounded p-0.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
        title="حذف"
      >
        <Trash2 className="size-3.5" />
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Props for all custom editors
// ---------------------------------------------------------------------------

interface CustomEditorProps {
  data: Record<string, unknown>
  onChange: (data: Record<string, unknown>) => void
}

// =====================================================================
// ABOUT EDITOR  (_renderer: "about")
// =====================================================================

function AboutEditor({ data, onChange }: CustomEditorProps) {
  const paragraphsAr = (data.paragraphs_ar ?? []) as string[]
  const paragraphsFr = (data.paragraphs_fr ?? []) as string[]
  const maxLen = Math.max(paragraphsAr.length, paragraphsFr.length)
  const features = (data.features ?? []) as Array<{ title_ar: string; title_fr: string; description_ar: string; description_fr: string }>
  const buttons = (data.buttons ?? []) as Array<{ id: string; label?: string; label_ar?: string; label_fr?: string; url: string; variant: string }>
  const image = (data.image ?? { url: '', alt_ar: '', alt_fr: '' }) as { url: string; alt_ar: string; alt_fr: string }
  const stats = (data.stats ?? []) as Array<{ value: string; suffix: string; label_ar: string; label_fr: string }>

  return (
    <div className="space-y-3">
      <div className="border border-[#E5E7EB] rounded-lg p-3 space-y-2 bg-[#F8FAFC]">
        <span className="text-xs font-bold text-[#123B78]">العنوان الفرعي (Eyebrow)</span>
        <div className="grid grid-cols-2 gap-2">
          <FieldGroup label="العربية">
            <Input value={(data.eyebrow_ar as string) ?? ''} onChange={(e) => onChange({ ...data, eyebrow_ar: e.target.value })} placeholder="بالعربية" className="h-8 text-sm" />
          </FieldGroup>
          <FieldGroup label="Français">
            <Input value={(data.eyebrow_fr as string) ?? ''} onChange={(e) => onChange({ ...data, eyebrow_fr: e.target.value })} placeholder="en français" className="h-8 text-sm" />
          </FieldGroup>
        </div>
      </div>

      <div className="border border-[#E5E7EB] rounded-lg p-3 space-y-2 bg-[#F8FAFC]">
        <span className="text-xs font-bold text-[#123B78]">العنوان الرئيسي</span>
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
        <span className="text-xs font-bold text-[#123B78]">الكلمة المميزة</span>
        <div className="grid grid-cols-2 gap-2">
          <FieldGroup label="العربية">
            <Input value={(data.headingHighlight_ar as string) ?? ''} onChange={(e) => onChange({ ...data, headingHighlight_ar: e.target.value })} placeholder="بالعربية" className="h-8 text-sm" />
          </FieldGroup>
          <FieldGroup label="Français">
            <Input value={(data.headingHighlight_fr as string) ?? ''} onChange={(e) => onChange({ ...data, headingHighlight_fr: e.target.value })} placeholder="en français" className="h-8 text-sm" />
          </FieldGroup>
        </div>
      </div>

      <div className="border border-[#E5E7EB] rounded-lg p-3 space-y-2 bg-[#F8FAFC]">
        <span className="text-xs font-bold text-[#123B78]">الوصف</span>
        <div className="grid grid-cols-2 gap-2">
          <FieldGroup label="العربية">
            <Input value={(data.description_ar as string) ?? ''} onChange={(e) => onChange({ ...data, description_ar: e.target.value })} placeholder="بالعربية" className="h-8 text-sm" />
          </FieldGroup>
          <FieldGroup label="Français">
            <Input value={(data.description_fr as string) ?? ''} onChange={(e) => onChange({ ...data, description_fr: e.target.value })} placeholder="en français" className="h-8 text-sm" />
          </FieldGroup>
        </div>
      </div>

      {/* Paragraphs */}
      <div className="space-y-2">
        <SectionLabel>الفقرات</SectionLabel>
        {Array.from({ length: maxLen }).map((_, i) => (
          <RepeaterItem key={i} onDelete={() => {
            const ar = [...paragraphsAr]; ar.splice(i, 1)
            const fr = [...paragraphsFr]; fr.splice(i, 1)
            onChange({ ...data, paragraphs_ar: ar, paragraphs_fr: fr })
          }}>
            <div className="space-y-1.5 pr-5">
              <FieldGroup label="العربية">
                <Textarea value={paragraphsAr[i] ?? ''} onChange={(e) => {
                  const ar = [...paragraphsAr]; ar[i] = e.target.value
                  onChange({ ...data, paragraphs_ar: ar })
                }} placeholder="بالعربية" className="min-h-16 resize-y text-sm" />
              </FieldGroup>
              <FieldGroup label="Français">
                <Textarea value={paragraphsFr[i] ?? ''} onChange={(e) => {
                  const fr = [...paragraphsFr]; fr[i] = e.target.value
                  onChange({ ...data, paragraphs_fr: fr })
                }} placeholder="en français" className="min-h-16 resize-y text-sm" />
              </FieldGroup>
            </div>
          </RepeaterItem>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => onChange({ ...data, paragraphs_ar: [...paragraphsAr, ''], paragraphs_fr: [...paragraphsFr, ''] })}>
          <Plus className="size-3.5" /> إضافة فقرة
        </Button>
      </div>

      {/* Features */}
      <div className="space-y-2">
        <SectionLabel>المميزات</SectionLabel>
        {features.map((f, i) => (
          <RepeaterItem key={i} onDelete={() => onChange({ ...data, features: features.filter((_, j) => j !== i) })}>
            <div className="space-y-1.5 pr-5">
              <div className="border border-[#E5E7EB] rounded-lg p-2 space-y-1 bg-[#F8FAFC]">
                <span className="text-xs font-bold text-[#64748B]">العنوان</span>
                <div className="grid grid-cols-2 gap-2">
                  <Input value={f.title_ar ?? ''} onChange={(e) => onChange({ ...data, features: features.map((x, j) => (j === i ? { ...x, title_ar: e.target.value } : x)) })} placeholder="بالعربية" className="h-8 text-sm" />
                  <Input value={f.title_fr ?? ''} onChange={(e) => onChange({ ...data, features: features.map((x, j) => (j === i ? { ...x, title_fr: e.target.value } : x)) })} placeholder="en français" className="h-8 text-sm" />
                </div>
              </div>
              <div className="border border-[#E5E7EB] rounded-lg p-2 space-y-1 bg-[#F8FAFC]">
                <span className="text-xs font-bold text-[#64748B]">الوصف</span>
                <div className="grid grid-cols-2 gap-2">
                  <Input value={f.description_ar ?? ''} onChange={(e) => onChange({ ...data, features: features.map((x, j) => (j === i ? { ...x, description_ar: e.target.value } : x)) })} placeholder="بالعربية" className="h-8 text-sm" />
                  <Input value={f.description_fr ?? ''} onChange={(e) => onChange({ ...data, features: features.map((x, j) => (j === i ? { ...x, description_fr: e.target.value } : x)) })} placeholder="en français" className="h-8 text-sm" />
                </div>
              </div>
            </div>
          </RepeaterItem>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => onChange({ ...data, features: [...features, { title_ar: '', title_fr: '', description_ar: '', description_fr: '' }] })}>
          <Plus className="size-3.5" /> إضافة ميزة
        </Button>
      </div>

      {/* Buttons */}
      <div className="space-y-2">
        <SectionLabel>الأزرار</SectionLabel>
        {buttons.map((btn, i) => (
          <RepeaterItem key={btn.id || i} onDelete={() => onChange({ ...data, buttons: buttons.filter((_, j) => j !== i) })}>
            <div className="space-y-2 pr-5">
              <div className="border border-[#E5E7EB] rounded-lg p-2 space-y-1 bg-[#F8FAFC]">
                <span className="text-xs font-bold text-[#64748B]">نص الزر</span>
                <div className="grid grid-cols-2 gap-2">
                  <Input value={btn.label_ar ?? ''} onChange={(e) => onChange({ ...data, buttons: buttons.map((x, j) => (j === i ? { ...x, label_ar: e.target.value } : x)) })} placeholder="بالعربية" className="h-8 text-sm" />
                  <Input value={btn.label_fr ?? ''} onChange={(e) => onChange({ ...data, buttons: buttons.map((x, j) => (j === i ? { ...x, label_fr: e.target.value } : x)) })} placeholder="en français" className="h-8 text-sm" />
                </div>
              </div>
              <Input value={btn.url} onChange={(e) => onChange({ ...data, buttons: buttons.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)) })} placeholder="الرابط" className="h-8 text-sm" />
            </div>
          </RepeaterItem>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => onChange({ ...data, buttons: [...buttons, { id: `btn-${Date.now()}`, label_ar: '', label_fr: '', url: '#', variant: 'primary' }] })}>
          <Plus className="size-3.5" /> إضافة زر
        </Button>
      </div>

      {/* Image */}
      <FieldGroup label="الصورة">
        <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-lg border border-dashed bg-muted/40">
          {image.url ? <img src={image.url} alt={image.alt_ar} className="size-full object-cover" /> : <ImageIcon className="size-6 text-muted-foreground" />}
        </div>
        <Input value={image.url} onChange={(e) => onChange({ ...data, image: { ...image, url: e.target.value } })} placeholder="رابط الصورة" className="h-9 text-sm" />
        <div className="border border-[#E5E7EB] rounded-lg p-3 space-y-2 bg-[#F8FAFC]">
          <span className="text-xs font-bold text-[#123B78]">النص البديل</span>
          <div className="grid grid-cols-2 gap-2">
            <FieldGroup label="العربية">
              <Input value={image.alt_ar ?? ''} onChange={(e) => onChange({ ...data, image: { ...image, alt_ar: e.target.value } })} placeholder="بالعربية" className="h-8 text-sm" />
            </FieldGroup>
            <FieldGroup label="Français">
              <Input value={image.alt_fr ?? ''} onChange={(e) => onChange({ ...data, image: { ...image, alt_fr: e.target.value } })} placeholder="en français" className="h-8 text-sm" />
            </FieldGroup>
          </div>
        </div>
      </FieldGroup>

      {/* Stats */}
      <div className="space-y-2">
        <SectionLabel>الإحصائيات</SectionLabel>
        <div className="grid grid-cols-3 gap-2">
          {stats.map((s, i) => (
            <div key={i} className="relative space-y-1 rounded-lg border border-border/60 bg-muted/30 p-2">
              <button type="button" onClick={() => onChange({ ...data, stats: stats.filter((_, j) => j !== i) })} className="absolute right-1 top-1 rounded p-0.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                <Trash2 className="size-3" />
              </button>
              <Input value={s.value} onChange={(e) => onChange({ ...data, stats: stats.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)) })} placeholder="0" className="h-8 text-center text-sm font-bold" />
              <Input value={s.suffix} onChange={(e) => onChange({ ...data, stats: stats.map((x, j) => (j === i ? { ...x, suffix: e.target.value } : x)) })} placeholder="+" className="h-8 text-center text-sm" />
              <div className="space-y-1">
                <Input value={s.label_ar ?? ''} onChange={(e) => onChange({ ...data, stats: stats.map((x, j) => (j === i ? { ...x, label_ar: e.target.value } : x)) })} placeholder="تسمية (عربي)" className="h-8 text-center text-xs" />
                <Input value={s.label_fr ?? ''} onChange={(e) => onChange({ ...data, stats: stats.map((x, j) => (j === i ? { ...x, label_fr: e.target.value } : x)) })} placeholder="تسمية (FR)" className="h-8 text-center text-xs" />
              </div>
            </div>
          ))}
        </div>
        <Button type="button" variant="outline" size="sm" onClick={() => onChange({ ...data, stats: [...stats, { value: '0', suffix: '+', label_ar: '', label_fr: '' }] })}>
          <Plus className="size-3.5" /> إضافة إحصائية
        </Button>
      </div>
    </div>
  )
}

// =====================================================================
// FEATURES GRID EDITOR  (_renderer: "featuresGrid")
// =====================================================================

function FeaturesGridEditor({ data, onChange }: CustomEditorProps) {
  const cards = (data.cards ?? []) as Array<{ heading_ar: string; heading_fr: string; description_ar: string; description_fr: string }>

  return (
    <div className="space-y-3">
      <div className="border border-[#E5E7EB] rounded-lg p-3 space-y-2 bg-[#F8FAFC]">
        <span className="text-xs font-bold text-[#123B78]">العنوان الفرعي (Eyebrow)</span>
        <div className="grid grid-cols-2 gap-2">
          <FieldGroup label="العربية">
            <Input value={(data.eyebrow_ar as string) ?? ''} onChange={(e) => onChange({ ...data, eyebrow_ar: e.target.value })} placeholder="بالعربية" className="h-8 text-sm" />
          </FieldGroup>
          <FieldGroup label="Français">
            <Input value={(data.eyebrow_fr as string) ?? ''} onChange={(e) => onChange({ ...data, eyebrow_fr: e.target.value })} placeholder="en français" className="h-8 text-sm" />
          </FieldGroup>
        </div>
      </div>

      <div className="border border-[#E5E7EB] rounded-lg p-3 space-y-2 bg-[#F8FAFC]">
        <span className="text-xs font-bold text-[#123B78]">العنوان الرئيسي</span>
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
        <span className="text-xs font-bold text-[#123B78]">الوصف</span>
        <div className="grid grid-cols-2 gap-2">
          <FieldGroup label="العربية">
            <Textarea value={(data.description_ar as string) ?? ''} onChange={(e) => onChange({ ...data, description_ar: e.target.value })} placeholder="بالعربية" className="min-h-16 resize-y text-sm" />
          </FieldGroup>
          <FieldGroup label="Français">
            <Textarea value={(data.description_fr as string) ?? ''} onChange={(e) => onChange({ ...data, description_fr: e.target.value })} placeholder="en français" className="min-h-16 resize-y text-sm" />
          </FieldGroup>
        </div>
      </div>

      <div className="space-y-2">
        <SectionLabel>البطاقات</SectionLabel>
        {cards.map((card, i) => (
          <RepeaterItem key={i} onDelete={() => onChange({ ...data, cards: cards.filter((_, j) => j !== i) })}>
            <div className="space-y-1.5 pr-5">
              <div className="border border-[#E5E7EB] rounded-lg p-2 space-y-1 bg-[#F8FAFC]">
                <span className="text-xs font-bold text-[#64748B]">العنوان</span>
                <div className="grid grid-cols-2 gap-2">
                  <Input value={card.heading_ar ?? ''} onChange={(e) => onChange({ ...data, cards: cards.map((x, j) => (j === i ? { ...x, heading_ar: e.target.value } : x)) })} placeholder="بالعربية" className="h-8 text-sm" />
                  <Input value={card.heading_fr ?? ''} onChange={(e) => onChange({ ...data, cards: cards.map((x, j) => (j === i ? { ...x, heading_fr: e.target.value } : x)) })} placeholder="en français" className="h-8 text-sm" />
                </div>
              </div>
              <div className="border border-[#E5E7EB] rounded-lg p-2 space-y-1 bg-[#F8FAFC]">
                <span className="text-xs font-bold text-[#64748B]">الوصف</span>
                <div className="grid grid-cols-2 gap-2">
                  <Textarea value={card.description_ar ?? ''} onChange={(e) => onChange({ ...data, cards: cards.map((x, j) => (j === i ? { ...x, description_ar: e.target.value } : x)) })} placeholder="بالعربية" className="min-h-12 resize-y text-sm" />
                  <Textarea value={card.description_fr ?? ''} onChange={(e) => onChange({ ...data, cards: cards.map((x, j) => (j === i ? { ...x, description_fr: e.target.value } : x)) })} placeholder="en français" className="min-h-12 resize-y text-sm" />
                </div>
              </div>
            </div>
          </RepeaterItem>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => onChange({ ...data, cards: [...cards, { heading_ar: '', heading_fr: '', description_ar: '', description_fr: '' }] })}>
          <Plus className="size-3.5" /> إضافة بطاقة
        </Button>
      </div>
    </div>
  )
}

// =====================================================================
// ACTIVITIES GRID EDITOR  (_renderer: "activitiesGrid")
// =====================================================================

function ActivitiesGridEditor({ data, onChange }: CustomEditorProps) {
  const cards = (data.cards ?? []) as Array<{
    title_ar: string
    title_fr: string
    description_ar: string
    description_fr: string
    image: string
    linkText_ar: string
    linkText_fr: string
    linkUrl: string
  }>

  return (
    <div className="space-y-3">
      <div className="border border-[#E5E7EB] rounded-lg p-3 space-y-2 bg-[#F8FAFC]">
        <span className="text-xs font-bold text-[#123B78]">العنوان الرئيسي</span>
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
        <span className="text-xs font-bold text-[#123B78]">الوصف</span>
        <div className="grid grid-cols-2 gap-2">
          <FieldGroup label="العربية">
            <Input value={(data.description_ar as string) ?? ''} onChange={(e) => onChange({ ...data, description_ar: e.target.value })} placeholder="بالعربية" className="h-8 text-sm" />
          </FieldGroup>
          <FieldGroup label="Français">
            <Input value={(data.description_fr as string) ?? ''} onChange={(e) => onChange({ ...data, description_fr: e.target.value })} placeholder="en français" className="h-8 text-sm" />
          </FieldGroup>
        </div>
      </div>

      <div className="space-y-2">
        <SectionLabel>البطاقات</SectionLabel>
        {cards.map((card, i) => (
          <RepeaterItem key={i} onDelete={() => onChange({ ...data, cards: cards.filter((_, j) => j !== i) })}>
            <div className="space-y-1.5 pr-5">
              <div className="relative aspect-video w-full overflow-hidden rounded-md bg-muted">
                {card.image ? (
                  <img src={card.image} alt="" className="size-full object-cover" />
                ) : (
                  <div className="flex size-full items-center justify-center">
                    <ImageIcon className="size-5 text-muted-foreground" />
                  </div>
                )}
              </div>
              <Input value={card.image} onChange={(e) => onChange({ ...data, cards: cards.map((x, j) => (j === i ? { ...x, image: e.target.value } : x)) })} placeholder="رابط الصورة" className="h-8 text-sm" />
              <div className="border border-[#E5E7EB] rounded-lg p-2 space-y-1 bg-[#F8FAFC]">
                <span className="text-xs font-bold text-[#64748B]">العنوان</span>
                <div className="grid grid-cols-2 gap-2">
                  <Input value={card.title_ar ?? ''} onChange={(e) => onChange({ ...data, cards: cards.map((x, j) => (j === i ? { ...x, title_ar: e.target.value } : x)) })} placeholder="بالعربية" className="h-8 text-sm" />
                  <Input value={card.title_fr ?? ''} onChange={(e) => onChange({ ...data, cards: cards.map((x, j) => (j === i ? { ...x, title_fr: e.target.value } : x)) })} placeholder="en français" className="h-8 text-sm" />
                </div>
              </div>
              <div className="border border-[#E5E7EB] rounded-lg p-2 space-y-1 bg-[#F8FAFC]">
                <span className="text-xs font-bold text-[#64748B]">الوصف</span>
                <div className="grid grid-cols-2 gap-2">
                  <Textarea value={card.description_ar ?? ''} onChange={(e) => onChange({ ...data, cards: cards.map((x, j) => (j === i ? { ...x, description_ar: e.target.value } : x)) })} placeholder="بالعربية" className="min-h-12 resize-y text-sm" />
                  <Textarea value={card.description_fr ?? ''} onChange={(e) => onChange({ ...data, cards: cards.map((x, j) => (j === i ? { ...x, description_fr: e.target.value } : x)) })} placeholder="en français" className="min-h-12 resize-y text-sm" />
                </div>
              </div>
              <div className="border border-[#E5E7EB] rounded-lg p-2 space-y-1 bg-[#F8FAFC]">
                <span className="text-xs font-bold text-[#64748B]">نص الرابط</span>
                <div className="grid grid-cols-2 gap-2">
                  <Input value={card.linkText_ar ?? ''} onChange={(e) => onChange({ ...data, cards: cards.map((x, j) => (j === i ? { ...x, linkText_ar: e.target.value } : x)) })} placeholder="بالعربية" className="h-8 text-sm" />
                  <Input value={card.linkText_fr ?? ''} onChange={(e) => onChange({ ...data, cards: cards.map((x, j) => (j === i ? { ...x, linkText_fr: e.target.value } : x)) })} placeholder="en français" className="h-8 text-sm" />
                </div>
              </div>
              <Input value={card.linkUrl} onChange={(e) => onChange({ ...data, cards: cards.map((x, j) => (j === i ? { ...x, linkUrl: e.target.value } : x)) })} placeholder="الرابط" className="h-8 text-sm" />
            </div>
          </RepeaterItem>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => onChange({ ...data, cards: [...cards, { title_ar: '', title_fr: '', description_ar: '', description_fr: '', image: '', linkText_ar: '', linkText_fr: '', linkUrl: '#' }] })}>
          <Plus className="size-3.5" /> إضافة بطاقة
        </Button>
      </div>
    </div>
  )
}

// =====================================================================
// ACTIVITIES CTA EDITOR  (_renderer: "activitiesCta")
// =====================================================================

function ActivitiesCtaEditor({ data, onChange }: CustomEditorProps) {
  const buttons = (data.buttons ?? []) as Array<{
    id: string
    label_ar: string
    label_fr: string
    url: string
    variant: string
  }>

  return (
    <div className="space-y-3">
      <div className="border border-[#E5E7EB] rounded-lg p-3 space-y-2 bg-[#F8FAFC]">
        <span className="text-xs font-bold text-[#123B78]">العنوان الرئيسي</span>
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
        <span className="text-xs font-bold text-[#123B78]">الوصف</span>
        <div className="grid grid-cols-2 gap-2">
          <FieldGroup label="العربية">
            <Textarea value={(data.description_ar as string) ?? ''} onChange={(e) => onChange({ ...data, description_ar: e.target.value })} placeholder="بالعربية" className="min-h-16 resize-y text-sm" />
          </FieldGroup>
          <FieldGroup label="Français">
            <Textarea value={(data.description_fr as string) ?? ''} onChange={(e) => onChange({ ...data, description_fr: e.target.value })} placeholder="en français" className="min-h-16 resize-y text-sm" />
          </FieldGroup>
        </div>
      </div>

      <div className="space-y-2">
        <SectionLabel>الأزرار</SectionLabel>
        {buttons.map((btn, i) => (
          <RepeaterItem key={btn.id || i} onDelete={() => onChange({ ...data, buttons: buttons.filter((_, j) => j !== i) })}>
            <div className="space-y-1.5 pr-5">
              <div className="border border-[#E5E7EB] rounded-lg p-2 space-y-1 bg-[#F8FAFC]">
                <span className="text-xs font-bold text-[#64748B]">نص الزر</span>
                <div className="grid grid-cols-2 gap-2">
                  <Input value={btn.label_ar ?? ''} onChange={(e) => onChange({ ...data, buttons: buttons.map((x, j) => (j === i ? { ...x, label_ar: e.target.value } : x)) })} placeholder="بالعربية" className="h-8 text-sm" />
                  <Input value={btn.label_fr ?? ''} onChange={(e) => onChange({ ...data, buttons: buttons.map((x, j) => (j === i ? { ...x, label_fr: e.target.value } : x)) })} placeholder="en français" className="h-8 text-sm" />
                </div>
              </div>
              <Input value={btn.url} onChange={(e) => onChange({ ...data, buttons: buttons.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)) })} placeholder="الرابط" className="h-8 text-sm" />
              <select
                value={btn.variant}
                onChange={(e) => onChange({ ...data, buttons: buttons.map((x, j) => (j === i ? { ...x, variant: e.target.value } : x)) })}
                className="h-8 w-full rounded-lg border border-[#E5E7EB] bg-transparent px-2.5 text-xs"
              >
                <option value="primary">Primary</option>
                <option value="secondary">Secondary</option>
                <option value="outline">Outline</option>
              </select>
            </div>
          </RepeaterItem>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => onChange({ ...data, buttons: [...buttons, { id: 'btn-' + Date.now(), label_ar: '', label_fr: '', url: '#', variant: 'primary' }] })}>
          <Plus className="size-3.5" /> إضافة زر
        </Button>
      </div>
    </div>
  )
}

// =====================================================================
// NEWS GRID EDITOR  (_renderer: "newsGrid")
// =====================================================================

function NewsGridEditor({ data, onChange }: CustomEditorProps) {
  const cards = (data.cards ?? []) as Array<{
    title_ar: string; title_fr: string
    date: string
    badge_ar: string; badge_fr: string
    image: string
    linkText_ar: string; linkText_fr: string
    linkUrl: string
  }>

  return (
    <div className="space-y-3">
      <div className="border border-[#E5E7EB] rounded-lg p-3 space-y-2 bg-[#F8FAFC]">
        <span className="text-xs font-bold text-[#123B78]">العنوان الفرعي (Eyebrow)</span>
        <div className="grid grid-cols-2 gap-2">
          <FieldGroup label="العربية">
            <Input value={(data.eyebrow_ar as string) ?? ''} onChange={(e) => onChange({ ...data, eyebrow_ar: e.target.value })} placeholder="بالعربية" className="h-8 text-sm" />
          </FieldGroup>
          <FieldGroup label="Français">
            <Input value={(data.eyebrow_fr as string) ?? ''} onChange={(e) => onChange({ ...data, eyebrow_fr: e.target.value })} placeholder="en français" className="h-8 text-sm" />
          </FieldGroup>
        </div>
      </div>

      <div className="border border-[#E5E7EB] rounded-lg p-3 space-y-2 bg-[#F8FAFC]">
        <span className="text-xs font-bold text-[#123B78]">العنوان الرئيسي</span>
        <div className="grid grid-cols-2 gap-2">
          <FieldGroup label="العربية">
            <Input value={(data.heading_ar as string) ?? ''} onChange={(e) => onChange({ ...data, heading_ar: e.target.value })} placeholder="بالعربية" className="h-8 text-sm" />
          </FieldGroup>
          <FieldGroup label="Français">
            <Input value={(data.heading_fr as string) ?? ''} onChange={(e) => onChange({ ...data, heading_fr: e.target.value })} placeholder="en français" className="h-8 text-sm" />
          </FieldGroup>
        </div>
      </div>

      <div className="space-y-2">
        <SectionLabel>الأخبار</SectionLabel>
        {cards.map((card, i) => (
          <RepeaterItem key={i} onDelete={() => onChange({ ...data, cards: cards.filter((_, j) => j !== i) })}>
            <div className="space-y-1.5 pr-5">
              <div className="relative aspect-video w-full overflow-hidden rounded-md bg-muted">
                {card.image ? (
                  <img src={card.image} alt="" className="size-full object-cover" />
                ) : (
                  <div className="flex size-full items-center justify-center">
                    <ImageIcon className="size-5 text-muted-foreground" />
                  </div>
                )}
              </div>
              <Input value={card.image} onChange={(e) => onChange({ ...data, cards: cards.map((x, j) => (j === i ? { ...x, image: e.target.value } : x)) })} placeholder="رابط الصورة" className="h-8 text-sm" />
              <div className="border border-[#E5E7EB] rounded-lg p-2 space-y-1 bg-[#F8FAFC]">
                <span className="text-xs font-bold text-[#64748B]">التصنيف</span>
                <div className="grid grid-cols-2 gap-2">
                  <Input value={card.badge_ar ?? ''} onChange={(e) => onChange({ ...data, cards: cards.map((x, j) => (j === i ? { ...x, badge_ar: e.target.value } : x)) })} placeholder="بالعربية" className="h-8 text-sm" />
                  <Input value={card.badge_fr ?? ''} onChange={(e) => onChange({ ...data, cards: cards.map((x, j) => (j === i ? { ...x, badge_fr: e.target.value } : x)) })} placeholder="en français" className="h-8 text-sm" />
                </div>
              </div>
              <Input value={card.date} onChange={(e) => onChange({ ...data, cards: cards.map((x, j) => (j === i ? { ...x, date: e.target.value } : x)) })} placeholder="التاريخ" className="h-8 text-sm" />
              <div className="border border-[#E5E7EB] rounded-lg p-2 space-y-1 bg-[#F8FAFC]">
                <span className="text-xs font-bold text-[#64748B]">العنوان</span>
                <div className="grid grid-cols-2 gap-2">
                  <Input value={card.title_ar ?? ''} onChange={(e) => onChange({ ...data, cards: cards.map((x, j) => (j === i ? { ...x, title_ar: e.target.value } : x)) })} placeholder="بالعربية" className="h-8 text-sm" />
                  <Input value={card.title_fr ?? ''} onChange={(e) => onChange({ ...data, cards: cards.map((x, j) => (j === i ? { ...x, title_fr: e.target.value } : x)) })} placeholder="en français" className="h-8 text-sm" />
                </div>
              </div>
              <div className="border border-[#E5E7EB] rounded-lg p-2 space-y-1 bg-[#F8FAFC]">
                <span className="text-xs font-bold text-[#64748B]">نص الرابط</span>
                <div className="grid grid-cols-2 gap-2">
                  <Input value={card.linkText_ar ?? ''} onChange={(e) => onChange({ ...data, cards: cards.map((x, j) => (j === i ? { ...x, linkText_ar: e.target.value } : x)) })} placeholder="بالعربية" className="h-8 text-sm" />
                  <Input value={card.linkText_fr ?? ''} onChange={(e) => onChange({ ...data, cards: cards.map((x, j) => (j === i ? { ...x, linkText_fr: e.target.value } : x)) })} placeholder="en français" className="h-8 text-sm" />
                </div>
              </div>
              <Input value={card.linkUrl} onChange={(e) => onChange({ ...data, cards: cards.map((x, j) => (j === i ? { ...x, linkUrl: e.target.value } : x)) })} placeholder="الرابط" className="h-8 text-sm" />
            </div>
          </RepeaterItem>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => onChange({ ...data, cards: [...cards, { title_ar: '', title_fr: '', date: '', badge_ar: '', badge_fr: '', image: '', linkText_ar: '', linkText_fr: '', linkUrl: '#' }] })}>
          <Plus className="size-3.5" /> إضافة خبر
        </Button>
      </div>
    </div>
  )
}

// =====================================================================
// FOOTER EDITOR  (_renderer: "footer")
// =====================================================================

function FooterEditor({ data, onChange }: CustomEditorProps) {
  const socialLinks = (data.socialLinks ?? []) as Array<{ platform: string; url: string }>
  const quickLinks = (data.quickLinks ?? []) as Array<{ label_ar: string; label_fr: string; url: string }>
  const programs = (data.programs ?? []) as Array<{ label_ar: string; label_fr: string; url: string }>
  const contact = (data.contact ?? { address_ar: '', address_fr: '', phone: '', email: '' }) as { address_ar: string; address_fr: string; phone: string; email: string }
  const bottomLinks = (data.bottomLinks ?? []) as Array<{ label_ar: string; label_fr: string; url: string }>

  return (
    <div className="space-y-3">
      <div className="border border-[#E5E7EB] rounded-lg p-3 space-y-2 bg-[#F8FAFC]">
        <span className="text-xs font-bold text-[#123B78]">اسم الجمعية</span>
        <div className="grid grid-cols-2 gap-2">
          <FieldGroup label="العربية">
            <Input value={(data.brandName_ar as string) ?? ''} onChange={(e) => onChange({ ...data, brandName_ar: e.target.value })} placeholder="بالعربية" className="h-8 text-sm" />
          </FieldGroup>
          <FieldGroup label="Français">
            <Input value={(data.brandName_fr as string) ?? ''} onChange={(e) => onChange({ ...data, brandName_fr: e.target.value })} placeholder="en français" className="h-8 text-sm" />
          </FieldGroup>
        </div>
      </div>

      <FieldGroup label="شعار الجمعية (رابط الصورة)">
        <Input value={(data.brandLogo as string) ?? ''} onChange={(e) => onChange({ ...data, brandLogo: e.target.value })} className="h-9 text-sm" />
      </FieldGroup>

      <div className="border border-[#E5E7EB] rounded-lg p-3 space-y-2 bg-[#F8FAFC]">
        <span className="text-xs font-bold text-[#123B78]">النص التعريفي</span>
        <div className="grid grid-cols-2 gap-2">
          <FieldGroup label="العربية">
            <Textarea value={(data.description_ar as string) ?? ''} onChange={(e) => onChange({ ...data, description_ar: e.target.value })} placeholder="بالعربية" className="min-h-16 resize-y text-sm" />
          </FieldGroup>
          <FieldGroup label="Français">
            <Textarea value={(data.description_fr as string) ?? ''} onChange={(e) => onChange({ ...data, description_fr: e.target.value })} placeholder="en français" className="min-h-16 resize-y text-sm" />
          </FieldGroup>
        </div>
      </div>

      {/* Social Links */}
      <div className="space-y-2">
        <SectionLabel>روابط التواصل الاجتماعي</SectionLabel>
        {socialLinks.map((link, i) => (
          <RepeaterItem key={i} onDelete={() => onChange({ ...data, socialLinks: socialLinks.filter((_, j) => j !== i) })}>
            <div className="flex gap-2 pr-5">
              <Input value={link.platform} onChange={(e) => onChange({ ...data, socialLinks: socialLinks.map((x, j) => (j === i ? { ...x, platform: e.target.value } : x)) })} placeholder="المنصة" className="h-8 w-28 text-sm" />
              <Input value={link.url} onChange={(e) => onChange({ ...data, socialLinks: socialLinks.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)) })} placeholder="الرابط" className="h-8 flex-1 text-sm" />
            </div>
          </RepeaterItem>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => onChange({ ...data, socialLinks: [...socialLinks, { platform: '', url: '#' }] })}>
          <Plus className="size-3.5" /> إضافة رابط
        </Button>
      </div>

      {/* Quick Links */}
      <div className="space-y-2">
        <div className="border border-[#E5E7EB] rounded-lg p-3 space-y-2 bg-[#F8FAFC]">
          <span className="text-xs font-bold text-[#123B78]">عنوان الروابط السريعة</span>
          <div className="grid grid-cols-2 gap-2">
            <FieldGroup label="العربية">
              <Input value={(data.quickLinksHeading_ar as string) ?? ''} onChange={(e) => onChange({ ...data, quickLinksHeading_ar: e.target.value })} placeholder="بالعربية" className="h-8 text-sm" />
            </FieldGroup>
            <FieldGroup label="Français">
              <Input value={(data.quickLinksHeading_fr as string) ?? ''} onChange={(e) => onChange({ ...data, quickLinksHeading_fr: e.target.value })} placeholder="en français" className="h-8 text-sm" />
            </FieldGroup>
          </div>
        </div>
        <SectionLabel>الروابط السريعة</SectionLabel>
        {quickLinks.map((link, i) => (
          <RepeaterItem key={i} onDelete={() => onChange({ ...data, quickLinks: quickLinks.filter((_, j) => j !== i) })}>
            <div className="space-y-1.5 pr-5">
              <div className="border border-[#E5E7EB] rounded-lg p-2 space-y-1 bg-[#F8FAFC]">
                <span className="text-xs font-bold text-[#64748B]">النص</span>
                <div className="grid grid-cols-2 gap-2">
                  <Input value={link.label_ar ?? ''} onChange={(e) => onChange({ ...data, quickLinks: quickLinks.map((x, j) => (j === i ? { ...x, label_ar: e.target.value } : x)) })} placeholder="بالعربية" className="h-8 text-sm" />
                  <Input value={link.label_fr ?? ''} onChange={(e) => onChange({ ...data, quickLinks: quickLinks.map((x, j) => (j === i ? { ...x, label_fr: e.target.value } : x)) })} placeholder="en français" className="h-8 text-sm" />
                </div>
              </div>
              <Input value={link.url} onChange={(e) => onChange({ ...data, quickLinks: quickLinks.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)) })} placeholder="الرابط" className="h-8 text-sm" />
            </div>
          </RepeaterItem>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => onChange({ ...data, quickLinks: [...quickLinks, { label_ar: '', label_fr: '', url: '#' }] })}>
          <Plus className="size-3.5" /> إضافة رابط
        </Button>
      </div>

      {/* Programs */}
      <div className="space-y-2">
        <div className="border border-[#E5E7EB] rounded-lg p-3 space-y-2 bg-[#F8FAFC]">
          <span className="text-xs font-bold text-[#123B78]">عنوان البرامج</span>
          <div className="grid grid-cols-2 gap-2">
            <FieldGroup label="العربية">
              <Input value={(data.programsHeading_ar as string) ?? ''} onChange={(e) => onChange({ ...data, programsHeading_ar: e.target.value })} placeholder="بالعربية" className="h-8 text-sm" />
            </FieldGroup>
            <FieldGroup label="Français">
              <Input value={(data.programsHeading_fr as string) ?? ''} onChange={(e) => onChange({ ...data, programsHeading_fr: e.target.value })} placeholder="en français" className="h-8 text-sm" />
            </FieldGroup>
          </div>
        </div>
        <SectionLabel>البرامج</SectionLabel>
        {programs.map((prog, i) => (
          <RepeaterItem key={i} onDelete={() => onChange({ ...data, programs: programs.filter((_, j) => j !== i) })}>
            <div className="space-y-1.5 pr-5">
              <div className="border border-[#E5E7EB] rounded-lg p-2 space-y-1 bg-[#F8FAFC]">
                <span className="text-xs font-bold text-[#64748B]">النص</span>
                <div className="grid grid-cols-2 gap-2">
                  <Input value={prog.label_ar ?? ''} onChange={(e) => onChange({ ...data, programs: programs.map((x, j) => (j === i ? { ...x, label_ar: e.target.value } : x)) })} placeholder="بالعربية" className="h-8 text-sm" />
                  <Input value={prog.label_fr ?? ''} onChange={(e) => onChange({ ...data, programs: programs.map((x, j) => (j === i ? { ...x, label_fr: e.target.value } : x)) })} placeholder="en français" className="h-8 text-sm" />
                </div>
              </div>
              <Input value={prog.url} onChange={(e) => onChange({ ...data, programs: programs.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)) })} placeholder="الرابط" className="h-8 text-sm" />
            </div>
          </RepeaterItem>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => onChange({ ...data, programs: [...programs, { label_ar: '', label_fr: '', url: '#' }] })}>
          <Plus className="size-3.5" /> إضافة برنامج
        </Button>
      </div>

      {/* Contact */}
      <div className="space-y-2">
        <SectionLabel>معلومات التواصل</SectionLabel>
        <div className="border border-[#E5E7EB] rounded-lg p-3 space-y-2 bg-[#F8FAFC]">
          <span className="text-xs font-bold text-[#123B78]">العنوان</span>
          <div className="grid grid-cols-2 gap-2">
            <FieldGroup label="العربية">
              <Input value={contact.address_ar ?? ''} onChange={(e) => onChange({ ...data, contact: { ...contact, address_ar: e.target.value } })} placeholder="بالعربية" className="h-8 text-sm" />
            </FieldGroup>
            <FieldGroup label="Français">
              <Input value={contact.address_fr ?? ''} onChange={(e) => onChange({ ...data, contact: { ...contact, address_fr: e.target.value } })} placeholder="en français" className="h-8 text-sm" />
            </FieldGroup>
          </div>
        </div>
        <Input value={contact.phone} onChange={(e) => onChange({ ...data, contact: { ...contact, phone: e.target.value } })} placeholder="الهاتف" className="h-9 text-sm" />
        <Input value={contact.email} onChange={(e) => onChange({ ...data, contact: { ...contact, email: e.target.value } })} placeholder="البريد الإلكتروني" className="h-9 text-sm" />
      </div>

      {/* Map */}
      <div className="grid gap-3">
        <div className="border border-[#E5E7EB] rounded-lg p-3 space-y-2 bg-[#F8FAFC]">
          <span className="text-xs font-bold text-[#123B78]">عنوان الخريطة</span>
          <div className="grid grid-cols-2 gap-2">
            <FieldGroup label="العربية">
              <Input value={(data.mapHeading_ar as string) ?? ''} onChange={(e) => onChange({ ...data, mapHeading_ar: e.target.value })} placeholder="بالعربية" className="h-8 text-sm" />
            </FieldGroup>
            <FieldGroup label="Français">
              <Input value={(data.mapHeading_fr as string) ?? ''} onChange={(e) => onChange({ ...data, mapHeading_fr: e.target.value })} placeholder="en français" className="h-8 text-sm" />
            </FieldGroup>
          </div>
        </div>
        <div className="border border-[#E5E7EB] rounded-lg p-3 space-y-2 bg-[#F8FAFC]">
          <span className="text-xs font-bold text-[#123B78]">تسمية الموقع</span>
          <div className="grid grid-cols-2 gap-2">
            <FieldGroup label="العربية">
              <Input value={(data.map_title_ar as string) ?? ''} onChange={(e) => onChange({ ...data, map_title_ar: e.target.value })} placeholder="بالعربية" className="h-8 text-sm" />
            </FieldGroup>
            <FieldGroup label="Français">
              <Input value={(data.map_title_fr as string) ?? ''} onChange={(e) => onChange({ ...data, map_title_fr: e.target.value })} placeholder="en français" className="h-8 text-sm" />
            </FieldGroup>
          </div>
        </div>
        <div className="border border-[#E5E7EB] rounded-lg p-3 space-y-2 bg-[#F8FAFC]">
          <span className="text-xs font-bold text-[#123B78]">نص زر الخريطة</span>
          <div className="grid grid-cols-2 gap-2">
            <FieldGroup label="العربية">
              <Input value={(data.map_buttonLabel_ar as string) ?? ''} onChange={(e) => onChange({ ...data, map_buttonLabel_ar: e.target.value })} placeholder="بالعربية" className="h-8 text-sm" />
            </FieldGroup>
            <FieldGroup label="Français">
              <Input value={(data.map_buttonLabel_fr as string) ?? ''} onChange={(e) => onChange({ ...data, map_buttonLabel_fr: e.target.value })} placeholder="en français" className="h-8 text-sm" />
            </FieldGroup>
          </div>
        </div>
        <div className="flex gap-2">
          <FieldGroup label="خط العرض">
            <Input value={(data.mapLat as string) ?? ''} onChange={(e) => onChange({ ...data, mapLat: e.target.value })} className="h-9 text-sm" />
          </FieldGroup>
          <FieldGroup label="خط الطول">
            <Input value={(data.mapLon as string) ?? ''} onChange={(e) => onChange({ ...data, mapLon: e.target.value })} className="h-9 text-sm" />
          </FieldGroup>
        </div>
      </div>

      {/* Copyright */}
      <div className="border border-[#E5E7EB] rounded-lg p-3 space-y-2 bg-[#F8FAFC]">
        <span className="text-xs font-bold text-[#123B78]">حقوق النشر</span>
        <div className="grid grid-cols-2 gap-2">
          <FieldGroup label="العربية">
            <Input value={(data.rightsReserved_ar as string) ?? ''} onChange={(e) => onChange({ ...data, rightsReserved_ar: e.target.value })} placeholder="بالعربية" className="h-8 text-sm" />
          </FieldGroup>
          <FieldGroup label="Français">
            <Input value={(data.rightsReserved_fr as string) ?? ''} onChange={(e) => onChange({ ...data, rightsReserved_fr: e.target.value })} placeholder="en français" className="h-8 text-sm" />
          </FieldGroup>
        </div>
      </div>

      {/* Bottom Links */}
      <div className="space-y-2">
        <SectionLabel>روابط التذييل</SectionLabel>
        {bottomLinks.map((link, i) => (
          <RepeaterItem key={i} onDelete={() => onChange({ ...data, bottomLinks: bottomLinks.filter((_, j) => j !== i) })}>
            <div className="space-y-1.5 pr-5">
              <div className="border border-[#E5E7EB] rounded-lg p-2 space-y-1 bg-[#F8FAFC]">
                <span className="text-xs font-bold text-[#64748B]">النص</span>
                <div className="grid grid-cols-2 gap-2">
                  <Input value={link.label_ar ?? ''} onChange={(e) => onChange({ ...data, bottomLinks: bottomLinks.map((x, j) => (j === i ? { ...x, label_ar: e.target.value } : x)) })} placeholder="بالعربية" className="h-8 text-sm" />
                  <Input value={link.label_fr ?? ''} onChange={(e) => onChange({ ...data, bottomLinks: bottomLinks.map((x, j) => (j === i ? { ...x, label_fr: e.target.value } : x)) })} placeholder="en français" className="h-8 text-sm" />
                </div>
              </div>
              <Input value={link.url} onChange={(e) => onChange({ ...data, bottomLinks: bottomLinks.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)) })} placeholder="الرابط" className="h-8 text-sm" />
            </div>
          </RepeaterItem>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => onChange({ ...data, bottomLinks: [...bottomLinks, { label_ar: '', label_fr: '', url: '#' }] })}>
          <Plus className="size-3.5" /> إضافة رابط
        </Button>
      </div>
    </div>
  )
}

// =====================================================================
// GENERIC STRUCTURED EDITOR  (no _renderer — auto-detect fields)
// =====================================================================

function GenericStructuredEditor({ data, onChange }: CustomEditorProps) {
  const entries = Object.entries(data).filter(([k]) => !k.startsWith('_'))

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border px-4 py-8 text-center">
        <p className="text-sm text-muted-foreground">لا توجد حقول قابلة للتعديل</p>
        <p className="text-xs text-muted-foreground">أضف حقولاً جديدة أدناه</p>
      </div>
    )
  }

  function renderField(key: string, value: unknown): React.ReactNode {
    if (Array.isArray(value)) {
      const items = value as Array<Record<string, unknown>>
      return (
        <div className="space-y-2" key={key}>
          <SectionLabel>{key}</SectionLabel>
          {items.map((item, i) => (
            <RepeaterItem key={i} onDelete={() => {
              const arr = [...items]
              arr.splice(i, 1)
              onChange({ ...data, [key]: arr })
            }}>
              <div className="space-y-1.5 pr-5">
                {Object.entries(item).map(([itemKey, itemVal]) => (
                  <Input
                    key={itemKey}
                    value={String(itemVal ?? '')}
                    onChange={(e) => {
                      const arr = items.map((x, j) => (j === i ? { ...x, [itemKey]: e.target.value } : x))
                      onChange({ ...data, [key]: arr })
                    }}
                    placeholder={itemKey}
                    className="h-8 text-sm"
                  />
                ))}
              </div>
            </RepeaterItem>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => {
            const firstItem = items[0] ?? {}
            const newItem: Record<string, unknown> = {}
            for (const k of Object.keys(firstItem)) newItem[k] = ''
            onChange({ ...data, [key]: [...items, newItem] })
          }}>
            <Plus className="size-3.5" /> إضافة عنصر
          </Button>
        </div>
      )
    }

    if (typeof value === 'object' && value !== null) {
      const obj = value as Record<string, unknown>
      return (
        <div className="space-y-2" key={key}>
          <SectionLabel>{key}</SectionLabel>
          {Object.entries(obj).map(([subKey, subVal]) => (
            <FieldGroup key={subKey} label={subKey}>
              <Input
                value={String(subVal ?? '')}
                onChange={(e) => onChange({ ...data, [key]: { ...obj, [subKey]: e.target.value } })}
                className="h-9 text-sm"
              />
            </FieldGroup>
          ))}
        </div>
      )
    }

    if (typeof value === 'string' && value.length > 120) {
      return (
        <FieldGroup key={key} label={key}>
          <Textarea
            value={value}
            onChange={(e) => onChange({ ...data, [key]: e.target.value })}
            className="min-h-16 resize-y text-sm"
          />
        </FieldGroup>
      )
    }

    return (
      <FieldGroup key={key} label={key}>
        <Input
          value={String(value ?? '')}
          onChange={(e) => onChange({ ...data, [key]: e.target.value })}
          className="h-9 text-sm"
        />
      </FieldGroup>
    )
  }

  return <div className="space-y-3">{entries.map(([key, value]) => renderField(key, value))}</div>
}

// =====================================================================
// NATIONAL VISION EDITOR  (_renderer: "nationalVision")
// =====================================================================

function NationalVisionEditor({ data, onChange }: CustomEditorProps) {
  const cards = (data.cards ?? []) as Array<{ title_ar: string; title_fr: string; description_ar: string; description_fr: string }>

  return (
    <div className="space-y-3">
      <div className="border border-[#E5E7EB] rounded-lg p-3 space-y-2 bg-[#F8FAFC]">
        <span className="text-xs font-bold text-[#123B78]">العنوان الفرعي (Eyebrow)</span>
        <div className="grid grid-cols-2 gap-2">
          <FieldGroup label="العربية">
            <Input value={(data.eyebrow_ar as string) ?? ''} onChange={(e) => onChange({ ...data, eyebrow_ar: e.target.value })} placeholder="بالعربية" className="h-8 text-sm" />
          </FieldGroup>
          <FieldGroup label="Français">
            <Input value={(data.eyebrow_fr as string) ?? ''} onChange={(e) => onChange({ ...data, eyebrow_fr: e.target.value })} placeholder="en français" className="h-8 text-sm" />
          </FieldGroup>
        </div>
      </div>

      <div className="border border-[#E5E7EB] rounded-lg p-3 space-y-2 bg-[#F8FAFC]">
        <span className="text-xs font-bold text-[#123B78]">العنوان الرئيسي</span>
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
        <span className="text-xs font-bold text-[#123B78]">النص الرئيسي</span>
        <div className="grid grid-cols-2 gap-2">
          <FieldGroup label="العربية">
            <Textarea value={(data.description_ar as string) ?? ''} onChange={(e) => onChange({ ...data, description_ar: e.target.value })} placeholder="بالعربية" className="min-h-20 resize-y text-sm" />
          </FieldGroup>
          <FieldGroup label="Français">
            <Textarea value={(data.description_fr as string) ?? ''} onChange={(e) => onChange({ ...data, description_fr: e.target.value })} placeholder="en français" className="min-h-20 resize-y text-sm" />
          </FieldGroup>
        </div>
      </div>

      <div className="space-y-2">
        <SectionLabel>بطاقات الرؤية</SectionLabel>
        {cards.map((card, i) => (
          <RepeaterItem key={i} onDelete={() => onChange({ ...data, cards: cards.filter((_, j) => j !== i) })}>
            <div className="space-y-1.5 pr-5">
              <div className="border border-[#E5E7EB] rounded-lg p-2 space-y-1 bg-[#F8FAFC]">
                <span className="text-xs font-bold text-[#64748B]">العنوان</span>
                <div className="grid grid-cols-2 gap-2">
                  <Input value={card.title_ar ?? ''} onChange={(e) => onChange({ ...data, cards: cards.map((x, j) => (j === i ? { ...x, title_ar: e.target.value } : x)) })} placeholder="بالعربية" className="h-8 text-sm" />
                  <Input value={card.title_fr ?? ''} onChange={(e) => onChange({ ...data, cards: cards.map((x, j) => (j === i ? { ...x, title_fr: e.target.value } : x)) })} placeholder="en français" className="h-8 text-sm" />
                </div>
              </div>
              <div className="border border-[#E5E7EB] rounded-lg p-2 space-y-1 bg-[#F8FAFC]">
                <span className="text-xs font-bold text-[#64748B]">الوصف</span>
                <div className="grid grid-cols-2 gap-2">
                  <Textarea value={card.description_ar ?? ''} onChange={(e) => onChange({ ...data, cards: cards.map((x, j) => (j === i ? { ...x, description_ar: e.target.value } : x)) })} placeholder="بالعربية" className="min-h-12 resize-y text-sm" />
                  <Textarea value={card.description_fr ?? ''} onChange={(e) => onChange({ ...data, cards: cards.map((x, j) => (j === i ? { ...x, description_fr: e.target.value } : x)) })} placeholder="en français" className="min-h-12 resize-y text-sm" />
                </div>
              </div>
            </div>
          </RepeaterItem>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => onChange({ ...data, cards: [...cards, { title_ar: '', title_fr: '', description_ar: '', description_fr: '' }] })}>
          <Plus className="size-3.5" /> إضافة بطاقة
        </Button>
      </div>
    </div>
  )
}

// =====================================================================
// MISSION EDITOR  (_renderer: "mission")
// =====================================================================

function MissionEditor({ data, onChange }: CustomEditorProps) {
  return (
    <div className="space-y-3">
      <div className="border border-[#E5E7EB] rounded-lg p-3 space-y-2 bg-[#F8FAFC]">
        <span className="text-xs font-bold text-[#123B78]">العنوان الفرعي (Eyebrow)</span>
        <div className="grid grid-cols-2 gap-2">
          <FieldGroup label="العربية">
            <Input value={(data.eyebrow_ar as string) ?? ''} onChange={(e) => onChange({ ...data, eyebrow_ar: e.target.value })} placeholder="بالعربية" className="h-8 text-sm" />
          </FieldGroup>
          <FieldGroup label="Français">
            <Input value={(data.eyebrow_fr as string) ?? ''} onChange={(e) => onChange({ ...data, eyebrow_fr: e.target.value })} placeholder="en français" className="h-8 text-sm" />
          </FieldGroup>
        </div>
      </div>

      <div className="border border-[#E5E7EB] rounded-lg p-3 space-y-2 bg-[#F8FAFC]">
        <span className="text-xs font-bold text-[#123B78]">العنوان الرئيسي</span>
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
        <span className="text-xs font-bold text-[#123B78]">النص الرئيسي</span>
        <div className="grid grid-cols-2 gap-2">
          <FieldGroup label="العربية">
            <Textarea value={(data.description_ar as string) ?? ''} onChange={(e) => onChange({ ...data, description_ar: e.target.value })} placeholder="بالعربية" className="min-h-24 resize-y text-sm" />
          </FieldGroup>
          <FieldGroup label="Français">
            <Textarea value={(data.description_fr as string) ?? ''} onChange={(e) => onChange({ ...data, description_fr: e.target.value })} placeholder="en français" className="min-h-24 resize-y text-sm" />
          </FieldGroup>
        </div>
      </div>
    </div>
  )
}

// =====================================================================
// VALUES EDITOR  (_renderer: "values")
// =====================================================================

function ValuesEditor({ data, onChange }: CustomEditorProps) {
  const cards = (data.cards ?? []) as Array<{ title_ar: string; title_fr: string; description_ar: string; description_fr: string }>

  return (
    <div className="space-y-3">
      <div className="border border-[#E5E7EB] rounded-lg p-3 space-y-2 bg-[#F8FAFC]">
        <span className="text-xs font-bold text-[#123B78]">العنوان الفرعي (Eyebrow)</span>
        <div className="grid grid-cols-2 gap-2">
          <FieldGroup label="العربية">
            <Input value={(data.eyebrow_ar as string) ?? ''} onChange={(e) => onChange({ ...data, eyebrow_ar: e.target.value })} placeholder="بالعربية" className="h-8 text-sm" />
          </FieldGroup>
          <FieldGroup label="Français">
            <Input value={(data.eyebrow_fr as string) ?? ''} onChange={(e) => onChange({ ...data, eyebrow_fr: e.target.value })} placeholder="en français" className="h-8 text-sm" />
          </FieldGroup>
        </div>
      </div>

      <div className="border border-[#E5E7EB] rounded-lg p-3 space-y-2 bg-[#F8FAFC]">
        <span className="text-xs font-bold text-[#123B78]">العنوان الرئيسي</span>
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
        <span className="text-xs font-bold text-[#123B78]">الوصف</span>
        <div className="grid grid-cols-2 gap-2">
          <FieldGroup label="العربية">
            <Textarea value={(data.description_ar as string) ?? ''} onChange={(e) => onChange({ ...data, description_ar: e.target.value })} placeholder="بالعربية" className="min-h-16 resize-y text-sm" />
          </FieldGroup>
          <FieldGroup label="Français">
            <Textarea value={(data.description_fr as string) ?? ''} onChange={(e) => onChange({ ...data, description_fr: e.target.value })} placeholder="en français" className="min-h-16 resize-y text-sm" />
          </FieldGroup>
        </div>
      </div>

      <div className="space-y-2">
        <SectionLabel>القيم</SectionLabel>
        {cards.map((card, i) => (
          <RepeaterItem key={i} onDelete={() => onChange({ ...data, cards: cards.filter((_, j) => j !== i) })}>
            <div className="space-y-1.5 pr-5">
              <div className="border border-[#E5E7EB] rounded-lg p-2 space-y-1 bg-[#F8FAFC]">
                <span className="text-xs font-bold text-[#64748B]">العنوان</span>
                <div className="grid grid-cols-2 gap-2">
                  <Input value={card.title_ar ?? ''} onChange={(e) => onChange({ ...data, cards: cards.map((x, j) => (j === i ? { ...x, title_ar: e.target.value } : x)) })} placeholder="بالعربية" className="h-8 text-sm" />
                  <Input value={card.title_fr ?? ''} onChange={(e) => onChange({ ...data, cards: cards.map((x, j) => (j === i ? { ...x, title_fr: e.target.value } : x)) })} placeholder="en français" className="h-8 text-sm" />
                </div>
              </div>
              <div className="border border-[#E5E7EB] rounded-lg p-2 space-y-1 bg-[#F8FAFC]">
                <span className="text-xs font-bold text-[#64748B]">الوصف</span>
                <div className="grid grid-cols-2 gap-2">
                  <Textarea value={card.description_ar ?? ''} onChange={(e) => onChange({ ...data, cards: cards.map((x, j) => (j === i ? { ...x, description_ar: e.target.value } : x)) })} placeholder="بالعربية" className="min-h-12 resize-y text-sm" />
                  <Textarea value={card.description_fr ?? ''} onChange={(e) => onChange({ ...data, cards: cards.map((x, j) => (j === i ? { ...x, description_fr: e.target.value } : x)) })} placeholder="en français" className="min-h-12 resize-y text-sm" />
                </div>
              </div>
            </div>
          </RepeaterItem>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => onChange({ ...data, cards: [...cards, { title_ar: '', title_fr: '', description_ar: '', description_fr: '' }] })}>
          <Plus className="size-3.5" /> إضافة قيمة
        </Button>
      </div>
    </div>
  )
}

// =====================================================================
// CENTRAL OFFICE EDITOR  (_renderer: "centralOffice")
// =====================================================================

function CentralOfficeEditor({ data, onChange }: CustomEditorProps) {
  const members = (data.members ?? []) as Array<{
    name_ar: string
    name_fr: string
    role_ar: string
    role_fr: string
    bio_ar: string
    bio_fr: string
    color: string
    facebook: string
    instagram: string
    linkedin: string
    profileUrl: string
  }>

  return (
    <div className="space-y-3">
      <div className="border border-[#E5E7EB] rounded-lg p-3 space-y-2 bg-[#F8FAFC]">
        <span className="text-xs font-bold text-[#123B78]">Eyebrow</span>
        <div className="grid grid-cols-2 gap-2">
          <FieldGroup label="العربية">
            <Input value={(data.eyebrow_ar as string) ?? ''} onChange={(e) => onChange({ ...data, eyebrow_ar: e.target.value })} placeholder="بالعربية" className="h-8 text-sm" />
          </FieldGroup>
          <FieldGroup label="Français">
            <Input value={(data.eyebrow_fr as string) ?? ''} onChange={(e) => onChange({ ...data, eyebrow_fr: e.target.value })} placeholder="en français" className="h-8 text-sm" />
          </FieldGroup>
        </div>
      </div>

      <div className="border border-[#E5E7EB] rounded-lg p-3 space-y-2 bg-[#F8FAFC]">
        <span className="text-xs font-bold text-[#123B78]">العنوان الرئيسي</span>
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
        <span className="text-xs font-bold text-[#123B78]">النص التعريفي</span>
        <div className="grid grid-cols-2 gap-2">
          <FieldGroup label="العربية">
            <Textarea value={(data.description_ar as string) ?? ''} onChange={(e) => onChange({ ...data, description_ar: e.target.value })} placeholder="بالعربية" className="min-h-20 resize-y text-sm" />
          </FieldGroup>
          <FieldGroup label="Français">
            <Textarea value={(data.description_fr as string) ?? ''} onChange={(e) => onChange({ ...data, description_fr: e.target.value })} placeholder="en français" className="min-h-20 resize-y text-sm" />
          </FieldGroup>
        </div>
      </div>

      <div className="border-t border-[#E5E7EB] pt-3 space-y-3">
        <div className="border border-[#E5E7EB] rounded-lg p-3 space-y-2 bg-[#F8FAFC]">
          <span className="text-xs font-bold text-[#123B78]">العنوان الفرعي للفريق</span>
          <div className="grid grid-cols-2 gap-2">
            <FieldGroup label="العربية">
              <Input value={(data.teamEyebrow_ar as string) ?? ''} onChange={(e) => onChange({ ...data, teamEyebrow_ar: e.target.value })} placeholder="بالعربية" className="h-8 text-sm" />
            </FieldGroup>
            <FieldGroup label="Français">
              <Input value={(data.teamEyebrow_fr as string) ?? ''} onChange={(e) => onChange({ ...data, teamEyebrow_fr: e.target.value })} placeholder="en français" className="h-8 text-sm" />
            </FieldGroup>
          </div>
        </div>

        <div className="border border-[#E5E7EB] rounded-lg p-3 space-y-2 bg-[#F8FAFC]">
          <span className="text-xs font-bold text-[#123B78]">عنوان الفريق</span>
          <div className="grid grid-cols-2 gap-2">
            <FieldGroup label="العربية">
              <Input value={(data.teamHeading_ar as string) ?? ''} onChange={(e) => onChange({ ...data, teamHeading_ar: e.target.value })} placeholder="بالعربية" className="h-8 text-sm" />
            </FieldGroup>
            <FieldGroup label="Français">
              <Input value={(data.teamHeading_fr as string) ?? ''} onChange={(e) => onChange({ ...data, teamHeading_fr: e.target.value })} placeholder="en français" className="h-8 text-sm" />
            </FieldGroup>
          </div>
        </div>

        <div className="border border-[#E5E7EB] rounded-lg p-3 space-y-2 bg-[#F8FAFC]">
          <span className="text-xs font-bold text-[#123B78]">وصف الفريق</span>
          <div className="grid grid-cols-2 gap-2">
            <FieldGroup label="العربية">
              <Textarea value={(data.teamDescription_ar as string) ?? ''} onChange={(e) => onChange({ ...data, teamDescription_ar: e.target.value })} placeholder="بالعربية" className="min-h-16 resize-y text-sm" />
            </FieldGroup>
            <FieldGroup label="Français">
              <Textarea value={(data.teamDescription_fr as string) ?? ''} onChange={(e) => onChange({ ...data, teamDescription_fr: e.target.value })} placeholder="en français" className="min-h-16 resize-y text-sm" />
            </FieldGroup>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <SectionLabel>الأعضاء</SectionLabel>
        {members.map((m, i) => (
          <RepeaterItem key={i} onDelete={() => onChange({ ...data, members: members.filter((_, j) => j !== i) })}>
            <div className="space-y-1.5 pr-5">
              <div className="border border-[#E5E7EB] rounded-lg p-2 space-y-1 bg-[#F8FAFC]">
                <span className="text-xs font-bold text-[#64748B]">الاسم</span>
                <div className="grid grid-cols-2 gap-2">
                  <Input value={m.name_ar ?? ''} onChange={(e) => onChange({ ...data, members: members.map((x, j) => (j === i ? { ...x, name_ar: e.target.value } : x)) })} placeholder="بالعربية" className="h-8 text-sm" />
                  <Input value={m.name_fr ?? ''} onChange={(e) => onChange({ ...data, members: members.map((x, j) => (j === i ? { ...x, name_fr: e.target.value } : x)) })} placeholder="en français" className="h-8 text-sm" />
                </div>
              </div>
              <div className="border border-[#E5E7EB] rounded-lg p-2 space-y-1 bg-[#F8FAFC]">
                <span className="text-xs font-bold text-[#64748B]">المنصب</span>
                <div className="grid grid-cols-2 gap-2">
                  <Input value={m.role_ar ?? ''} onChange={(e) => onChange({ ...data, members: members.map((x, j) => (j === i ? { ...x, role_ar: e.target.value } : x)) })} placeholder="بالعربية" className="h-8 text-sm" />
                  <Input value={m.role_fr ?? ''} onChange={(e) => onChange({ ...data, members: members.map((x, j) => (j === i ? { ...x, role_fr: e.target.value } : x)) })} placeholder="en français" className="h-8 text-sm" />
                </div>
              </div>
              <div className="border border-[#E5E7EB] rounded-lg p-2 space-y-1 bg-[#F8FAFC]">
                <span className="text-xs font-bold text-[#64748B]">النبذة</span>
                <div className="grid grid-cols-2 gap-2">
                  <Textarea value={m.bio_ar ?? ''} onChange={(e) => onChange({ ...data, members: members.map((x, j) => (j === i ? { ...x, bio_ar: e.target.value } : x)) })} placeholder="بالعربية" className="min-h-12 resize-y text-sm" />
                  <Textarea value={m.bio_fr ?? ''} onChange={(e) => onChange({ ...data, members: members.map((x, j) => (j === i ? { ...x, bio_fr: e.target.value } : x)) })} placeholder="en français" className="min-h-12 resize-y text-sm" />
                </div>
              </div>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={m.color ?? '#123B78'}
                  onChange={(e) => onChange({ ...data, members: members.map((x, j) => (j === i ? { ...x, color: e.target.value } : x)) })}
                  className="h-8 w-10 cursor-pointer rounded-lg border border-[#E5E7EB] p-0.5"
                />
                <Input value={m.facebook} onChange={(e) => onChange({ ...data, members: members.map((x, j) => (j === i ? { ...x, facebook: e.target.value } : x)) })} placeholder="فيسبوك" className="h-8 flex-1 text-sm" />
                <Input value={m.profileUrl} onChange={(e) => onChange({ ...data, members: members.map((x, j) => (j === i ? { ...x, profileUrl: e.target.value } : x)) })} placeholder="الرابط الشخصي" className="h-8 flex-1 text-sm" />
              </div>
            </div>
          </RepeaterItem>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => onChange({ ...data, members: [...members, { name_ar: '', name_fr: '', role_ar: '', role_fr: '', bio_ar: '', bio_fr: '', color: '#123B78', facebook: '#', instagram: '#', linkedin: '#', profileUrl: '#' }] })}>
          <Plus className="size-3.5" /> إضافة عضو
        </Button>
      </div>
    </div>
  )
}

// =====================================================================
// EXPANSION MAP EDITOR  (_renderer: "expansionMap")
// =====================================================================

function ExpansionMapEditor({ data, onChange }: CustomEditorProps) {
  const regions = (data.regions ?? []) as Array<{ id: string; name_ar: string; name_fr: string; status: string; branches: number }>

  return (
    <div className="space-y-3">
      <div className="border border-[#E5E7EB] rounded-lg p-3 space-y-2 bg-[#F8FAFC]">
        <span className="text-xs font-bold text-[#123B78]">Eyebrow</span>
        <div className="grid grid-cols-2 gap-2">
          <FieldGroup label="العربية">
            <Input value={(data.eyebrow_ar as string) ?? ''} onChange={(e) => onChange({ ...data, eyebrow_ar: e.target.value })} placeholder="بالعربية" className="h-8 text-sm" />
          </FieldGroup>
          <FieldGroup label="Français">
            <Input value={(data.eyebrow_fr as string) ?? ''} onChange={(e) => onChange({ ...data, eyebrow_fr: e.target.value })} placeholder="en français" className="h-8 text-sm" />
          </FieldGroup>
        </div>
      </div>

      <div className="border border-[#E5E7EB] rounded-lg p-3 space-y-2 bg-[#F8FAFC]">
        <span className="text-xs font-bold text-[#123B78]">العنوان الرئيسي</span>
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
        <span className="text-xs font-bold text-[#123B78]">النص التعريفي</span>
        <div className="grid grid-cols-2 gap-2">
          <FieldGroup label="العربية">
            <Textarea value={(data.description_ar as string) ?? ''} onChange={(e) => onChange({ ...data, description_ar: e.target.value })} placeholder="بالعربية" className="min-h-20 resize-y text-sm" />
          </FieldGroup>
          <FieldGroup label="Français">
            <Textarea value={(data.description_fr as string) ?? ''} onChange={(e) => onChange({ ...data, description_fr: e.target.value })} placeholder="en français" className="min-h-20 resize-y text-sm" />
          </FieldGroup>
        </div>
      </div>

      <div className="border-t border-[#E5E7EB] pt-3 space-y-3">
        <div className="border border-[#E5E7EB] rounded-lg p-3 space-y-2 bg-[#F8FAFC]">
          <span className="text-xs font-bold text-[#123B78]">العنوان الفرعي للخريطة</span>
          <div className="grid grid-cols-2 gap-2">
            <FieldGroup label="العربية">
              <Input value={(data.mapEyebrow_ar as string) ?? ''} onChange={(e) => onChange({ ...data, mapEyebrow_ar: e.target.value })} placeholder="بالعربية" className="h-8 text-sm" />
            </FieldGroup>
            <FieldGroup label="Français">
              <Input value={(data.mapEyebrow_fr as string) ?? ''} onChange={(e) => onChange({ ...data, mapEyebrow_fr: e.target.value })} placeholder="en français" className="h-8 text-sm" />
            </FieldGroup>
          </div>
        </div>

        <div className="border border-[#E5E7EB] rounded-lg p-3 space-y-2 bg-[#F8FAFC]">
          <span className="text-xs font-bold text-[#123B78]">عنوان الخريطة</span>
          <div className="grid grid-cols-2 gap-2">
            <FieldGroup label="العربية">
              <Input value={(data.mapHeading_ar as string) ?? ''} onChange={(e) => onChange({ ...data, mapHeading_ar: e.target.value })} placeholder="بالعربية" className="h-8 text-sm" />
            </FieldGroup>
            <FieldGroup label="Français">
              <Input value={(data.mapHeading_fr as string) ?? ''} onChange={(e) => onChange({ ...data, mapHeading_fr: e.target.value })} placeholder="en français" className="h-8 text-sm" />
            </FieldGroup>
          </div>
        </div>

        <div className="border border-[#E5E7EB] rounded-lg p-3 space-y-2 bg-[#F8FAFC]">
          <span className="text-xs font-bold text-[#123B78]">وصف الخريطة</span>
          <div className="grid grid-cols-2 gap-2">
            <FieldGroup label="العربية">
              <Textarea value={(data.mapDescription_ar as string) ?? ''} onChange={(e) => onChange({ ...data, mapDescription_ar: e.target.value })} placeholder="بالعربية" className="min-h-16 resize-y text-sm" />
            </FieldGroup>
            <FieldGroup label="Français">
              <Textarea value={(data.mapDescription_fr as string) ?? ''} onChange={(e) => onChange({ ...data, mapDescription_fr: e.target.value })} placeholder="en français" className="min-h-16 resize-y text-sm" />
            </FieldGroup>
          </div>
        </div>
      </div>

      <div className="border-t border-[#E5E7EB] pt-3 space-y-3">
        <SectionLabel>نصوص دليل الألوان</SectionLabel>
        <div className="grid grid-cols-2 gap-2">
          <FieldGroup label="عنوان الدليل (AR)">
            <Input value={(data.legendTitle_ar as string) ?? ''} onChange={(e) => onChange({ ...data, legendTitle_ar: e.target.value })} placeholder="بالعربية" className="h-8 text-sm" />
          </FieldGroup>
          <FieldGroup label="عنوان الدليل (FR)">
            <Input value={(data.legendTitle_fr as string) ?? ''} onChange={(e) => onChange({ ...data, legendTitle_fr: e.target.value })} placeholder="en français" className="h-8 text-sm" />
          </FieldGroup>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <FieldGroup label="شرح الدليل (AR)">
            <Input value={(data.legendSub_ar as string) ?? ''} onChange={(e) => onChange({ ...data, legendSub_ar: e.target.value })} placeholder="بالعربية" className="h-8 text-sm" />
          </FieldGroup>
          <FieldGroup label="شرح الدليل (FR)">
            <Input value={(data.legendSub_fr as string) ?? ''} onChange={(e) => onChange({ ...data, legendSub_fr: e.target.value })} placeholder="en français" className="h-8 text-sm" />
          </FieldGroup>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <FieldGroup label="نص فروع نشطة (AR)">
            <Input value={(data.legendActive_ar as string) ?? ''} onChange={(e) => onChange({ ...data, legendActive_ar: e.target.value })} placeholder="بالعربية" className="h-8 text-sm" />
          </FieldGroup>
          <FieldGroup label="نص فروع نشطة (FR)">
            <Input value={(data.legendActive_fr as string) ?? ''} onChange={(e) => onChange({ ...data, legendActive_fr: e.target.value })} placeholder="en français" className="h-8 text-sm" />
          </FieldGroup>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <FieldGroup label="نص فروع مرتقبة (AR)">
            <Input value={(data.legendUpcoming_ar as string) ?? ''} onChange={(e) => onChange({ ...data, legendUpcoming_ar: e.target.value })} placeholder="بالعربية" className="h-8 text-sm" />
          </FieldGroup>
          <FieldGroup label="نص فروع مرتقبة (FR)">
            <Input value={(data.legendUpcoming_fr as string) ?? ''} onChange={(e) => onChange({ ...data, legendUpcoming_fr: e.target.value })} placeholder="en français" className="h-8 text-sm" />
          </FieldGroup>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <FieldGroup label="نص توسع مستقبلي (AR)">
            <Input value={(data.legendFuture_ar as string) ?? ''} onChange={(e) => onChange({ ...data, legendFuture_ar: e.target.value })} placeholder="بالعربية" className="h-8 text-sm" />
          </FieldGroup>
          <FieldGroup label="نص توسع مستقبلي (FR)">
            <Input value={(data.legendFuture_fr as string) ?? ''} onChange={(e) => onChange({ ...data, legendFuture_fr: e.target.value })} placeholder="en français" className="h-8 text-sm" />
          </FieldGroup>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <FieldGroup label="نص التفاصيل الفارغة (AR)">
            <Input value={(data.emptyDetail_ar as string) ?? ''} onChange={(e) => onChange({ ...data, emptyDetail_ar: e.target.value })} placeholder="بالعربية" className="h-8 text-sm" />
          </FieldGroup>
          <FieldGroup label="نص التفاصيل الفارغة (FR)">
            <Input value={(data.emptyDetail_fr as string) ?? ''} onChange={(e) => onChange({ ...data, emptyDetail_fr: e.target.value })} placeholder="en français" className="h-8 text-sm" />
          </FieldGroup>
        </div>
      </div>

      <div className="space-y-2">
        <SectionLabel>الجهات</SectionLabel>
        {regions.map((r, i) => (
          <RepeaterItem key={r.id || i} onDelete={() => onChange({ ...data, regions: regions.filter((_, j) => j !== i) })}>
            <div className="space-y-1.5 pr-5">
              <div className="flex gap-2">
                <Input value={r.id} onChange={(e) => onChange({ ...data, regions: regions.map((x, j) => (j === i ? { ...x, id: e.target.value } : x)) })} placeholder="الرمز" className="h-8 w-20 text-sm" />
              </div>
              <div className="border border-[#E5E7EB] rounded-lg p-2 space-y-1 bg-[#F8FAFC]">
                <span className="text-xs font-bold text-[#64748B]">الاسم</span>
                <div className="grid grid-cols-2 gap-2">
                  <Input value={r.name_ar ?? ''} onChange={(e) => onChange({ ...data, regions: regions.map((x, j) => (j === i ? { ...x, name_ar: e.target.value } : x)) })} placeholder="بالعربية" className="h-8 text-sm" />
                  <Input value={r.name_fr ?? ''} onChange={(e) => onChange({ ...data, regions: regions.map((x, j) => (j === i ? { ...x, name_fr: e.target.value } : x)) })} placeholder="en français" className="h-8 text-sm" />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={r.status}
                  onChange={(e) => onChange({ ...data, regions: regions.map((x, j) => (j === i ? { ...x, status: e.target.value } : x)) })}
                  className="h-8 flex-1 rounded-lg border border-[#E5E7EB] bg-transparent px-2.5 text-sm"
                >
                  <option value="active">نشطة</option>
                  <option value="upcoming">مرتقبة</option>
                  <option value="future">مستقبلية</option>
                </select>
                <Input value={String(r.branches)} onChange={(e) => onChange({ ...data, regions: regions.map((x, j) => (j === i ? { ...x, branches: parseInt(e.target.value, 10) || 0 } : x)) })} placeholder="عدد الفروع" type="number" className="h-8 w-24 text-sm" />
              </div>
            </div>
          </RepeaterItem>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => onChange({ ...data, regions: [...regions, { id: '', name_ar: '', name_fr: '', status: 'future', branches: 0 }] })}>
          <Plus className="size-3.5" /> إضافة جهة
        </Button>
      </div>
    </div>
  )
}

// =====================================================================
// AMARE MAGAZINE EDITORS
// =====================================================================

// MAGAZINE FEATURED ARTICLE  (_renderer: "magFeatured")
function MagFeaturedEditor({ data, onChange }: CustomEditorProps) {
  const image = (data.image as string) ?? ''

  return (
    <div className="space-y-3">
      <FieldGroup label="صورة المقال">
        <div className="relative aspect-video w-full overflow-hidden rounded-md bg-muted">
          {image ? (
            <img src={image} alt="" className="size-full object-cover" />
          ) : (
            <div className="flex size-full items-center justify-center">
              <ImageIcon className="size-5 text-muted-foreground" />
            </div>
          )}
        </div>
        <Input value={image} onChange={(e) => onChange({ ...data, image: e.target.value })} placeholder="رابط الصورة" className="h-9 text-sm" />
      </FieldGroup>
      <div className="border border-[#E5E7EB] rounded-lg p-3 space-y-2 bg-[#F8FAFC]">
        <span className="text-xs font-bold text-[#123B78]">التصنيف (Badge)</span>
        <div className="grid grid-cols-2 gap-2">
          <FieldGroup label="العربية">
            <Input value={(data.badge_ar as string) ?? ''} onChange={(e) => onChange({ ...data, badge_ar: e.target.value })} placeholder="بالعربية" className="h-8 text-sm" />
          </FieldGroup>
          <FieldGroup label="Français">
            <Input value={(data.badge_fr as string) ?? ''} onChange={(e) => onChange({ ...data, badge_fr: e.target.value })} placeholder="en français" className="h-8 text-sm" />
          </FieldGroup>
        </div>
      </div>
      <div className="border border-[#E5E7EB] rounded-lg p-3 space-y-2 bg-[#F8FAFC]">
        <span className="text-xs font-bold text-[#123B78]">عنوان المقال</span>
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
        <span className="text-xs font-bold text-[#123B78]">الوصف (Excerpt)</span>
        <div className="grid grid-cols-2 gap-2">
          <FieldGroup label="العربية">
            <Textarea value={(data.excerpt_ar as string) ?? ''} onChange={(e) => onChange({ ...data, excerpt_ar: e.target.value })} placeholder="بالعربية" className="min-h-20 resize-y text-sm" />
          </FieldGroup>
          <FieldGroup label="Français">
            <Textarea value={(data.excerpt_fr as string) ?? ''} onChange={(e) => onChange({ ...data, excerpt_fr: e.target.value })} placeholder="en français" className="min-h-20 resize-y text-sm" />
          </FieldGroup>
        </div>
      </div>
      <div className="border border-[#E5E7EB] rounded-lg p-3 space-y-2 bg-[#F8FAFC]">
        <span className="text-xs font-bold text-[#123B78]">التاريخ</span>
        <div className="grid grid-cols-2 gap-2">
          <FieldGroup label="العربية">
            <Input value={(data.date_ar as string) ?? ''} onChange={(e) => onChange({ ...data, date_ar: e.target.value })} placeholder="بالعربية" className="h-8 text-sm" />
          </FieldGroup>
          <FieldGroup label="Français">
            <Input value={(data.date_fr as string) ?? ''} onChange={(e) => onChange({ ...data, date_fr: e.target.value })} placeholder="en français" className="h-8 text-sm" />
          </FieldGroup>
        </div>
      </div>
      <div className="border border-[#E5E7EB] rounded-lg p-3 space-y-2 bg-[#F8FAFC]">
        <span className="text-xs font-bold text-[#123B78]">مدة القراءة</span>
        <div className="grid grid-cols-2 gap-2">
          <FieldGroup label="العربية">
            <Input value={(data.readTime_ar as string) ?? ''} onChange={(e) => onChange({ ...data, readTime_ar: e.target.value })} placeholder="بالعربية" className="h-8 text-sm" />
          </FieldGroup>
          <FieldGroup label="Français">
            <Input value={(data.readTime_fr as string) ?? ''} onChange={(e) => onChange({ ...data, readTime_fr: e.target.value })} placeholder="en français" className="h-8 text-sm" />
          </FieldGroup>
        </div>
      </div>
      <div className="border border-[#E5E7EB] rounded-lg p-3 space-y-2 bg-[#F8FAFC]">
        <span className="text-xs font-bold text-[#123B78]">نص الرابط</span>
        <div className="grid grid-cols-2 gap-2">
          <FieldGroup label="العربية">
            <Input value={(data.linkLabel_ar as string) ?? ''} onChange={(e) => onChange({ ...data, linkLabel_ar: e.target.value })} placeholder="بالعربية" className="h-8 text-sm" />
          </FieldGroup>
          <FieldGroup label="Français">
            <Input value={(data.linkLabel_fr as string) ?? ''} onChange={(e) => onChange({ ...data, linkLabel_fr: e.target.value })} placeholder="en français" className="h-8 text-sm" />
          </FieldGroup>
        </div>
      </div>
      <FieldGroup label="الرابط">
        <Input value={(data.linkUrl as string) ?? ''} onChange={(e) => onChange({ ...data, linkUrl: e.target.value })} className="h-9 text-sm" />
      </FieldGroup>
    </div>
  )
}

// MAGAZINE LATEST ARTICLES  (_renderer: "magLatest")
function MagLatestEditor({ data, onChange }: CustomEditorProps) {
  const articles = (data.articles ?? []) as Array<{
    image: string; badge_ar: string; badge_fr: string
    title_ar: string; title_fr: string; excerpt_ar: string; excerpt_fr: string
    date_ar: string; date_fr: string; readTime_ar: string; readTime_fr: string
    linkUrl: string
  }>

  return (
    <div className="space-y-3">
      <div className="border border-[#E5E7EB] rounded-lg p-3 space-y-2 bg-[#F8FAFC]">
        <span className="text-xs font-bold text-[#123B78]">Eyebrow</span>
        <div className="grid grid-cols-2 gap-2">
          <FieldGroup label="العربية"><Input value={(data.eyebrow_ar as string) ?? ''} onChange={(e) => onChange({ ...data, eyebrow_ar: e.target.value })} placeholder="بالعربية" className="h-8 text-sm" /></FieldGroup>
          <FieldGroup label="Français"><Input value={(data.eyebrow_fr as string) ?? ''} onChange={(e) => onChange({ ...data, eyebrow_fr: e.target.value })} placeholder="en français" className="h-8 text-sm" /></FieldGroup>
        </div>
      </div>
      <div className="border border-[#E5E7EB] rounded-lg p-3 space-y-2 bg-[#F8FAFC]">
        <span className="text-xs font-bold text-[#123B78]">العنوان الرئيسي</span>
        <div className="grid grid-cols-2 gap-2">
          <FieldGroup label="العربية"><Input value={(data.heading_ar as string) ?? ''} onChange={(e) => onChange({ ...data, heading_ar: e.target.value })} placeholder="بالعربية" className="h-8 text-sm" /></FieldGroup>
          <FieldGroup label="Français"><Input value={(data.heading_fr as string) ?? ''} onChange={(e) => onChange({ ...data, heading_fr: e.target.value })} placeholder="en français" className="h-8 text-sm" /></FieldGroup>
        </div>
      </div>
      <div className="border border-[#E5E7EB] rounded-lg p-3 space-y-2 bg-[#F8FAFC]">
        <span className="text-xs font-bold text-[#123B78]">الوصف</span>
        <div className="grid grid-cols-2 gap-2">
          <FieldGroup label="العربية"><Input value={(data.description_ar as string) ?? ''} onChange={(e) => onChange({ ...data, description_ar: e.target.value })} placeholder="بالعربية" className="h-8 text-sm" /></FieldGroup>
          <FieldGroup label="Français"><Input value={(data.description_fr as string) ?? ''} onChange={(e) => onChange({ ...data, description_fr: e.target.value })} placeholder="en français" className="h-8 text-sm" /></FieldGroup>
        </div>
      </div>
      <div className="space-y-2">
        <SectionLabel>المقالات</SectionLabel>
        {articles.map((article, i) => (
          <RepeaterItem key={i} onDelete={() => onChange({ ...data, articles: articles.filter((_, j) => j !== i) })}>
            <div className="space-y-1.5 pr-5">
              <div className="relative aspect-video w-full overflow-hidden rounded-md bg-muted">
                {article.image ? <img src={article.image} alt="" className="size-full object-cover" /> : <div className="flex size-full items-center justify-center"><ImageIcon className="size-5 text-muted-foreground" /></div>}
              </div>
              <Input value={article.image} onChange={(e) => onChange({ ...data, articles: articles.map((x, j) => (j === i ? { ...x, image: e.target.value } : x)) })} placeholder="رابط الصورة" className="h-8 text-sm" />
              <div className="border border-[#E5E7EB] rounded-lg p-2 space-y-1 bg-[#F8FAFC]">
                <span className="text-xs font-bold text-[#64748B]">التصنيف</span>
                <div className="grid grid-cols-2 gap-2">
                  <Input value={article.badge_ar ?? ''} onChange={(e) => onChange({ ...data, articles: articles.map((x, j) => (j === i ? { ...x, badge_ar: e.target.value } : x)) })} placeholder="بالعربية" className="h-8 text-sm" />
                  <Input value={article.badge_fr ?? ''} onChange={(e) => onChange({ ...data, articles: articles.map((x, j) => (j === i ? { ...x, badge_fr: e.target.value } : x)) })} placeholder="en français" className="h-8 text-sm" />
                </div>
              </div>
              <div className="border border-[#E5E7EB] rounded-lg p-2 space-y-1 bg-[#F8FAFC]">
                <span className="text-xs font-bold text-[#64748B]">العنوان</span>
                <div className="grid grid-cols-2 gap-2">
                  <Input value={article.title_ar ?? ''} onChange={(e) => onChange({ ...data, articles: articles.map((x, j) => (j === i ? { ...x, title_ar: e.target.value } : x)) })} placeholder="بالعربية" className="h-8 text-sm" />
                  <Input value={article.title_fr ?? ''} onChange={(e) => onChange({ ...data, articles: articles.map((x, j) => (j === i ? { ...x, title_fr: e.target.value } : x)) })} placeholder="en français" className="h-8 text-sm" />
                </div>
              </div>
              <div className="border border-[#E5E7EB] rounded-lg p-2 space-y-1 bg-[#F8FAFC]">
                <span className="text-xs font-bold text-[#64748B]">الوصف المختصر</span>
                <div className="grid grid-cols-2 gap-2">
                  <Textarea value={article.excerpt_ar ?? ''} onChange={(e) => onChange({ ...data, articles: articles.map((x, j) => (j === i ? { ...x, excerpt_ar: e.target.value } : x)) })} placeholder="بالعربية" className="min-h-12 resize-y text-sm" />
                  <Textarea value={article.excerpt_fr ?? ''} onChange={(e) => onChange({ ...data, articles: articles.map((x, j) => (j === i ? { ...x, excerpt_fr: e.target.value } : x)) })} placeholder="en français" className="min-h-12 resize-y text-sm" />
                </div>
              </div>
              <div className="border border-[#E5E7EB] rounded-lg p-2 space-y-1 bg-[#F8FAFC]">
                <span className="text-xs font-bold text-[#64748B]">التاريخ</span>
                <div className="grid grid-cols-2 gap-2">
                  <Input value={article.date_ar ?? ''} onChange={(e) => onChange({ ...data, articles: articles.map((x, j) => (j === i ? { ...x, date_ar: e.target.value } : x)) })} placeholder="بالعربية" className="h-8 text-sm" />
                  <Input value={article.date_fr ?? ''} onChange={(e) => onChange({ ...data, articles: articles.map((x, j) => (j === i ? { ...x, date_fr: e.target.value } : x)) })} placeholder="en français" className="h-8 text-sm" />
                </div>
              </div>
              <div className="border border-[#E5E7EB] rounded-lg p-2 space-y-1 bg-[#F8FAFC]">
                <span className="text-xs font-bold text-[#64748B]">مدة القراءة</span>
                <div className="grid grid-cols-2 gap-2">
                  <Input value={article.readTime_ar ?? ''} onChange={(e) => onChange({ ...data, articles: articles.map((x, j) => (j === i ? { ...x, readTime_ar: e.target.value } : x)) })} placeholder="بالعربية" className="h-8 text-sm" />
                  <Input value={article.readTime_fr ?? ''} onChange={(e) => onChange({ ...data, articles: articles.map((x, j) => (j === i ? { ...x, readTime_fr: e.target.value } : x)) })} placeholder="en français" className="h-8 text-sm" />
                </div>
              </div>
              <Input value={article.linkUrl} onChange={(e) => onChange({ ...data, articles: articles.map((x, j) => (j === i ? { ...x, linkUrl: e.target.value } : x)) })} placeholder="الرابط" className="h-8 text-sm" />
            </div>
          </RepeaterItem>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => onChange({ ...data, articles: [...articles, { image: '', badge_ar: '', badge_fr: '', title_ar: '', title_fr: '', excerpt_ar: '', excerpt_fr: '', date_ar: '', date_fr: '', readTime_ar: '', readTime_fr: '', linkUrl: '#' }] })}>
          <Plus className="size-3.5" /> إضافة مقال
        </Button>
      </div>
    </div>
  )
}

// MAGAZINE CATEGORIES  (_renderer: "magCats")
function MagCatsEditor({ data, onChange }: CustomEditorProps) {
  const categories = (data.categories ?? []) as Array<{ title_ar: string; title_fr: string; count_ar: string; count_fr: string }>

  return (
    <div className="space-y-3">
      <div className="border border-[#E5E7EB] rounded-lg p-3 space-y-2 bg-[#F8FAFC]">
        <span className="text-xs font-bold text-[#123B78]">Eyebrow</span>
        <div className="grid grid-cols-2 gap-2">
          <FieldGroup label="العربية"><Input value={(data.eyebrow_ar as string) ?? ''} onChange={(e) => onChange({ ...data, eyebrow_ar: e.target.value })} placeholder="بالعربية" className="h-8 text-sm" /></FieldGroup>
          <FieldGroup label="Français"><Input value={(data.eyebrow_fr as string) ?? ''} onChange={(e) => onChange({ ...data, eyebrow_fr: e.target.value })} placeholder="en français" className="h-8 text-sm" /></FieldGroup>
        </div>
      </div>
      <div className="border border-[#E5E7EB] rounded-lg p-3 space-y-2 bg-[#F8FAFC]">
        <span className="text-xs font-bold text-[#123B78]">العنوان</span>
        <div className="grid grid-cols-2 gap-2">
          <FieldGroup label="العربية"><Input value={(data.heading_ar as string) ?? ''} onChange={(e) => onChange({ ...data, heading_ar: e.target.value })} placeholder="بالعربية" className="h-8 text-sm" /></FieldGroup>
          <FieldGroup label="Français"><Input value={(data.heading_fr as string) ?? ''} onChange={(e) => onChange({ ...data, heading_fr: e.target.value })} placeholder="en français" className="h-8 text-sm" /></FieldGroup>
        </div>
      </div>
      <div className="border border-[#E5E7EB] rounded-lg p-3 space-y-2 bg-[#F8FAFC]">
        <span className="text-xs font-bold text-[#123B78]">الوصف</span>
        <div className="grid grid-cols-2 gap-2">
          <FieldGroup label="العربية"><Input value={(data.description_ar as string) ?? ''} onChange={(e) => onChange({ ...data, description_ar: e.target.value })} placeholder="بالعربية" className="h-8 text-sm" /></FieldGroup>
          <FieldGroup label="Français"><Input value={(data.description_fr as string) ?? ''} onChange={(e) => onChange({ ...data, description_fr: e.target.value })} placeholder="en français" className="h-8 text-sm" /></FieldGroup>
        </div>
      </div>
      <div className="space-y-2">
        <SectionLabel>الفئات</SectionLabel>
        {categories.map((cat, i) => (
          <RepeaterItem key={i} onDelete={() => onChange({ ...data, categories: categories.filter((_, j) => j !== i) })}>
            <div className="space-y-1.5 pr-5">
              <div className="border border-[#E5E7EB] rounded-lg p-2 space-y-1 bg-[#F8FAFC]">
                <span className="text-xs font-bold text-[#64748B]">اسم الفئة</span>
                <div className="grid grid-cols-2 gap-2">
                  <Input value={cat.title_ar ?? ''} onChange={(e) => onChange({ ...data, categories: categories.map((x, j) => (j === i ? { ...x, title_ar: e.target.value } : x)) })} placeholder="بالعربية" className="h-8 text-sm" />
                  <Input value={cat.title_fr ?? ''} onChange={(e) => onChange({ ...data, categories: categories.map((x, j) => (j === i ? { ...x, title_fr: e.target.value } : x)) })} placeholder="en français" className="h-8 text-sm" />
                </div>
              </div>
              <div className="border border-[#E5E7EB] rounded-lg p-2 space-y-1 bg-[#F8FAFC]">
                <span className="text-xs font-bold text-[#64748B]">العدد</span>
                <div className="grid grid-cols-2 gap-2">
                  <Input value={cat.count_ar ?? ''} onChange={(e) => onChange({ ...data, categories: categories.map((x, j) => (j === i ? { ...x, count_ar: e.target.value } : x)) })} placeholder="بالعربية" className="h-8 text-sm" />
                  <Input value={cat.count_fr ?? ''} onChange={(e) => onChange({ ...data, categories: categories.map((x, j) => (j === i ? { ...x, count_fr: e.target.value } : x)) })} placeholder="en français" className="h-8 text-sm" />
                </div>
              </div>
            </div>
          </RepeaterItem>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => onChange({ ...data, categories: [...categories, { title_ar: '', title_fr: '', count_ar: '', count_fr: '' }] })}>
          <Plus className="size-3.5" /> إضافة فئة
        </Button>
      </div>
    </div>
  )
}

// MAGAZINE NEWSLETTER  (_renderer: "magNewsletter")
function MagNewsletterEditor({ data, onChange }: CustomEditorProps) {
  return (
    <div className="space-y-3">
      <div className="border border-[#E5E7EB] rounded-lg p-3 space-y-2 bg-[#F8FAFC]">
        <span className="text-xs font-bold text-[#123B78]">العنوان الرئيسي</span>
        <div className="grid grid-cols-2 gap-2">
          <FieldGroup label="العربية"><Input value={(data.heading_ar as string) ?? ''} onChange={(e) => onChange({ ...data, heading_ar: e.target.value })} placeholder="بالعربية" className="h-8 text-sm" /></FieldGroup>
          <FieldGroup label="Français"><Input value={(data.heading_fr as string) ?? ''} onChange={(e) => onChange({ ...data, heading_fr: e.target.value })} placeholder="en français" className="h-8 text-sm" /></FieldGroup>
        </div>
      </div>
      <div className="border border-[#E5E7EB] rounded-lg p-3 space-y-2 bg-[#F8FAFC]">
        <span className="text-xs font-bold text-[#123B78]">الوصف</span>
        <div className="grid grid-cols-2 gap-2">
          <FieldGroup label="العربية"><Textarea value={(data.description_ar as string) ?? ''} onChange={(e) => onChange({ ...data, description_ar: e.target.value })} placeholder="بالعربية" className="min-h-16 resize-y text-sm" /></FieldGroup>
          <FieldGroup label="Français"><Textarea value={(data.description_fr as string) ?? ''} onChange={(e) => onChange({ ...data, description_fr: e.target.value })} placeholder="en français" className="min-h-16 resize-y text-sm" /></FieldGroup>
        </div>
      </div>
      <div className="border border-[#E5E7EB] rounded-lg p-3 space-y-2 bg-[#F8FAFC]">
        <span className="text-xs font-bold text-[#123B78]">نص زر الاشتراك</span>
        <div className="grid grid-cols-2 gap-2">
          <FieldGroup label="العربية"><Input value={(data.buttonLabel_ar as string) ?? ''} onChange={(e) => onChange({ ...data, buttonLabel_ar: e.target.value })} placeholder="بالعربية" className="h-8 text-sm" /></FieldGroup>
          <FieldGroup label="Français"><Input value={(data.buttonLabel_fr as string) ?? ''} onChange={(e) => onChange({ ...data, buttonLabel_fr: e.target.value })} placeholder="en français" className="h-8 text-sm" /></FieldGroup>
        </div>
      </div>
    </div>
  )
}

// MAGAZINE FINAL CTA  (_renderer: "magCta")
function MagCtaEditor({ data, onChange }: CustomEditorProps) {
  const buttons = (data.buttons ?? []) as Array<{ id: string; label_ar: string; label_fr: string; url: string; variant: string }>

  return (
    <div className="space-y-3">
      <div className="border border-[#E5E7EB] rounded-lg p-3 space-y-2 bg-[#F8FAFC]">
        <span className="text-xs font-bold text-[#123B78]">العنوان الرئيسي</span>
        <div className="grid grid-cols-2 gap-2">
          <FieldGroup label="العربية"><Input value={(data.heading_ar as string) ?? ''} onChange={(e) => onChange({ ...data, heading_ar: e.target.value })} placeholder="بالعربية" className="h-8 text-sm" /></FieldGroup>
          <FieldGroup label="Français"><Input value={(data.heading_fr as string) ?? ''} onChange={(e) => onChange({ ...data, heading_fr: e.target.value })} placeholder="en français" className="h-8 text-sm" /></FieldGroup>
        </div>
      </div>

      <div className="space-y-2">
        <SectionLabel>الأزرار</SectionLabel>
        {buttons.map((btn, i) => (
          <RepeaterItem key={btn.id || i} onDelete={() => onChange({ ...data, buttons: buttons.filter((_, j) => j !== i) })}>
            <div className="space-y-1.5 pr-5">
              <div className="border border-[#E5E7EB] rounded-lg p-2 space-y-1 bg-[#F8FAFC]">
                <span className="text-xs font-bold text-[#64748B]">نص الزر</span>
                <div className="grid grid-cols-2 gap-2">
                  <Input value={btn.label_ar ?? ''} onChange={(e) => onChange({ ...data, buttons: buttons.map((x, j) => (j === i ? { ...x, label_ar: e.target.value } : x)) })} placeholder="بالعربية" className="h-8 text-sm" />
                  <Input value={btn.label_fr ?? ''} onChange={(e) => onChange({ ...data, buttons: buttons.map((x, j) => (j === i ? { ...x, label_fr: e.target.value } : x)) })} placeholder="en français" className="h-8 text-sm" />
                </div>
              </div>
              <Input value={btn.url} onChange={(e) => onChange({ ...data, buttons: buttons.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)) })} placeholder="الرابط" className="h-8 text-sm" />
              <select value={btn.variant} onChange={(e) => onChange({ ...data, buttons: buttons.map((x, j) => (j === i ? { ...x, variant: e.target.value } : x)) })} className="h-8 w-full rounded-lg border border-[#E5E7EB] bg-transparent px-2.5 text-xs"><option value="primary">Primary</option><option value="secondary">Secondary</option><option value="outline">Outline</option></select>
            </div>
          </RepeaterItem>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => onChange({ ...data, buttons: [...buttons, { id: 'btn-'+Date.now(), label_ar:'',label_fr:'',url:'#',variant:'primary' }] })}>
          <Plus className="size-3.5" /> إضافة زر
        </Button>
      </div>
    </div>
  )
}

// =====================================================================
// DOCUMENTS (وثائق الانخراط)  custom renderers
// =====================================================================

// DOCUMENTS GRID  (_renderer: "docGrid")
function DocGridEditor({ data, onChange }: CustomEditorProps) {
  const documents = (data.documents ?? []) as Array<{
    title: string
    description: string
    format: string
    size: string
    date: string
    buttonLabel: string
    url: string
  }>

  return (
    <div className="space-y-3">
      <FieldGroup label="العنوان الفرعي (Eyebrow)">
        <Input value={(data.eyebrow as string) ?? ''} onChange={(e) => onChange({ ...data, eyebrow: e.target.value })} className="h-9 text-sm" />
      </FieldGroup>
      <FieldGroup label="العنوان الرئيسي">
        <Input value={(data.heading as string) ?? ''} onChange={(e) => onChange({ ...data, heading: e.target.value })} className="h-9 text-sm" />
      </FieldGroup>
      <FieldGroup label="الوصف">
        <Input value={(data.description as string) ?? ''} onChange={(e) => onChange({ ...data, description: e.target.value })} className="h-9 text-sm" />
      </FieldGroup>

      <div className="space-y-2">
        <SectionLabel>الوثائق</SectionLabel>
        {documents.map((doc, i) => (
          <RepeaterItem key={i} onDelete={() => onChange({ ...data, documents: documents.filter((_, j) => j !== i) })}>
            <div className="space-y-2 pr-5">
              <div className="flex gap-2">
                <Input value={doc.title} onChange={(e) => onChange({ ...data, documents: documents.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)) })} placeholder="اسم الوثيقة" className="h-8 flex-1 text-sm font-medium" />
                <Input value={doc.format} onChange={(e) => onChange({ ...data, documents: documents.map((x, j) => (j === i ? { ...x, format: e.target.value } : x)) })} placeholder="الصيغة (PDF/DOCX)" className="h-8 w-24 text-sm" />
              </div>
              <Textarea value={doc.description} onChange={(e) => onChange({ ...data, documents: documents.map((x, j) => (j === i ? { ...x, description: e.target.value } : x)) })} placeholder="الوصف" className="min-h-14 resize-y text-sm" />
              <div className="flex gap-2">
                <Input value={doc.size} onChange={(e) => onChange({ ...data, documents: documents.map((x, j) => (j === i ? { ...x, size: e.target.value } : x)) })} placeholder="الحجم (مثال: 1.2 MB)" className="h-8 w-28 text-sm" />
                <Input value={doc.date} onChange={(e) => onChange({ ...data, documents: documents.map((x, j) => (j === i ? { ...x, date: e.target.value } : x)) })} placeholder="التاريخ" className="h-8 flex-1 text-sm" />
              </div>
              <div className="flex gap-2">
                <Input value={doc.buttonLabel} onChange={(e) => onChange({ ...data, documents: documents.map((x, j) => (j === i ? { ...x, buttonLabel: e.target.value } : x)) })} placeholder="نص زر التحميل" className="h-8 flex-1 text-sm" />
                <Input value={doc.url} onChange={(e) => onChange({ ...data, documents: documents.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)) })} placeholder="رابط التحميل" className="h-8 flex-1 text-sm" />
              </div>
            </div>
          </RepeaterItem>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => onChange({ ...data, documents: [...documents, { title: '', description: '', format: 'PDF', size: '', date: '', buttonLabel: '', url: '#' }] })}>
          <Plus className="size-3.5" /> إضافة وثيقة
        </Button>
      </div>
    </div>
  )
}

// DOWNLOAD ALL  (_renderer: "docDownload")
function DocDownloadEditor({ data, onChange }: CustomEditorProps) {
  return (
    <div className="space-y-3">
      <FieldGroup label="العنوان الرئيسي">
        <Input value={(data.heading as string) ?? ''} onChange={(e) => onChange({ ...data, heading: e.target.value })} className="h-9 text-sm" />
      </FieldGroup>
      <FieldGroup label="الوصف">
        <Textarea value={(data.description as string) ?? ''} onChange={(e) => onChange({ ...data, description: e.target.value })} className="min-h-20 resize-y text-sm" />
      </FieldGroup>
      <div className="grid grid-cols-2 gap-2">
        <FieldGroup label="نص الزر">
          <Input value={(data.buttonLabel as string) ?? ''} onChange={(e) => onChange({ ...data, buttonLabel: e.target.value })} className="h-9 text-sm" />
        </FieldGroup>
        <FieldGroup label="الرابط">
          <Input value={(data.url as string) ?? ''} onChange={(e) => onChange({ ...data, url: e.target.value })} className="h-9 text-sm" />
        </FieldGroup>
      </div>
    </div>
  )
}

// MEMBERSHIP REQUIREMENTS  (_renderer: "docRequirements")
function DocRequirementsEditor({ data, onChange }: CustomEditorProps) {
  const items = (data.items ?? []) as string[]

  return (
    <div className="space-y-3">
      <FieldGroup label="العنوان الفرعي (Eyebrow)">
        <Input value={(data.eyebrow as string) ?? ''} onChange={(e) => onChange({ ...data, eyebrow: e.target.value })} className="h-9 text-sm" />
      </FieldGroup>
      <FieldGroup label="العنوان الرئيسي">
        <Input value={(data.heading as string) ?? ''} onChange={(e) => onChange({ ...data, heading: e.target.value })} className="h-9 text-sm" />
      </FieldGroup>
      <FieldGroup label="الوصف">
        <Input value={(data.description as string) ?? ''} onChange={(e) => onChange({ ...data, description: e.target.value })} className="h-9 text-sm" />
      </FieldGroup>

      <div className="space-y-2">
        <SectionLabel>المتطلبات</SectionLabel>
        {items.map((item, i) => (
          <RepeaterItem key={i} onDelete={() => onChange({ ...data, items: items.filter((_, j) => j !== i) })}>
            <Input value={item} onChange={(e) => onChange({ ...data, items: items.map((x, j) => (j === i ? e.target.value : x)) })} placeholder="شرط" className="h-8 pr-5 text-sm" />
          </RepeaterItem>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => onChange({ ...data, items: [...items, ''] })}>
          <Plus className="size-3.5" /> إضافة شرط
        </Button>
      </div>
    </div>
  )
}

// FAQ  (_renderer: "docFaq")
function DocFaqEditor({ data, onChange }: CustomEditorProps) {
  const items = (data.items ?? []) as Array<{ question: string; answer: string }>

  return (
    <div className="space-y-3">
      <FieldGroup label="العنوان الفرعي (Eyebrow)">
        <Input value={(data.eyebrow as string) ?? ''} onChange={(e) => onChange({ ...data, eyebrow: e.target.value })} className="h-9 text-sm" />
      </FieldGroup>
      <FieldGroup label="العنوان الرئيسي">
        <Input value={(data.heading as string) ?? ''} onChange={(e) => onChange({ ...data, heading: e.target.value })} className="h-9 text-sm" />
      </FieldGroup>
      <FieldGroup label="الوصف">
        <Input value={(data.description as string) ?? ''} onChange={(e) => onChange({ ...data, description: e.target.value })} className="h-9 text-sm" />
      </FieldGroup>

      <div className="space-y-2">
        <SectionLabel>الأسئلة</SectionLabel>
        {items.map((item, i) => (
          <RepeaterItem key={i} onDelete={() => onChange({ ...data, items: items.filter((_, j) => j !== i) })}>
            <div className="space-y-2 pr-5">
              <Input value={item.question} onChange={(e) => onChange({ ...data, items: items.map((x, j) => (j === i ? { ...x, question: e.target.value } : x)) })} placeholder="السؤال" className="h-8 text-sm font-medium" />
              <Textarea value={item.answer} onChange={(e) => onChange({ ...data, items: items.map((x, j) => (j === i ? { ...x, answer: e.target.value } : x)) })} placeholder="الجواب" className="min-h-16 resize-y text-sm" />
            </div>
          </RepeaterItem>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => onChange({ ...data, items: [...items, { question: '', answer: '' }] })}>
          <Plus className="size-3.5" /> إضافة سؤال
        </Button>
      </div>
    </div>
  )
}

// DOCUMENTS FINAL CTA  (_renderer: "docCta")
function DocCtaEditor({ data, onChange }: CustomEditorProps) {
  const buttons = (data.buttons ?? []) as Array<{ id: string; label?: string; label_ar?: string; label_fr?: string; url: string; variant: string }>

  return (
    <div className="space-y-3">
      <FieldGroup label="العنوان الرئيسي">
        <Input value={(data.heading as string) ?? ''} onChange={(e) => onChange({ ...data, heading: e.target.value })} className="h-9 text-sm" />
      </FieldGroup>
      <FieldGroup label="الوصف">
        <Textarea value={(data.description as string) ?? ''} onChange={(e) => onChange({ ...data, description: e.target.value })} className="min-h-20 resize-y text-sm" />
      </FieldGroup>

      <div className="space-y-2">
        <SectionLabel>الأزرار</SectionLabel>
        {buttons.map((btn, i) => (
          <RepeaterItem key={i} onDelete={() => onChange({ ...data, buttons: buttons.filter((_, j) => j !== i) })}>
            <div className="flex gap-2 pr-5">
              <Input value={btn.label} onChange={(e) => onChange({ ...data, buttons: buttons.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)) })} placeholder="نص الزر" className="h-8 flex-1 text-sm" />
              <Input value={btn.url} onChange={(e) => onChange({ ...data, buttons: buttons.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)) })} placeholder="الرابط" className="h-8 flex-1 text-sm" />
            </div>
          </RepeaterItem>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => onChange({ ...data, buttons: [...buttons, { id: `btn-${Date.now()}`, label: '', url: '#', variant: 'primary' }] })}>
          <Plus className="size-3.5" /> إضافة زر
        </Button>
      </div>
    </div>
  )
}

// =====================================================================
// NEWS (الأخبار)  custom renderers
// =====================================================================

// FEATURED NEWS HEAD  (_renderer: "nwFeatured")
// =====================================================================
// NEWS — FEATURED  (_renderer: "nwFeatured")
// =====================================================================
function NwFeaturedEditor({ data, onChange }: CustomEditorProps) {
  return (
    <div className="space-y-3">
      <div className="border border-[#E5E7EB] rounded-lg p-3 space-y-2 bg-[#F8FAFC]">
        <span className="text-xs font-bold text-[#123B78]">العنوان الفرعي (Eyebrow)</span>
        <div className="grid grid-cols-2 gap-2">
          <FieldGroup label="العربية">
            <Input value={(data.eyebrow_ar as string) ?? ''} onChange={(e) => onChange({ ...data, eyebrow_ar: e.target.value })} placeholder="بالعربية" className="h-8 text-sm" />
          </FieldGroup>
          <FieldGroup label="Français">
            <Input value={(data.eyebrow_fr as string) ?? ''} onChange={(e) => onChange({ ...data, eyebrow_fr: e.target.value })} placeholder="en français" className="h-8 text-sm" />
          </FieldGroup>
        </div>
      </div>
      <div className="border border-[#E5E7EB] rounded-lg p-3 space-y-2 bg-[#F8FAFC]">
        <span className="text-xs font-bold text-[#123B78]">العنوان الرئيسي</span>
        <div className="grid grid-cols-2 gap-2">
          <FieldGroup label="العربية">
            <Input value={(data.heading_ar as string) ?? ''} onChange={(e) => onChange({ ...data, heading_ar: e.target.value })} placeholder="بالعربية" className="h-8 text-sm" />
          </FieldGroup>
          <FieldGroup label="Français">
            <Input value={(data.heading_fr as string) ?? ''} onChange={(e) => onChange({ ...data, heading_fr: e.target.value })} placeholder="en français" className="h-8 text-sm" />
          </FieldGroup>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">الخبر المميز نفسه يُحرَّر في قسم «أحدث الأخبار» — البطاقة المميزة تعرض الخبر الأول المعلَّم بخانة «مميز».</p>
    </div>
  )
}

// =====================================================================
// NEWS — LATEST GRID  (_renderer: "nwGrid")
// =====================================================================
function NwGridEditor({ data, onChange }: CustomEditorProps) {
  const items = (data.items ?? []) as Array<{
    category: string
    catLabel_ar: string
    catLabel_fr: string
    featured: boolean
    title_ar: string
    title_fr: string
    summary_ar: string
    summary_fr: string
    author_ar: string
    author_fr: string
    date: string
    image: string
    linkUrl: string
    linkLabel_ar: string
    linkLabel_fr: string
  }>

  return (
    <div className="space-y-3">
      <div className="border border-[#E5E7EB] rounded-lg p-3 space-y-2 bg-[#F8FAFC]">
        <span className="text-xs font-bold text-[#123B78]">العنوان الفرعي (Eyebrow)</span>
        <div className="grid grid-cols-2 gap-2">
          <FieldGroup label="العربية">
            <Input value={(data.eyebrow_ar as string) ?? ''} onChange={(e) => onChange({ ...data, eyebrow_ar: e.target.value })} placeholder="بالعربية" className="h-8 text-sm" />
          </FieldGroup>
          <FieldGroup label="Français">
            <Input value={(data.eyebrow_fr as string) ?? ''} onChange={(e) => onChange({ ...data, eyebrow_fr: e.target.value })} placeholder="en français" className="h-8 text-sm" />
          </FieldGroup>
        </div>
      </div>
      <div className="border border-[#E5E7EB] rounded-lg p-3 space-y-2 bg-[#F8FAFC]">
        <span className="text-xs font-bold text-[#123B78]">العنوان الرئيسي</span>
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
        <span className="text-xs font-bold text-[#123B78]">الوصف</span>
        <div className="grid grid-cols-2 gap-2">
          <FieldGroup label="العربية">
            <Input value={(data.description_ar as string) ?? ''} onChange={(e) => onChange({ ...data, description_ar: e.target.value })} placeholder="بالعربية" className="h-8 text-sm" />
          </FieldGroup>
          <FieldGroup label="Français">
            <Input value={(data.description_fr as string) ?? ''} onChange={(e) => onChange({ ...data, description_fr: e.target.value })} placeholder="en français" className="h-8 text-sm" />
          </FieldGroup>
        </div>
      </div>

      <div className="space-y-2">
        <SectionLabel>الأخبار</SectionLabel>
        {items.map((item, i) => (
          <RepeaterItem key={i} onDelete={() => onChange({ ...data, items: items.filter((_, j) => j !== i) })}>
            <div className="space-y-1.5 pr-5">
              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  checked={Boolean(item.featured)}
                  onChange={(e) => onChange({ ...data, items: items.map((x, j) => (j === i ? { ...x, featured: e.target.checked } : x)) })}
                  className="size-3.5"
                />
                خبر مميز (يُعرض في قسم «أبرز الأخبار»)
              </label>
              <div className="flex gap-2">
                <Input value={item.category} onChange={(e) => onChange({ ...data, items: items.map((x, j) => (j === i ? { ...x, category: e.target.value } : x)) })} placeholder="معرف الفئة (activities…)" className="h-8 w-32 text-sm" />
                <Input value={item.catLabel_ar ?? ''} onChange={(e) => onChange({ ...data, items: items.map((x, j) => (j === i ? { ...x, catLabel_ar: e.target.value } : x)) })} placeholder="تسمية الفئة (عربي)" className="h-8 flex-1 text-sm" />
                <Input value={item.catLabel_fr ?? ''} onChange={(e) => onChange({ ...data, items: items.map((x, j) => (j === i ? { ...x, catLabel_fr: e.target.value } : x)) })} placeholder="تسمية الفئة (FR)" className="h-8 flex-1 text-sm" />
              </div>
              <div className="relative aspect-video w-full overflow-hidden rounded-md bg-muted">
                {item.image ? (
                  <img src={item.image} alt="" className="size-full object-cover" />
                ) : (
                  <div className="flex size-full items-center justify-center">
                    <ImageIcon className="size-5 text-muted-foreground" />
                  </div>
                )}
              </div>
              <Input value={item.image} onChange={(e) => onChange({ ...data, items: items.map((x, j) => (j === i ? { ...x, image: e.target.value } : x)) })} placeholder="رابط الصورة" className="h-8 text-sm" />
              <div className="border border-[#E5E7EB] rounded-lg p-2 space-y-1 bg-[#F8FAFC]">
                <span className="text-xs font-bold text-[#64748B]">العنوان</span>
                <div className="grid grid-cols-2 gap-2">
                  <Input value={item.title_ar ?? ''} onChange={(e) => onChange({ ...data, items: items.map((x, j) => (j === i ? { ...x, title_ar: e.target.value } : x)) })} placeholder="بالعربية" className="h-8 text-sm" />
                  <Input value={item.title_fr ?? ''} onChange={(e) => onChange({ ...data, items: items.map((x, j) => (j === i ? { ...x, title_fr: e.target.value } : x)) })} placeholder="en français" className="h-8 text-sm" />
                </div>
              </div>
              <div className="border border-[#E5E7EB] rounded-lg p-2 space-y-1 bg-[#F8FAFC]">
                <span className="text-xs font-bold text-[#64748B]">الوصف</span>
                <div className="grid grid-cols-2 gap-2">
                  <Textarea value={item.summary_ar ?? ''} onChange={(e) => onChange({ ...data, items: items.map((x, j) => (j === i ? { ...x, summary_ar: e.target.value } : x)) })} placeholder="بالعربية" className="min-h-14 resize-y text-sm" />
                  <Textarea value={item.summary_fr ?? ''} onChange={(e) => onChange({ ...data, items: items.map((x, j) => (j === i ? { ...x, summary_fr: e.target.value } : x)) })} placeholder="en français" className="min-h-14 resize-y text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="border border-[#E5E7EB] rounded-lg p-2 space-y-1 bg-[#F8FAFC]">
                  <span className="text-xs font-bold text-[#64748B]">المؤلف</span>
                  <div className="grid grid-cols-2 gap-2">
                    <Input value={item.author_ar ?? ''} onChange={(e) => onChange({ ...data, items: items.map((x, j) => (j === i ? { ...x, author_ar: e.target.value } : x)) })} placeholder="بالعربية" className="h-8 text-sm" />
                    <Input value={item.author_fr ?? ''} onChange={(e) => onChange({ ...data, items: items.map((x, j) => (j === i ? { ...x, author_fr: e.target.value } : x)) })} placeholder="en français" className="h-8 text-sm" />
                  </div>
                </div>
                <div className="border border-[#E5E7EB] rounded-lg p-2 space-y-1 bg-[#F8FAFC]">
                  <span className="text-xs font-bold text-[#64748B]">نص الرابط</span>
                  <div className="grid grid-cols-2 gap-2">
                    <Input value={item.linkLabel_ar ?? ''} onChange={(e) => onChange({ ...data, items: items.map((x, j) => (j === i ? { ...x, linkLabel_ar: e.target.value } : x)) })} placeholder="بالعربية" className="h-8 text-sm" />
                    <Input value={item.linkLabel_fr ?? ''} onChange={(e) => onChange({ ...data, items: items.map((x, j) => (j === i ? { ...x, linkLabel_fr: e.target.value } : x)) })} placeholder="en français" className="h-8 text-sm" />
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Input value={item.date} onChange={(e) => onChange({ ...data, items: items.map((x, j) => (j === i ? { ...x, date: e.target.value } : x)) })} placeholder="التاريخ (مثال: 2026-08-05)" className="h-8 flex-1 text-sm" />
                <Input value={item.linkUrl} onChange={(e) => onChange({ ...data, items: items.map((x, j) => (j === i ? { ...x, linkUrl: e.target.value } : x)) })} placeholder="الرابط" className="h-8 flex-1 text-sm" />
              </div>
            </div>
          </RepeaterItem>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => onChange({ ...data, items: [...items, { category: 'activities', catLabel_ar: '', catLabel_fr: '', featured: false, title_ar: '', title_fr: '', summary_ar: '', summary_fr: '', author_ar: '', author_fr: '', date: '', image: '', linkUrl: '#', linkLabel_ar: 'اقرأ المزيد', linkLabel_fr: 'Lire la suite' }] })}>
          <Plus className="size-3.5" /> إضافة خبر
        </Button>
      </div>
    </div>
  )
}

// =====================================================================
// NEWS — CATEGORIES  (_renderer: "nwCategories")
// =====================================================================
function NwCategoriesEditor({ data, onChange }: CustomEditorProps) {
  const categories = (data.categories ?? []) as Array<{ id: string; label_ar: string; label_fr: string }>

  return (
    <div className="space-y-3">
      <div className="border border-[#E5E7EB] rounded-lg p-3 space-y-2 bg-[#F8FAFC]">
        <span className="text-xs font-bold text-[#123B78]">العنوان الفرعي (Eyebrow)</span>
        <div className="grid grid-cols-2 gap-2">
          <FieldGroup label="العربية">
            <Input value={(data.eyebrow_ar as string) ?? ''} onChange={(e) => onChange({ ...data, eyebrow_ar: e.target.value })} placeholder="بالعربية" className="h-8 text-sm" />
          </FieldGroup>
          <FieldGroup label="Français">
            <Input value={(data.eyebrow_fr as string) ?? ''} onChange={(e) => onChange({ ...data, eyebrow_fr: e.target.value })} placeholder="en français" className="h-8 text-sm" />
          </FieldGroup>
        </div>
      </div>
      <div className="border border-[#E5E7EB] rounded-lg p-3 space-y-2 bg-[#F8FAFC]">
        <span className="text-xs font-bold text-[#123B78]">العنوان الرئيسي</span>
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
        <span className="text-xs font-bold text-[#123B78]">الوصف</span>
        <div className="grid grid-cols-2 gap-2">
          <FieldGroup label="العربية">
            <Input value={(data.description_ar as string) ?? ''} onChange={(e) => onChange({ ...data, description_ar: e.target.value })} placeholder="بالعربية" className="h-8 text-sm" />
          </FieldGroup>
          <FieldGroup label="Français">
            <Input value={(data.description_fr as string) ?? ''} onChange={(e) => onChange({ ...data, description_fr: e.target.value })} placeholder="en français" className="h-8 text-sm" />
          </FieldGroup>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">أيقونات الفئات ثابتة في الصفحة ولا تتغير؛ الأعداد تُحسب تلقائياً من الأخبار. تأكد من أن «معرف الفئة» يطابق قيمة حقل category في الأخبار.</p>

      <div className="space-y-2">
        <SectionLabel>الفئات</SectionLabel>
        {categories.map((cat, i) => (
          <RepeaterItem key={i} onDelete={() => onChange({ ...data, categories: categories.filter((_, j) => j !== i) })}>
            <div className="space-y-1.5 pr-5">
              <Input value={cat.id} onChange={(e) => onChange({ ...data, categories: categories.map((x, j) => (j === i ? { ...x, id: e.target.value } : x)) })} placeholder="المعرف (activities…)" className="h-8 w-32 text-sm" />
              <div className="grid grid-cols-2 gap-2">
                <Input value={cat.label_ar ?? ''} onChange={(e) => onChange({ ...data, categories: categories.map((x, j) => (j === i ? { ...x, label_ar: e.target.value } : x)) })} placeholder="بالعربية" className="h-8 text-sm" />
                <Input value={cat.label_fr ?? ''} onChange={(e) => onChange({ ...data, categories: categories.map((x, j) => (j === i ? { ...x, label_fr: e.target.value } : x)) })} placeholder="en français" className="h-8 text-sm" />
              </div>
            </div>
          </RepeaterItem>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => onChange({ ...data, categories: [...categories, { id: '', label_ar: '', label_fr: '' }] })}>
          <Plus className="size-3.5" /> إضافة فئة
        </Button>
      </div>
    </div>
  )
}

// =====================================================================
// NEWS — SEARCH & FILTER  (_renderer: "nwSearch")
// =====================================================================
function NwSearchEditor({ data, onChange }: CustomEditorProps) {
  return (
    <div className="space-y-3">
      <div className="border border-[#E5E7EB] rounded-lg p-3 space-y-2 bg-[#F8FAFC]">
        <span className="text-xs font-bold text-[#123B78]">العنوان الفرعي (Eyebrow)</span>
        <div className="grid grid-cols-2 gap-2">
          <FieldGroup label="العربية">
            <Input value={(data.eyebrow_ar as string) ?? ''} onChange={(e) => onChange({ ...data, eyebrow_ar: e.target.value })} placeholder="بالعربية" className="h-8 text-sm" />
          </FieldGroup>
          <FieldGroup label="Français">
            <Input value={(data.eyebrow_fr as string) ?? ''} onChange={(e) => onChange({ ...data, eyebrow_fr: e.target.value })} placeholder="en français" className="h-8 text-sm" />
          </FieldGroup>
        </div>
      </div>
      <div className="border border-[#E5E7EB] rounded-lg p-3 space-y-2 bg-[#F8FAFC]">
        <span className="text-xs font-bold text-[#123B78]">العنوان الرئيسي</span>
        <div className="grid grid-cols-2 gap-2">
          <FieldGroup label="العربية">
            <Input value={(data.heading_ar as string) ?? ''} onChange={(e) => onChange({ ...data, heading_ar: e.target.value })} placeholder="بالعربية" className="h-8 text-sm" />
          </FieldGroup>
          <FieldGroup label="Français">
            <Input value={(data.heading_fr as string) ?? ''} onChange={(e) => onChange({ ...data, heading_fr: e.target.value })} placeholder="en français" className="h-8 text-sm" />
          </FieldGroup>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">حقل البحث والتصفية نفسه (بالفئة والسنة) ثابت ويعمل تلقائياً على الأخبار.</p>
    </div>
  )
}

// =====================================================================
// NEWS — NEWSLETTER  (_renderer: "nwNewsletter")
// =====================================================================
function NwNewsletterEditor({ data, onChange }: CustomEditorProps) {
  return (
    <div className="space-y-3">
      <div className="border border-[#E5E7EB] rounded-lg p-3 space-y-2 bg-[#F8FAFC]">
        <span className="text-xs font-bold text-[#123B78]">العنوان الرئيسي</span>
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
        <span className="text-xs font-bold text-[#123B78]">الوصف</span>
        <div className="grid grid-cols-2 gap-2">
          <FieldGroup label="العربية">
            <Input value={(data.description_ar as string) ?? ''} onChange={(e) => onChange({ ...data, description_ar: e.target.value })} placeholder="بالعربية" className="h-8 text-sm" />
          </FieldGroup>
          <FieldGroup label="Français">
            <Input value={(data.description_fr as string) ?? ''} onChange={(e) => onChange({ ...data, description_fr: e.target.value })} placeholder="en français" className="h-8 text-sm" />
          </FieldGroup>
        </div>
      </div>
      <div className="border border-[#E5E7EB] rounded-lg p-3 space-y-2 bg-[#F8FAFC]">
        <span className="text-xs font-bold text-[#123B78]">نص زر الاشتراك</span>
        <div className="grid grid-cols-2 gap-2">
          <FieldGroup label="العربية">
            <Input value={(data.buttonLabel_ar as string) ?? ''} onChange={(e) => onChange({ ...data, buttonLabel_ar: e.target.value })} placeholder="بالعربية" className="h-8 text-sm" />
          </FieldGroup>
          <FieldGroup label="Français">
            <Input value={(data.buttonLabel_fr as string) ?? ''} onChange={(e) => onChange({ ...data, buttonLabel_fr: e.target.value })} placeholder="en français" className="h-8 text-sm" />
          </FieldGroup>
        </div>
      </div>
    </div>
  )
}

// =====================================================================
// NEWS — FINAL CTA  (_renderer: "nwCta")
// =====================================================================
function NwCtaEditor({ data, onChange }: CustomEditorProps) {
  const buttons = (data.buttons ?? []) as Array<{ id: string; label_ar: string; label_fr: string; url: string; variant: string }>

  return (
    <div className="space-y-3">
      <div className="border border-[#E5E7EB] rounded-lg p-3 space-y-2 bg-[#F8FAFC]">
        <span className="text-xs font-bold text-[#123B78]">العنوان الرئيسي</span>
        <div className="grid grid-cols-2 gap-2">
          <FieldGroup label="العربية">
            <Input value={(data.heading_ar as string) ?? ''} onChange={(e) => onChange({ ...data, heading_ar: e.target.value })} placeholder="بالعربية" className="h-8 text-sm" />
          </FieldGroup>
          <FieldGroup label="Français">
            <Input value={(data.heading_fr as string) ?? ''} onChange={(e) => onChange({ ...data, heading_fr: e.target.value })} placeholder="en français" className="h-8 text-sm" />
          </FieldGroup>
        </div>
      </div>

      <div className="space-y-2">
        <SectionLabel>الأزرار</SectionLabel>
        {buttons.map((btn, i) => (
          <RepeaterItem key={btn.id || i} onDelete={() => onChange({ ...data, buttons: buttons.filter((_, j) => j !== i) })}>
            <div className="space-y-1.5 pr-5">
              <div className="border border-[#E5E7EB] rounded-lg p-2 space-y-1 bg-[#F8FAFC]">
                <span className="text-xs font-bold text-[#64748B]">نص الزر</span>
                <div className="grid grid-cols-2 gap-2">
                  <Input value={btn.label_ar ?? ''} onChange={(e) => onChange({ ...data, buttons: buttons.map((x, j) => (j === i ? { ...x, label_ar: e.target.value } : x)) })} placeholder="بالعربية" className="h-8 text-sm" />
                  <Input value={btn.label_fr ?? ''} onChange={(e) => onChange({ ...data, buttons: buttons.map((x, j) => (j === i ? { ...x, label_fr: e.target.value } : x)) })} placeholder="en français" className="h-8 text-sm" />
                </div>
              </div>
              <Input value={btn.url} onChange={(e) => onChange({ ...data, buttons: buttons.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)) })} placeholder="الرابط" className="h-8 text-sm" />
              <select
                value={btn.variant}
                onChange={(e) => onChange({ ...data, buttons: buttons.map((x, j) => (j === i ? { ...x, variant: e.target.value } : x)) })}
                className="h-8 w-full rounded-lg border border-[#E5E7EB] bg-transparent px-2.5 text-xs"
              >
                <option value="primary">Primary</option>
                <option value="secondary">Secondary</option>
                <option value="outline">Outline</option>
              </select>
            </div>
          </RepeaterItem>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => onChange({ ...data, buttons: [...buttons, { id: 'btn-' + Date.now(), label_ar: '', label_fr: '', url: '#', variant: 'primary' }] })}>
          <Plus className="size-3.5" /> إضافة زر
        </Button>
      </div>
    </div>
  )
}

// =====================================================================
// ARCHIVE (الأرشيف)  custom renderers
// =====================================================================

// ARCHIVE STATISTICS  (_renderer: "arStats")
function ArStatsEditor({ data, onChange }: CustomEditorProps) {
  const stats = (data.stats ?? []) as Array<{ display: string; count: string; label: string }>

  return (
    <div className="space-y-3">
      <FieldGroup label="العنوان الفرعي (Eyebrow)">
        <Input value={(data.eyebrow as string) ?? ''} onChange={(e) => onChange({ ...data, eyebrow: e.target.value })} className="h-9 text-sm" />
      </FieldGroup>
      <FieldGroup label="العنوان الرئيسي">
        <Input value={(data.heading as string) ?? ''} onChange={(e) => onChange({ ...data, heading: e.target.value })} className="h-9 text-sm" />
      </FieldGroup>
      <p className="text-xs text-muted-foreground">الأيقونات ثابتة في الصفحة ولا تتغير. «القيمة المعروضة» تحتفظ بعلامة + والفواصل؛ «العدد» يُستخدم في عدّاد الحركة.</p>

      <div className="space-y-2">
        <SectionLabel>الإحصائيات</SectionLabel>
        {stats.map((st, i) => (
          <RepeaterItem key={i} onDelete={() => onChange({ ...data, stats: stats.filter((_, j) => j !== i) })}>
            <div className="space-y-2 pr-5">
              <div className="flex gap-2">
                <Input value={st.display} onChange={(e) => onChange({ ...data, stats: stats.map((x, j) => (j === i ? { ...x, display: e.target.value } : x)) })} placeholder="القيمة المعروضة (مثال: +1,247)" className="h-8 flex-1 text-sm" />
                <Input value={st.count} onChange={(e) => onChange({ ...data, stats: stats.map((x, j) => (j === i ? { ...x, count: e.target.value } : x)) })} placeholder="العدد (1247)" className="h-8 w-28 text-sm" />
              </div>
              <Input value={st.label} onChange={(e) => onChange({ ...data, stats: stats.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)) })} placeholder="التسمية" className="h-8 text-sm" />
            </div>
          </RepeaterItem>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => onChange({ ...data, stats: [...stats, { display: '', count: '', label: '' }] })}>
          <Plus className="size-3.5" /> إضافة إحصائية
        </Button>
      </div>
    </div>
  )
}

// ARCHIVE CATEGORIES  (_renderer: "arCategories")
function ArCategoriesEditor({ data, onChange }: CustomEditorProps) {
  const categories = (data.categories ?? []) as Array<{ id: string; label: string }>

  return (
    <div className="space-y-3">
      <FieldGroup label="العنوان الفرعي (Eyebrow)">
        <Input value={(data.eyebrow as string) ?? ''} onChange={(e) => onChange({ ...data, eyebrow: e.target.value })} className="h-9 text-sm" />
      </FieldGroup>
      <FieldGroup label="العنوان الرئيسي">
        <Input value={(data.heading as string) ?? ''} onChange={(e) => onChange({ ...data, heading: e.target.value })} className="h-9 text-sm" />
      </FieldGroup>
      <FieldGroup label="الوصف">
        <Input value={(data.description as string) ?? ''} onChange={(e) => onChange({ ...data, description: e.target.value })} className="h-9 text-sm" />
      </FieldGroup>
      <p className="text-xs text-muted-foreground">أيقونات الفئات ثابتة في الصفحة ولا تتغير؛ الأعداد تُحسب تلقائياً من عناصر الأرشيف. تأكد من أن «معرف الفئة» يطابق قيمة حقل category في عناصر الأرشيف.</p>

      <div className="space-y-2">
        <SectionLabel>الفئات</SectionLabel>
        {categories.map((cat, i) => (
          <RepeaterItem key={i} onDelete={() => onChange({ ...data, categories: categories.filter((_, j) => j !== i) })}>
            <div className="flex gap-2 pr-5">
              <Input value={cat.id} onChange={(e) => onChange({ ...data, categories: categories.map((x, j) => (j === i ? { ...x, id: e.target.value } : x)) })} placeholder="المعرف (activities…)" className="h-8 w-32 text-sm" />
              <Input value={cat.label} onChange={(e) => onChange({ ...data, categories: categories.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)) })} placeholder="اسم الفئة" className="h-8 flex-1 text-sm" />
            </div>
          </RepeaterItem>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => onChange({ ...data, categories: [...categories, { id: '', label: '' }] })}>
          <Plus className="size-3.5" /> إضافة فئة
        </Button>
      </div>
    </div>
  )
}

// SEARCH & FILTER HEAD  (_renderer: "arSearch")
function ArSearchEditor({ data, onChange }: CustomEditorProps) {
  return (
    <div className="space-y-3">
      <FieldGroup label="العنوان الفرعي (Eyebrow)">
        <Input value={(data.eyebrow as string) ?? ''} onChange={(e) => onChange({ ...data, eyebrow: e.target.value })} className="h-9 text-sm" />
      </FieldGroup>
      <FieldGroup label="العنوان الرئيسي">
        <Input value={(data.heading as string) ?? ''} onChange={(e) => onChange({ ...data, heading: e.target.value })} className="h-9 text-sm" />
      </FieldGroup>
      <p className="text-xs text-muted-foreground">حقل البحث والتصفية نفسه (بالفئة والسنة) ثابت ويعمل تلقائياً على عناصر الأرشيف.</p>
    </div>
  )
}

// ARCHIVE LIBRARY GRID  (_renderer: "arLibrary")
const ARCHIVE_THUMB_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'ar-thumb-doc', label: 'وثيقة' },
  { value: 'ar-thumb-report', label: 'تقرير' },
  { value: 'ar-thumb-image', label: 'صورة' },
  { value: 'ar-thumb-video', label: 'فيديو' },
  { value: 'ar-thumb-publication', label: 'منشور' },
  { value: 'ar-thumb-official', label: 'وثيقة رسمية' },
]

function ArLibraryEditor({ data, onChange }: CustomEditorProps) {
  const items = (data.items ?? []) as Array<{
    category: string
    catLabel: string
    thumbClass: string
    title: string
    desc: string
    date: string
    linkUrl: string
    linkLabel: string
  }>

  return (
    <div className="space-y-3">
      <FieldGroup label="العنوان الفرعي (Eyebrow)">
        <Input value={(data.eyebrow as string) ?? ''} onChange={(e) => onChange({ ...data, eyebrow: e.target.value })} className="h-9 text-sm" />
      </FieldGroup>
      <FieldGroup label="العنوان الرئيسي">
        <Input value={(data.heading as string) ?? ''} onChange={(e) => onChange({ ...data, heading: e.target.value })} className="h-9 text-sm" />
      </FieldGroup>
      <FieldGroup label="الوصف">
        <Input value={(data.description as string) ?? ''} onChange={(e) => onChange({ ...data, description: e.target.value })} className="h-9 text-sm" />
      </FieldGroup>
      <p className="text-xs text-muted-foreground">لا توجد صور محتوى في هذه الصفحة؛ البطاقات تعرض أيقونة حسب نوع العنصر. «معرف الفئة» يطابق قيم خيارات البحث وفئات قسم الأرشيف.</p>

      <div className="space-y-2">
        <SectionLabel>عناصر الأرشيف</SectionLabel>
        {items.map((item, i) => (
          <RepeaterItem key={i} onDelete={() => onChange({ ...data, items: items.filter((_, j) => j !== i) })}>
            <div className="space-y-2 pr-5">
              <div className="flex gap-2">
                <Input value={item.catLabel} onChange={(e) => onChange({ ...data, items: items.map((x, j) => (j === i ? { ...x, catLabel: e.target.value } : x)) })} placeholder="تسمية الفئة" className="h-8 flex-1 text-sm" />
                <Input value={item.category} onChange={(e) => onChange({ ...data, items: items.map((x, j) => (j === i ? { ...x, category: e.target.value } : x)) })} placeholder="معرف الفئة (activities…)" className="h-8 flex-1 text-sm" />
              </div>
              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                نوع العنصر
                <select
                  value={item.thumbClass}
                  onChange={(e) => onChange({ ...data, items: items.map((x, j) => (j === i ? { ...x, thumbClass: e.target.value } : x)) })}
                  className="h-8 flex-1 rounded-md border border-input bg-background px-2 text-sm"
                >
                  {ARCHIVE_THUMB_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </label>
              <Input value={item.title} onChange={(e) => onChange({ ...data, items: items.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)) })} placeholder="العنوان" className="h-8 text-sm font-medium" />
              <Textarea value={item.desc} onChange={(e) => onChange({ ...data, items: items.map((x, j) => (j === i ? { ...x, desc: e.target.value } : x)) })} placeholder="الوصف" className="min-h-14 resize-y text-sm" />
              <Input value={item.date} onChange={(e) => onChange({ ...data, items: items.map((x, j) => (j === i ? { ...x, date: e.target.value } : x)) })} placeholder="التاريخ (مثال: 2025-09-15)" className="h-8 text-sm" />
              <div className="flex gap-2">
                <Input value={item.linkLabel} onChange={(e) => onChange({ ...data, items: items.map((x, j) => (j === i ? { ...x, linkLabel: e.target.value } : x)) })} placeholder="نص الرابط" className="h-8 flex-1 text-sm" />
                <Input value={item.linkUrl} onChange={(e) => onChange({ ...data, items: items.map((x, j) => (j === i ? { ...x, linkUrl: e.target.value } : x)) })} placeholder="الرابط" className="h-8 flex-1 text-sm" />
              </div>
            </div>
          </RepeaterItem>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => onChange({ ...data, items: [...items, { category: 'activities', catLabel: '', thumbClass: 'ar-thumb-doc', title: '', desc: '', date: '', linkUrl: '#', linkLabel: 'عرض التفاصيل' }] })}>
          <Plus className="size-3.5" /> إضافة عنصر
        </Button>
      </div>
    </div>
  )
}

// ARCHIVE DOWNLOADS  (_renderer: "arDownloads")
function ArDownloadsEditor({ data, onChange }: CustomEditorProps) {
  const items = (data.items ?? []) as Array<{ title: string; size: string; fileUrl: string; linkLabel: string }>

  return (
    <div className="space-y-3">
      <FieldGroup label="العنوان الفرعي (Eyebrow)">
        <Input value={(data.eyebrow as string) ?? ''} onChange={(e) => onChange({ ...data, eyebrow: e.target.value })} className="h-9 text-sm" />
      </FieldGroup>
      <FieldGroup label="العنوان الرئيسي">
        <Input value={(data.heading as string) ?? ''} onChange={(e) => onChange({ ...data, heading: e.target.value })} className="h-9 text-sm" />
      </FieldGroup>
      <p className="text-xs text-muted-foreground">أيقونات الملفات ثابتة في الصفحة ولا تتغير؛ التسمية «PDF • الحجم» تُنشأ تلقائياً من الحجم.</p>

      <div className="space-y-2">
        <SectionLabel>ملفات التحميل</SectionLabel>
        {items.map((dl, i) => (
          <RepeaterItem key={i} onDelete={() => onChange({ ...data, items: items.filter((_, j) => j !== i) })}>
            <div className="space-y-2 pr-5">
              <Input value={dl.title} onChange={(e) => onChange({ ...data, items: items.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)) })} placeholder="اسم الملف" className="h-8 text-sm font-medium" />
              <div className="flex gap-2">
                <Input value={dl.size} onChange={(e) => onChange({ ...data, items: items.map((x, j) => (j === i ? { ...x, size: e.target.value } : x)) })} placeholder="الحجم (مثال: 2.4 MB)" className="h-8 w-28 text-sm" />
                <Input value={dl.linkLabel} onChange={(e) => onChange({ ...data, items: items.map((x, j) => (j === i ? { ...x, linkLabel: e.target.value } : x)) })} placeholder="نص زر التحميل" className="h-8 flex-1 text-sm" />
              </div>
              <Input value={dl.fileUrl} onChange={(e) => onChange({ ...data, items: items.map((x, j) => (j === i ? { ...x, fileUrl: e.target.value } : x)) })} placeholder="رابط الملف" className="h-8 text-sm" />
            </div>
          </RepeaterItem>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => onChange({ ...data, items: [...items, { title: '', size: '', fileUrl: '#', linkLabel: 'تحميل' }] })}>
          <Plus className="size-3.5" /> إضافة ملف
        </Button>
      </div>
    </div>
  )
}

// ARCHIVE FAQ  (_renderer: "arFaq")
function ArFaqEditor({ data, onChange }: CustomEditorProps) {
  const items = (data.items ?? []) as Array<{ question: string; answer: string }>

  return (
    <div className="space-y-3">
      <FieldGroup label="العنوان الفرعي (Eyebrow)">
        <Input value={(data.eyebrow as string) ?? ''} onChange={(e) => onChange({ ...data, eyebrow: e.target.value })} className="h-9 text-sm" />
      </FieldGroup>
      <FieldGroup label="العنوان الرئيسي">
        <Input value={(data.heading as string) ?? ''} onChange={(e) => onChange({ ...data, heading: e.target.value })} className="h-9 text-sm" />
      </FieldGroup>

      <div className="space-y-2">
        <SectionLabel>الأسئلة</SectionLabel>
        {items.map((item, i) => (
          <RepeaterItem key={i} onDelete={() => onChange({ ...data, items: items.filter((_, j) => j !== i) })}>
            <div className="space-y-2 pr-5">
              <Input value={item.question} onChange={(e) => onChange({ ...data, items: items.map((x, j) => (j === i ? { ...x, question: e.target.value } : x)) })} placeholder="السؤال" className="h-8 text-sm font-medium" />
              <Textarea value={item.answer} onChange={(e) => onChange({ ...data, items: items.map((x, j) => (j === i ? { ...x, answer: e.target.value } : x)) })} placeholder="الجواب" className="min-h-16 resize-y text-sm" />
            </div>
          </RepeaterItem>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => onChange({ ...data, items: [...items, { question: '', answer: '' }] })}>
          <Plus className="size-3.5" /> إضافة سؤال
        </Button>
      </div>
    </div>
  )
}

// ARCHIVE FINAL CTA  (_renderer: "arCta")
function ArCtaEditor({ data, onChange }: CustomEditorProps) {
  const buttons = (data.buttons ?? []) as Array<{ id: string; label?: string; label_ar?: string; label_fr?: string; url: string; variant: string }>

  return (
    <div className="space-y-3">
      <FieldGroup label="العنوان الرئيسي">
        <Input value={(data.heading as string) ?? ''} onChange={(e) => onChange({ ...data, heading: e.target.value })} className="h-9 text-sm" />
      </FieldGroup>

      <div className="space-y-2">
        <SectionLabel>الأزرار</SectionLabel>
        {buttons.map((btn, i) => (
          <RepeaterItem key={i} onDelete={() => onChange({ ...data, buttons: buttons.filter((_, j) => j !== i) })}>
            <div className="flex gap-2 pr-5">
              <Input value={btn.label} onChange={(e) => onChange({ ...data, buttons: buttons.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)) })} placeholder="نص الزر" className="h-8 flex-1 text-sm" />
              <Input value={btn.url} onChange={(e) => onChange({ ...data, buttons: buttons.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)) })} placeholder="الرابط" className="h-8 flex-1 text-sm" />
            </div>
          </RepeaterItem>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => onChange({ ...data, buttons: [...buttons, { id: `btn-${Date.now()}`, label: '', url: '#', variant: 'primary' }] })}>
          <Plus className="size-3.5" /> إضافة زر
        </Button>
      </div>
    </div>
  )
}

// =====================================================================
// CONTACT CARDS  (_renderer: "contactCards")
// =====================================================================
function ContactCardsEditor({ data, onChange }: CustomEditorProps) {
  const items = (data.items ?? []) as Array<{ id: string; title_ar: string; title_fr: string; value_ar: string; value_fr: string; detail_ar: string; detail_fr: string }>

  return (
    <div className="space-y-3">
      <div className="border border-[#E5E7EB] rounded-lg p-3 space-y-2 bg-[#F8FAFC]">
        <span className="text-xs font-bold text-[#123B78]">العنوان الفرعي (Eyebrow)</span>
        <div className="grid grid-cols-2 gap-2">
          <FieldGroup label="العربية">
            <Input value={(data.eyebrow_ar as string) ?? ''} onChange={(e) => onChange({ ...data, eyebrow_ar: e.target.value })} placeholder="بالعربية" className="h-8 text-sm" />
          </FieldGroup>
          <FieldGroup label="Français">
            <Input value={(data.eyebrow_fr as string) ?? ''} onChange={(e) => onChange({ ...data, eyebrow_fr: e.target.value })} placeholder="en français" className="h-8 text-sm" />
          </FieldGroup>
        </div>
      </div>
      <div className="border border-[#E5E7EB] rounded-lg p-3 space-y-2 bg-[#F8FAFC]">
        <span className="text-xs font-bold text-[#123B78]">العنوان الرئيسي</span>
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
        <span className="text-xs font-bold text-[#123B78]">الوصف</span>
        <div className="grid grid-cols-2 gap-2">
          <FieldGroup label="العربية">
            <Input value={(data.description_ar as string) ?? ''} onChange={(e) => onChange({ ...data, description_ar: e.target.value })} placeholder="بالعربية" className="h-8 text-sm" />
          </FieldGroup>
          <FieldGroup label="Français">
            <Input value={(data.description_fr as string) ?? ''} onChange={(e) => onChange({ ...data, description_fr: e.target.value })} placeholder="en français" className="h-8 text-sm" />
          </FieldGroup>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">بطاقات معلومات التواصل الأربع. أيقونات البطاقات ثابتة في الصفحة ولا تتغير. نفس القيم تُستعمل تلقائيًا في قائمة معلومات بطاقة التواصل.</p>

      <div className="space-y-2">
        <SectionLabel>بطاقات التواصل</SectionLabel>
        {items.map((item, i) => (
          <RepeaterItem key={i} onDelete={() => onChange({ ...data, items: items.filter((_, j) => j !== i) })}>
            <div className="space-y-2 pr-5">
              <Input value={item.id} onChange={(e) => onChange({ ...data, items: items.map((x, j) => (j === i ? { ...x, id: e.target.value } : x)) })} placeholder="المعرف (address…)" className="h-8 w-28 text-sm" />
              <div className="border border-[#E5E7EB] rounded-lg p-3 space-y-2 bg-[#F8FAFC]">
                <span className="text-xs font-bold text-[#123B78]">العنوان</span>
                <div className="grid grid-cols-2 gap-2">
                  <FieldGroup label="العربية">
                    <Input value={item.title_ar ?? ''} onChange={(e) => onChange({ ...data, items: items.map((x, j) => (j === i ? { ...x, title_ar: e.target.value } : x)) })} placeholder="بالعربية" className="h-8 text-sm" />
                  </FieldGroup>
                  <FieldGroup label="Français">
                    <Input value={item.title_fr ?? ''} onChange={(e) => onChange({ ...data, items: items.map((x, j) => (j === i ? { ...x, title_fr: e.target.value } : x)) })} placeholder="en français" className="h-8 text-sm" />
                  </FieldGroup>
                </div>
              </div>
              <div className="border border-[#E5E7EB] rounded-lg p-3 space-y-2 bg-[#F8FAFC]">
                <span className="text-xs font-bold text-[#123B78]">القيمة</span>
                <div className="grid grid-cols-2 gap-2">
                  <FieldGroup label="العربية">
                    <Input value={item.value_ar ?? ''} onChange={(e) => onChange({ ...data, items: items.map((x, j) => (j === i ? { ...x, value_ar: e.target.value } : x)) })} placeholder="بالعربية" className="h-8 text-sm" />
                  </FieldGroup>
                  <FieldGroup label="Français">
                    <Input value={item.value_fr ?? ''} onChange={(e) => onChange({ ...data, items: items.map((x, j) => (j === i ? { ...x, value_fr: e.target.value } : x)) })} placeholder="en français" className="h-8 text-sm" />
                  </FieldGroup>
                </div>
              </div>
              <div className="border border-[#E5E7EB] rounded-lg p-3 space-y-2 bg-[#F8FAFC]">
                <span className="text-xs font-bold text-[#123B78]">التفصيل</span>
                <div className="grid grid-cols-2 gap-2">
                  <FieldGroup label="العربية">
                    <Input value={item.detail_ar ?? ''} onChange={(e) => onChange({ ...data, items: items.map((x, j) => (j === i ? { ...x, detail_ar: e.target.value } : x)) })} placeholder="بالعربية" className="h-8 text-sm" />
                  </FieldGroup>
                  <FieldGroup label="Français">
                    <Input value={item.detail_fr ?? ''} onChange={(e) => onChange({ ...data, items: items.map((x, j) => (j === i ? { ...x, detail_fr: e.target.value } : x)) })} placeholder="en français" className="h-8 text-sm" />
                  </FieldGroup>
                </div>
              </div>
            </div>
          </RepeaterItem>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => onChange({ ...data, items: [...items, { id: `item-${Date.now()}`, title_ar: '', title_fr: '', value_ar: '', value_fr: '', detail_ar: '', detail_fr: '' }] })}>
          <Plus className="size-3.5" /> إضافة بطاقة
        </Button>
      </div>
    </div>
  )
}

// CONTACT FORM + INFO CARD  (_renderer: "contactForm")
function ContactFormEditor({ data, onChange }: CustomEditorProps) {
  const social = (data.social ?? []) as Array<{ id: string; label_ar: string; label_fr: string; url: string }>
  const fields = (data.fields ?? []) as Array<{ id: string; label_ar: string; label_fr: string; placeholder_ar: string; placeholder_fr: string }>
  const subjectsAr = (data.subjects_ar ?? []) as string[]
  const subjectsFr = (data.subjects_fr ?? []) as string[]
  const maxSubjects = Math.max(subjectsAr.length, subjectsFr.length)

  return (
    <div className="space-y-3">
      <div className="border border-[#E5E7EB] rounded-lg p-3 space-y-2 bg-[#F8FAFC]">
        <span className="text-xs font-bold text-[#123B78]">العنوان الفرعي (Eyebrow)</span>
        <div className="grid grid-cols-2 gap-2">
          <FieldGroup label="العربية">
            <Input value={(data.eyebrow_ar as string) ?? ''} onChange={(e) => onChange({ ...data, eyebrow_ar: e.target.value })} placeholder="بالعربية" className="h-8 text-sm" />
          </FieldGroup>
          <FieldGroup label="Français">
            <Input value={(data.eyebrow_fr as string) ?? ''} onChange={(e) => onChange({ ...data, eyebrow_fr: e.target.value })} placeholder="en français" className="h-8 text-sm" />
          </FieldGroup>
        </div>
      </div>
      <div className="border border-[#E5E7EB] rounded-lg p-3 space-y-2 bg-[#F8FAFC]">
        <span className="text-xs font-bold text-[#123B78]">العنوان الرئيسي</span>
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
        <span className="text-xs font-bold text-[#123B78]">الوصف</span>
        <div className="grid grid-cols-2 gap-2">
          <FieldGroup label="العربية">
            <Input value={(data.description_ar as string) ?? ''} onChange={(e) => onChange({ ...data, description_ar: e.target.value })} placeholder="بالعربية" className="h-8 text-sm" />
          </FieldGroup>
          <FieldGroup label="Français">
            <Input value={(data.description_fr as string) ?? ''} onChange={(e) => onChange({ ...data, description_fr: e.target.value })} placeholder="en français" className="h-8 text-sm" />
          </FieldGroup>
        </div>
      </div>

      <SectionLabel>بطاقة معلومات التواصل</SectionLabel>
      <div className="border border-[#E5E7EB] rounded-lg p-3 space-y-2 bg-[#F8FAFC]">
        <span className="text-xs font-bold text-[#123B78]">عنوان البطاقة</span>
        <div className="grid grid-cols-2 gap-2">
          <FieldGroup label="العربية">
            <Input value={(data.infoTitle_ar as string) ?? ''} onChange={(e) => onChange({ ...data, infoTitle_ar: e.target.value })} placeholder="بالعربية" className="h-8 text-sm" />
          </FieldGroup>
          <FieldGroup label="Français">
            <Input value={(data.infoTitle_fr as string) ?? ''} onChange={(e) => onChange({ ...data, infoTitle_fr: e.target.value })} placeholder="en français" className="h-8 text-sm" />
          </FieldGroup>
        </div>
      </div>
      <div className="border border-[#E5E7EB] rounded-lg p-3 space-y-2 bg-[#F8FAFC]">
        <span className="text-xs font-bold text-[#123B78]">وصف البطاقة</span>
        <div className="grid grid-cols-2 gap-2">
          <FieldGroup label="العربية">
            <Textarea value={(data.infoDescription_ar as string) ?? ''} onChange={(e) => onChange({ ...data, infoDescription_ar: e.target.value })} placeholder="بالعربية" className="min-h-16 resize-y text-sm" />
          </FieldGroup>
          <FieldGroup label="Français">
            <Textarea value={(data.infoDescription_fr as string) ?? ''} onChange={(e) => onChange({ ...data, infoDescription_fr: e.target.value })} placeholder="en français" className="min-h-16 resize-y text-sm" />
          </FieldGroup>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">قائمة العنوان/الهاتف/البريد/ساعات العمل تُملأ تلقائيًا من قيم «بطاقات التواصل».</p>

      <div className="border border-[#E5E7EB] rounded-lg p-3 space-y-2 bg-[#F8FAFC]">
        <span className="text-xs font-bold text-[#123B78]">عنوان أزرار التواصل الاجتماعي</span>
        <div className="grid grid-cols-2 gap-2">
          <FieldGroup label="العربية">
            <Input value={(data.socialTitle_ar as string) ?? ''} onChange={(e) => onChange({ ...data, socialTitle_ar: e.target.value })} placeholder="بالعربية" className="h-8 text-sm" />
          </FieldGroup>
          <FieldGroup label="Français">
            <Input value={(data.socialTitle_fr as string) ?? ''} onChange={(e) => onChange({ ...data, socialTitle_fr: e.target.value })} placeholder="en français" className="h-8 text-sm" />
          </FieldGroup>
        </div>
      </div>
      <div className="space-y-2">
        <SectionLabel>روابط التواصل الاجتماعي</SectionLabel>
        {social.map((s, i) => (
          <RepeaterItem key={i} onDelete={() => onChange({ ...data, social: social.filter((_, j) => j !== i) })}>
            <div className="space-y-2 pr-5">
              <div className="flex gap-2">
                <Input value={s.id} onChange={(e) => onChange({ ...data, social: social.map((x, j) => (j === i ? { ...x, id: e.target.value } : x)) })} placeholder="المعرف (fb…)" className="h-8 w-24 text-sm" />
                <Input value={s.url} onChange={(e) => onChange({ ...data, social: social.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)) })} placeholder="الرابط" className="h-8 flex-1 text-sm" />
              </div>
              <div className="border border-[#E5E7EB] rounded-lg p-3 space-y-2 bg-[#F8FAFC]">
                <span className="text-xs font-bold text-[#123B78]">التسمية</span>
                <div className="grid grid-cols-2 gap-2">
                  <FieldGroup label="العربية">
                    <Input value={s.label_ar ?? ''} onChange={(e) => onChange({ ...data, social: social.map((x, j) => (j === i ? { ...x, label_ar: e.target.value } : x)) })} placeholder="بالعربية" className="h-8 text-sm" />
                  </FieldGroup>
                  <FieldGroup label="Français">
                    <Input value={s.label_fr ?? ''} onChange={(e) => onChange({ ...data, social: social.map((x, j) => (j === i ? { ...x, label_fr: e.target.value } : x)) })} placeholder="en français" className="h-8 text-sm" />
                  </FieldGroup>
                </div>
              </div>
            </div>
          </RepeaterItem>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => onChange({ ...data, social: [...social, { id: '', label_ar: '', label_fr: '', url: '#' }] })}>
          <Plus className="size-3.5" /> إضافة رابط
        </Button>
      </div>

      <SectionLabel>النموذج</SectionLabel>
      <div className="border border-[#E5E7EB] rounded-lg p-3 space-y-2 bg-[#F8FAFC]">
        <span className="text-xs font-bold text-[#123B78]">عنوان النموذج</span>
        <div className="grid grid-cols-2 gap-2">
          <FieldGroup label="العربية">
            <Input value={(data.formTitle_ar as string) ?? ''} onChange={(e) => onChange({ ...data, formTitle_ar: e.target.value })} placeholder="بالعربية" className="h-8 text-sm" />
          </FieldGroup>
          <FieldGroup label="Français">
            <Input value={(data.formTitle_fr as string) ?? ''} onChange={(e) => onChange({ ...data, formTitle_fr: e.target.value })} placeholder="en français" className="h-8 text-sm" />
          </FieldGroup>
        </div>
      </div>
      <div className="border border-[#E5E7EB] rounded-lg p-3 space-y-2 bg-[#F8FAFC]">
        <span className="text-xs font-bold text-[#123B78]">وصف النموذج</span>
        <div className="grid grid-cols-2 gap-2">
          <FieldGroup label="العربية">
            <Input value={(data.formDescription_ar as string) ?? ''} onChange={(e) => onChange({ ...data, formDescription_ar: e.target.value })} placeholder="بالعربية" className="h-8 text-sm" />
          </FieldGroup>
          <FieldGroup label="Français">
            <Input value={(data.formDescription_fr as string) ?? ''} onChange={(e) => onChange({ ...data, formDescription_fr: e.target.value })} placeholder="en français" className="h-8 text-sm" />
          </FieldGroup>
        </div>
      </div>

      <div className="space-y-2">
        <SectionLabel>الحقول (تسمية + نص إرشادي)</SectionLabel>
        {fields.map((f, i) => (
          <RepeaterItem key={i} onDelete={() => onChange({ ...data, fields: fields.filter((_, j) => j !== i) })}>
            <div className="space-y-2 pr-5">
              <Input value={f.id} onChange={(e) => onChange({ ...data, fields: fields.map((x, j) => (j === i ? { ...x, id: e.target.value } : x)) })} placeholder="المعرف (name…)" className="h-8 w-28 text-sm" />
              <div className="border border-[#E5E7EB] rounded-lg p-3 space-y-2 bg-[#F8FAFC]">
                <span className="text-xs font-bold text-[#123B78]">التسمية</span>
                <div className="grid grid-cols-2 gap-2">
                  <FieldGroup label="العربية">
                    <Input value={f.label_ar ?? ''} onChange={(e) => onChange({ ...data, fields: fields.map((x, j) => (j === i ? { ...x, label_ar: e.target.value } : x)) })} placeholder="بالعربية" className="h-8 text-sm" />
                  </FieldGroup>
                  <FieldGroup label="Français">
                    <Input value={f.label_fr ?? ''} onChange={(e) => onChange({ ...data, fields: fields.map((x, j) => (j === i ? { ...x, label_fr: e.target.value } : x)) })} placeholder="en français" className="h-8 text-sm" />
                  </FieldGroup>
                </div>
              </div>
              <div className="border border-[#E5E7EB] rounded-lg p-3 space-y-2 bg-[#F8FAFC]">
                <span className="text-xs font-bold text-[#123B78]">النص الإرشادي</span>
                <div className="grid grid-cols-2 gap-2">
                  <FieldGroup label="العربية">
                    <Input value={f.placeholder_ar ?? ''} onChange={(e) => onChange({ ...data, fields: fields.map((x, j) => (j === i ? { ...x, placeholder_ar: e.target.value } : x)) })} placeholder="بالعربية" className="h-8 text-sm" />
                  </FieldGroup>
                  <FieldGroup label="Français">
                    <Input value={f.placeholder_fr ?? ''} onChange={(e) => onChange({ ...data, fields: fields.map((x, j) => (j === i ? { ...x, placeholder_fr: e.target.value } : x)) })} placeholder="en français" className="h-8 text-sm" />
                  </FieldGroup>
                </div>
              </div>
            </div>
          </RepeaterItem>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => onChange({ ...data, fields: [...fields, { id: '', label_ar: '', label_fr: '', placeholder_ar: '', placeholder_fr: '' }] })}>
          <Plus className="size-3.5" /> إضافة حقل
        </Button>
      </div>

      <div className="space-y-2">
        <SectionLabel>خيارات الموضوع</SectionLabel>
        {Array.from({ length: maxSubjects }).map((_, i) => (
          <RepeaterItem key={i} onDelete={() => {
            const ar = [...subjectsAr]; ar.splice(i, 1)
            const fr = [...subjectsFr]; fr.splice(i, 1)
            onChange({ ...data, subjects_ar: ar, subjects_fr: fr })
          }}>
            <div className="space-y-1.5 pr-5">
              <div className="grid grid-cols-2 gap-2">
                <FieldGroup label="العربية">
                  <Input value={subjectsAr[i] ?? ''} onChange={(e) => {
                    const ar = [...subjectsAr]; ar[i] = e.target.value
                    onChange({ ...data, subjects_ar: ar })
                  }} placeholder="بالعربية" className="h-8 text-sm" />
                </FieldGroup>
                <FieldGroup label="Français">
                  <Input value={subjectsFr[i] ?? ''} onChange={(e) => {
                    const fr = [...subjectsFr]; fr[i] = e.target.value
                    onChange({ ...data, subjects_fr: fr })
                  }} placeholder="en français" className="h-8 text-sm" />
                </FieldGroup>
              </div>
            </div>
          </RepeaterItem>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => onChange({ ...data, subjects_ar: [...subjectsAr, ''], subjects_fr: [...subjectsFr, ''] })}>
          <Plus className="size-3.5" /> إضافة خيار
        </Button>
      </div>

      <div className="border border-[#E5E7EB] rounded-lg p-3 space-y-2 bg-[#F8FAFC]">
        <span className="text-xs font-bold text-[#123B78]">نص زر الإرسال</span>
        <div className="grid grid-cols-2 gap-2">
          <FieldGroup label="العربية">
            <Input value={(data.submitLabel_ar as string) ?? ''} onChange={(e) => onChange({ ...data, submitLabel_ar: e.target.value })} placeholder="بالعربية" className="h-8 text-sm" />
          </FieldGroup>
          <FieldGroup label="Français">
            <Input value={(data.submitLabel_fr as string) ?? ''} onChange={(e) => onChange({ ...data, submitLabel_fr: e.target.value })} placeholder="en français" className="h-8 text-sm" />
          </FieldGroup>
        </div>
      </div>
    </div>
  )
}

// CONTACT MAP  (_renderer: "contactMap")
function ContactMapEditor({ data, onChange }: CustomEditorProps) {
  return (
    <div className="space-y-3">
      <div className="border border-[#E5E7EB] rounded-lg p-3 space-y-2 bg-[#F8FAFC]">
        <span className="text-xs font-bold text-[#123B78]">العنوان الفرعي (Eyebrow)</span>
        <div className="grid grid-cols-2 gap-2">
          <FieldGroup label="العربية">
            <Input value={(data.eyebrow_ar as string) ?? ''} onChange={(e) => onChange({ ...data, eyebrow_ar: e.target.value })} placeholder="بالعربية" className="h-8 text-sm" />
          </FieldGroup>
          <FieldGroup label="Français">
            <Input value={(data.eyebrow_fr as string) ?? ''} onChange={(e) => onChange({ ...data, eyebrow_fr: e.target.value })} placeholder="en français" className="h-8 text-sm" />
          </FieldGroup>
        </div>
      </div>
      <div className="border border-[#E5E7EB] rounded-lg p-3 space-y-2 bg-[#F8FAFC]">
        <span className="text-xs font-bold text-[#123B78]">العنوان الرئيسي</span>
        <div className="grid grid-cols-2 gap-2">
          <FieldGroup label="العربية">
            <Input value={(data.heading_ar as string) ?? ''} onChange={(e) => onChange({ ...data, heading_ar: e.target.value })} placeholder="بالعربية" className="h-8 text-sm" />
          </FieldGroup>
          <FieldGroup label="Français">
            <Input value={(data.heading_fr as string) ?? ''} onChange={(e) => onChange({ ...data, heading_fr: e.target.value })} placeholder="en français" className="h-8 text-sm" />
          </FieldGroup>
        </div>
      </div>
      <FieldGroup label="رابط خريطة جوجل (iframe src)">
        <Input value={(data.mapUrl as string) ?? ''} onChange={(e) => onChange({ ...data, mapUrl: e.target.value })} placeholder="https://www.google.com/maps?q=…" className="h-9 text-sm" />
      </FieldGroup>
    </div>
  )
}

// CONTACT FAQ  (_renderer: "contactFaq")
function ContactFaqEditor({ data, onChange }: CustomEditorProps) {
  const items = (data.items ?? []) as Array<{ question_ar: string; question_fr: string; answer_ar: string; answer_fr: string }>

  return (
    <div className="space-y-3">
      <div className="border border-[#E5E7EB] rounded-lg p-3 space-y-2 bg-[#F8FAFC]">
        <span className="text-xs font-bold text-[#123B78]">العنوان الفرعي (Eyebrow)</span>
        <div className="grid grid-cols-2 gap-2">
          <FieldGroup label="العربية">
            <Input value={(data.eyebrow_ar as string) ?? ''} onChange={(e) => onChange({ ...data, eyebrow_ar: e.target.value })} placeholder="بالعربية" className="h-8 text-sm" />
          </FieldGroup>
          <FieldGroup label="Français">
            <Input value={(data.eyebrow_fr as string) ?? ''} onChange={(e) => onChange({ ...data, eyebrow_fr: e.target.value })} placeholder="en français" className="h-8 text-sm" />
          </FieldGroup>
        </div>
      </div>
      <div className="border border-[#E5E7EB] rounded-lg p-3 space-y-2 bg-[#F8FAFC]">
        <span className="text-xs font-bold text-[#123B78]">العنوان الرئيسي</span>
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
        <span className="text-xs font-bold text-[#123B78]">الوصف</span>
        <div className="grid grid-cols-2 gap-2">
          <FieldGroup label="العربية">
            <Input value={(data.description_ar as string) ?? ''} onChange={(e) => onChange({ ...data, description_ar: e.target.value })} placeholder="بالعربية" className="h-8 text-sm" />
          </FieldGroup>
          <FieldGroup label="Français">
            <Input value={(data.description_fr as string) ?? ''} onChange={(e) => onChange({ ...data, description_fr: e.target.value })} placeholder="en français" className="h-8 text-sm" />
          </FieldGroup>
        </div>
      </div>

      <div className="space-y-2">
        <SectionLabel>الأسئلة</SectionLabel>
        {items.map((item, i) => (
          <RepeaterItem key={i} onDelete={() => onChange({ ...data, items: items.filter((_, j) => j !== i) })}>
            <div className="space-y-2 pr-5">
              <div className="border border-[#E5E7EB] rounded-lg p-3 space-y-2 bg-[#F8FAFC]">
                <span className="text-xs font-bold text-[#123B78]">السؤال</span>
                <div className="grid grid-cols-2 gap-2">
                  <FieldGroup label="العربية">
                    <Input value={item.question_ar ?? ''} onChange={(e) => onChange({ ...data, items: items.map((x, j) => (j === i ? { ...x, question_ar: e.target.value } : x)) })} placeholder="بالعربية" className="h-8 text-sm font-medium" />
                  </FieldGroup>
                  <FieldGroup label="Français">
                    <Input value={item.question_fr ?? ''} onChange={(e) => onChange({ ...data, items: items.map((x, j) => (j === i ? { ...x, question_fr: e.target.value } : x)) })} placeholder="en français" className="h-8 text-sm" />
                  </FieldGroup>
                </div>
              </div>
              <div className="border border-[#E5E7EB] rounded-lg p-3 space-y-2 bg-[#F8FAFC]">
                <span className="text-xs font-bold text-[#123B78]">الجواب</span>
                <div className="grid grid-cols-2 gap-2">
                  <FieldGroup label="العربية">
                    <Textarea value={item.answer_ar ?? ''} onChange={(e) => onChange({ ...data, items: items.map((x, j) => (j === i ? { ...x, answer_ar: e.target.value } : x)) })} placeholder="بالعربية" className="min-h-16 resize-y text-sm" />
                  </FieldGroup>
                  <FieldGroup label="Français">
                    <Textarea value={item.answer_fr ?? ''} onChange={(e) => onChange({ ...data, items: items.map((x, j) => (j === i ? { ...x, answer_fr: e.target.value } : x)) })} placeholder="en français" className="min-h-16 resize-y text-sm" />
                  </FieldGroup>
                </div>
              </div>
            </div>
          </RepeaterItem>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => onChange({ ...data, items: [...items, { question_ar: '', question_fr: '', answer_ar: '', answer_fr: '' }] })}>
          <Plus className="size-3.5" /> إضافة سؤال
        </Button>
      </div>
    </div>
  )
}

// CONTACT FINAL CTA  (_renderer: "contactCta")
function ContactCtaEditor({ data, onChange }: CustomEditorProps) {
  const button = (data.button ?? { label_ar: '', label_fr: '', url: '#' }) as { label_ar: string; label_fr: string; url: string }

  return (
    <div className="space-y-3">
      <div className="border border-[#E5E7EB] rounded-lg p-3 space-y-2 bg-[#F8FAFC]">
        <span className="text-xs font-bold text-[#123B78]">العنوان الرئيسي</span>
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
        <span className="text-xs font-bold text-[#123B78]">الوصف</span>
        <div className="grid grid-cols-2 gap-2">
          <FieldGroup label="العربية">
            <Input value={(data.description_ar as string) ?? ''} onChange={(e) => onChange({ ...data, description_ar: e.target.value })} placeholder="بالعربية" className="h-8 text-sm" />
          </FieldGroup>
          <FieldGroup label="Français">
            <Input value={(data.description_fr as string) ?? ''} onChange={(e) => onChange({ ...data, description_fr: e.target.value })} placeholder="en français" className="h-8 text-sm" />
          </FieldGroup>
        </div>
      </div>
      <SectionLabel>الزر</SectionLabel>
      <div className="border border-[#E5E7EB] rounded-lg p-3 space-y-2 bg-[#F8FAFC]">
        <span className="text-xs font-bold text-[#123B78]">نص الزر</span>
        <div className="grid grid-cols-2 gap-2">
          <FieldGroup label="العربية">
            <Input value={button.label_ar ?? ''} onChange={(e) => onChange({ ...data, button: { ...button, label_ar: e.target.value } })} placeholder="بالعربية" className="h-8 text-sm" />
          </FieldGroup>
          <FieldGroup label="Français">
            <Input value={button.label_fr ?? ''} onChange={(e) => onChange({ ...data, button: { ...button, label_fr: e.target.value } })} placeholder="en français" className="h-8 text-sm" />
          </FieldGroup>
        </div>
      </div>
      <FieldGroup label="الرابط">
        <Input value={button.url} onChange={(e) => onChange({ ...data, button: { ...button, url: e.target.value } })} placeholder="الرابط" className="h-9 text-sm" />
      </FieldGroup>
    </div>
  )
}

// =====================================================================
// PARTNER ABOUT EDITOR  (_renderer: "partnerAbout")
// =====================================================================

function PartnerAboutEditor({ data, onChange }: CustomEditorProps) {
  const paragraphsAr = (data.paragraphs_ar ?? []) as string[]
  const paragraphsFr = (data.paragraphs_fr ?? []) as string[]
  const maxLen = Math.max(paragraphsAr.length, paragraphsFr.length)

  return (
    <div className="space-y-3">
      <div className="border border-[#E5E7EB] rounded-lg p-3 space-y-2 bg-[#F8FAFC]">
        <span className="text-xs font-bold text-[#123B78]">Eyebrow</span>
        <div className="grid grid-cols-2 gap-2">
          <FieldGroup label="العربية">
            <Input value={(data.eyebrow_ar as string) ?? ''} onChange={(e) => onChange({ ...data, eyebrow_ar: e.target.value })} placeholder="بالعربية" className="h-8 text-sm" />
          </FieldGroup>
          <FieldGroup label="Français">
            <Input value={(data.eyebrow_fr as string) ?? ''} onChange={(e) => onChange({ ...data, eyebrow_fr: e.target.value })} placeholder="en français" className="h-8 text-sm" />
          </FieldGroup>
        </div>
      </div>
      <div className="border border-[#E5E7EB] rounded-lg p-3 space-y-2 bg-[#F8FAFC]">
        <span className="text-xs font-bold text-[#123B78]">العنوان</span>
        <div className="grid grid-cols-2 gap-2">
          <FieldGroup label="العربية">
            <Input value={(data.heading_ar as string) ?? ''} onChange={(e) => onChange({ ...data, heading_ar: e.target.value })} placeholder="بالعربية" className="h-8 text-sm" />
          </FieldGroup>
          <FieldGroup label="Français">
            <Input value={(data.heading_fr as string) ?? ''} onChange={(e) => onChange({ ...data, heading_fr: e.target.value })} placeholder="en français" className="h-8 text-sm" />
          </FieldGroup>
        </div>
      </div>
      <div className="space-y-2">
        <SectionLabel>الفقرات</SectionLabel>
        {Array.from({ length: maxLen }).map((_, i) => (
          <RepeaterItem key={i} onDelete={() => {
            const ar = [...paragraphsAr]; ar.splice(i, 1)
            const fr = [...paragraphsFr]; fr.splice(i, 1)
            onChange({ ...data, paragraphs_ar: ar, paragraphs_fr: fr })
          }}>
            <div className="space-y-1.5 pr-5">
              <FieldGroup label="العربية">
                <Textarea value={paragraphsAr[i] ?? ''} onChange={(e) => {
                  const ar = [...paragraphsAr]; ar[i] = e.target.value
                  onChange({ ...data, paragraphs_ar: ar })
                }} placeholder="بالعربية" className="min-h-12 resize-y text-sm" />
              </FieldGroup>
              <FieldGroup label="Français">
                <Textarea value={paragraphsFr[i] ?? ''} onChange={(e) => {
                  const fr = [...paragraphsFr]; fr[i] = e.target.value
                  onChange({ ...data, paragraphs_fr: fr })
                }} placeholder="en français" className="min-h-12 resize-y text-sm" />
              </FieldGroup>
            </div>
          </RepeaterItem>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => onChange({ ...data, paragraphs_ar: [...paragraphsAr, ''], paragraphs_fr: [...paragraphsFr, ''] })}>
          <Plus className="size-3.5" /> إضافة فقرة
        </Button>
      </div>
      <FieldGroup label="الصورة">
        <Input value={(data.image as string) ?? ''} onChange={(e) => onChange({ ...data, image: e.target.value })} placeholder="رابط الصورة" className="h-9 text-sm" />
      </FieldGroup>
    </div>
  )
}

// =====================================================================
// PARTNER SERVICES EDITOR  (_renderer: "partnerServices")
// =====================================================================

function PartnerServicesEditor({ data, onChange }: CustomEditorProps) {
  const cards = (data.cards ?? []) as Array<{ title_ar: string; title_fr: string; description_ar: string; description_fr: string }>

  return (
    <div className="space-y-3">
      <div className="border border-[#E5E7EB] rounded-lg p-3 space-y-2 bg-[#F8FAFC]">
        <span className="text-xs font-bold text-[#123B78]">Eyebrow</span>
        <div className="grid grid-cols-2 gap-2">
          <FieldGroup label="العربية">
            <Input value={(data.eyebrow_ar as string) ?? ''} onChange={(e) => onChange({ ...data, eyebrow_ar: e.target.value })} placeholder="بالعربية" className="h-8 text-sm" />
          </FieldGroup>
          <FieldGroup label="Français">
            <Input value={(data.eyebrow_fr as string) ?? ''} onChange={(e) => onChange({ ...data, eyebrow_fr: e.target.value })} placeholder="en français" className="h-8 text-sm" />
          </FieldGroup>
        </div>
      </div>
      <div className="border border-[#E5E7EB] rounded-lg p-3 space-y-2 bg-[#F8FAFC]">
        <span className="text-xs font-bold text-[#123B78]">العنوان</span>
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
        <span className="text-xs font-bold text-[#123B78]">الوصف</span>
        <div className="grid grid-cols-2 gap-2">
          <FieldGroup label="العربية">
            <Textarea value={(data.description_ar as string) ?? ''} onChange={(e) => onChange({ ...data, description_ar: e.target.value })} placeholder="بالعربية" className="min-h-16 resize-y text-sm" />
          </FieldGroup>
          <FieldGroup label="Français">
            <Textarea value={(data.description_fr as string) ?? ''} onChange={(e) => onChange({ ...data, description_fr: e.target.value })} placeholder="en français" className="min-h-16 resize-y text-sm" />
          </FieldGroup>
        </div>
      </div>
      <div className="space-y-2">
        <SectionLabel>البطاقات</SectionLabel>
        {cards.map((card, i) => (
          <RepeaterItem key={i} onDelete={() => onChange({ ...data, cards: cards.filter((_, j) => j !== i) })}>
            <div className="space-y-1.5 pr-5">
              <div className="border border-[#E5E7EB] rounded-lg p-2 space-y-1 bg-[#F8FAFC]">
                <span className="text-xs font-bold text-[#64748B]">العنوان</span>
                <div className="grid grid-cols-2 gap-2">
                  <Input value={card.title_ar ?? ''} onChange={(e) => onChange({ ...data, cards: cards.map((x, j) => (j === i ? { ...x, title_ar: e.target.value } : x)) })} placeholder="بالعربية" className="h-8 text-sm" />
                  <Input value={card.title_fr ?? ''} onChange={(e) => onChange({ ...data, cards: cards.map((x, j) => (j === i ? { ...x, title_fr: e.target.value } : x)) })} placeholder="en français" className="h-8 text-sm" />
                </div>
              </div>
              <div className="border border-[#E5E7EB] rounded-lg p-2 space-y-1 bg-[#F8FAFC]">
                <span className="text-xs font-bold text-[#64748B]">الوصف</span>
                <div className="grid grid-cols-2 gap-2">
                  <Textarea value={card.description_ar ?? ''} onChange={(e) => onChange({ ...data, cards: cards.map((x, j) => (j === i ? { ...x, description_ar: e.target.value } : x)) })} placeholder="بالعربية" className="min-h-12 resize-y text-sm" />
                  <Textarea value={card.description_fr ?? ''} onChange={(e) => onChange({ ...data, cards: cards.map((x, j) => (j === i ? { ...x, description_fr: e.target.value } : x)) })} placeholder="en français" className="min-h-12 resize-y text-sm" />
                </div>
              </div>
            </div>
          </RepeaterItem>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => onChange({ ...data, cards: [...cards, { title_ar: '', title_fr: '', description_ar: '', description_fr: '' }] })}>
          <Plus className="size-3.5" /> إضافة بطاقة
        </Button>
      </div>
    </div>
  )
}

// =====================================================================
// PARTNER WHY EDITOR  (_renderer: "partnerWhy")
// =====================================================================

function PartnerWhyEditor({ data, onChange }: CustomEditorProps) {
  const cards = (data.cards ?? []) as Array<{ title_ar: string; title_fr: string; description_ar: string; description_fr: string }>

  return (
    <div className="space-y-3">
      <div className="border border-[#E5E7EB] rounded-lg p-3 space-y-2 bg-[#F8FAFC]">
        <span className="text-xs font-bold text-[#123B78]">Eyebrow</span>
        <div className="grid grid-cols-2 gap-2">
          <FieldGroup label="العربية">
            <Input value={(data.eyebrow_ar as string) ?? ''} onChange={(e) => onChange({ ...data, eyebrow_ar: e.target.value })} placeholder="بالعربية" className="h-8 text-sm" />
          </FieldGroup>
          <FieldGroup label="Français">
            <Input value={(data.eyebrow_fr as string) ?? ''} onChange={(e) => onChange({ ...data, eyebrow_fr: e.target.value })} placeholder="en français" className="h-8 text-sm" />
          </FieldGroup>
        </div>
      </div>
      <div className="border border-[#E5E7EB] rounded-lg p-3 space-y-2 bg-[#F8FAFC]">
        <span className="text-xs font-bold text-[#123B78]">العنوان</span>
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
        <span className="text-xs font-bold text-[#123B78]">الوصف</span>
        <div className="grid grid-cols-2 gap-2">
          <FieldGroup label="العربية">
            <Textarea value={(data.description_ar as string) ?? ''} onChange={(e) => onChange({ ...data, description_ar: e.target.value })} placeholder="بالعربية" className="min-h-16 resize-y text-sm" />
          </FieldGroup>
          <FieldGroup label="Français">
            <Textarea value={(data.description_fr as string) ?? ''} onChange={(e) => onChange({ ...data, description_fr: e.target.value })} placeholder="en français" className="min-h-16 resize-y text-sm" />
          </FieldGroup>
        </div>
      </div>
      <div className="space-y-2">
        <SectionLabel>بطاقات المميزات</SectionLabel>
        {cards.map((card, i) => (
          <RepeaterItem key={i} onDelete={() => onChange({ ...data, cards: cards.filter((_, j) => j !== i) })}>
            <div className="space-y-1.5 pr-5">
              <div className="border border-[#E5E7EB] rounded-lg p-2 space-y-1 bg-[#F8FAFC]">
                <span className="text-xs font-bold text-[#64748B]">العنوان</span>
                <div className="grid grid-cols-2 gap-2">
                  <Input value={card.title_ar ?? ''} onChange={(e) => onChange({ ...data, cards: cards.map((x, j) => (j === i ? { ...x, title_ar: e.target.value } : x)) })} placeholder="بالعربية" className="h-8 text-sm" />
                  <Input value={card.title_fr ?? ''} onChange={(e) => onChange({ ...data, cards: cards.map((x, j) => (j === i ? { ...x, title_fr: e.target.value } : x)) })} placeholder="en français" className="h-8 text-sm" />
                </div>
              </div>
              <div className="border border-[#E5E7EB] rounded-lg p-2 space-y-1 bg-[#F8FAFC]">
                <span className="text-xs font-bold text-[#64748B]">الوصف</span>
                <div className="grid grid-cols-2 gap-2">
                  <Textarea value={card.description_ar ?? ''} onChange={(e) => onChange({ ...data, cards: cards.map((x, j) => (j === i ? { ...x, description_ar: e.target.value } : x)) })} placeholder="بالعربية" className="min-h-12 resize-y text-sm" />
                  <Textarea value={card.description_fr ?? ''} onChange={(e) => onChange({ ...data, cards: cards.map((x, j) => (j === i ? { ...x, description_fr: e.target.value } : x)) })} placeholder="en français" className="min-h-12 resize-y text-sm" />
                </div>
              </div>
            </div>
          </RepeaterItem>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => onChange({ ...data, cards: [...cards, { title_ar: '', title_fr: '', description_ar: '', description_fr: '' }] })}>
          <Plus className="size-3.5" /> إضافة بطاقة
        </Button>
      </div>
    </div>
  )
}

// =====================================================================
// PARTNER GALLERY EDITOR  (_renderer: "partnerGallery")
// =====================================================================

function PartnerGalleryEditor({ data, onChange }: CustomEditorProps) {
  const images = (data.images ?? []) as Array<{ id: string; url: string; alt: string }>

  return (
    <div className="space-y-3">
      <div className="border border-[#E5E7EB] rounded-lg p-3 space-y-2 bg-[#F8FAFC]">
        <span className="text-xs font-bold text-[#123B78]">Eyebrow</span>
        <div className="grid grid-cols-2 gap-2">
          <FieldGroup label="العربية">
            <Input value={(data.eyebrow_ar as string) ?? ''} onChange={(e) => onChange({ ...data, eyebrow_ar: e.target.value })} placeholder="بالعربية" className="h-8 text-sm" />
          </FieldGroup>
          <FieldGroup label="Français">
            <Input value={(data.eyebrow_fr as string) ?? ''} onChange={(e) => onChange({ ...data, eyebrow_fr: e.target.value })} placeholder="en français" className="h-8 text-sm" />
          </FieldGroup>
        </div>
      </div>
      <div className="border border-[#E5E7EB] rounded-lg p-3 space-y-2 bg-[#F8FAFC]">
        <span className="text-xs font-bold text-[#123B78]">العنوان</span>
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
        <span className="text-xs font-bold text-[#123B78]">الوصف</span>
        <div className="grid grid-cols-2 gap-2">
          <FieldGroup label="العربية">
            <Textarea value={(data.description_ar as string) ?? ''} onChange={(e) => onChange({ ...data, description_ar: e.target.value })} placeholder="بالعربية" className="min-h-16 resize-y text-sm" />
          </FieldGroup>
          <FieldGroup label="Français">
            <Textarea value={(data.description_fr as string) ?? ''} onChange={(e) => onChange({ ...data, description_fr: e.target.value })} placeholder="en français" className="min-h-16 resize-y text-sm" />
          </FieldGroup>
        </div>
      </div>
      <div className="space-y-2">
        <SectionLabel>الصور</SectionLabel>
        {images.map((img, i) => (
          <div key={img.id || i} className="space-y-1.5">
            <Input value={img.url} onChange={(e) => onChange({ ...data, images: images.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)) })} placeholder={`رابط الصورة ${i + 1}`} className="h-9 text-sm" />
          </div>
        ))}
      </div>
    </div>
  )
}

// =====================================================================
// PARTNER CONTACT EDITOR  (_renderer: "partnerContact")
// =====================================================================

function PartnerContactEditor({ data, onChange }: CustomEditorProps) {
  return (
    <div className="space-y-3">
      <div className="border border-[#E5E7EB] rounded-lg p-3 space-y-2 bg-[#F8FAFC]">
        <span className="text-xs font-bold text-[#123B78]">العنوان</span>
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
        <span className="text-xs font-bold text-[#123B78]">الوصف</span>
        <div className="grid grid-cols-2 gap-2">
          <FieldGroup label="العربية">
            <Textarea value={(data.description_ar as string) ?? ''} onChange={(e) => onChange({ ...data, description_ar: e.target.value })} placeholder="بالعربية" className="min-h-16 resize-y text-sm" />
          </FieldGroup>
          <FieldGroup label="Français">
            <Textarea value={(data.description_fr as string) ?? ''} onChange={(e) => onChange({ ...data, description_fr: e.target.value })} placeholder="en français" className="min-h-16 resize-y text-sm" />
          </FieldGroup>
        </div>
      </div>
      <SectionLabel>معلومات التواصل</SectionLabel>
      <Input value={(data.email as string) ?? ''} onChange={(e) => onChange({ ...data, email: e.target.value })} placeholder="البريد الإلكتروني" className="h-9 text-sm" />
      <Input value={(data.phone as string) ?? ''} onChange={(e) => onChange({ ...data, phone: e.target.value })} placeholder="الهاتف" className="h-9 text-sm" />
      <Input value={(data.website as string) ?? ''} onChange={(e) => onChange({ ...data, website: e.target.value })} placeholder="الموقع الإلكتروني" className="h-9 text-sm" />
      <Input value={(data.address as string) ?? ''} onChange={(e) => onChange({ ...data, address: e.target.value })} placeholder="العنوان" className="h-9 text-sm" />
    </div>
  )
}

// =====================================================================
// PARTNER FORM EDITOR  (_renderer: "partnerForm")
// =====================================================================

function PartnerFormEditor({ data, onChange }: CustomEditorProps) {
  return (
    <div className="space-y-3">
      <div className="border border-[#E5E7EB] rounded-lg p-3 space-y-2 bg-[#F8FAFC]">
        <span className="text-xs font-bold text-[#123B78]">العنوان</span>
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
        <span className="text-xs font-bold text-[#123B78]">الوصف</span>
        <div className="grid grid-cols-2 gap-2">
          <FieldGroup label="العربية">
            <Textarea value={(data.description_ar as string) ?? ''} onChange={(e) => onChange({ ...data, description_ar: e.target.value })} placeholder="بالعربية" className="min-h-16 resize-y text-sm" />
          </FieldGroup>
          <FieldGroup label="Français">
            <Textarea value={(data.description_fr as string) ?? ''} onChange={(e) => onChange({ ...data, description_fr: e.target.value })} placeholder="en français" className="min-h-16 resize-y text-sm" />
          </FieldGroup>
        </div>
      </div>
    </div>
  )
}

// =====================================================================
// PARTNER CTA EDITOR  (_renderer: "partnerCta")
// =====================================================================

function PartnerCtaEditor({ data, onChange }: CustomEditorProps) {
  const buttons = (data.buttons ?? []) as Array<{ id: string; label_ar: string; label_fr: string; url: string; variant: string }>

  return (
    <div className="space-y-3">
      <div className="border border-[#E5E7EB] rounded-lg p-3 space-y-2 bg-[#F8FAFC]">
        <span className="text-xs font-bold text-[#123B78]">العنوان</span>
        <div className="grid grid-cols-2 gap-2">
          <FieldGroup label="العربية">
            <Input value={(data.heading_ar as string) ?? ''} onChange={(e) => onChange({ ...data, heading_ar: e.target.value })} placeholder="بالعربية" className="h-8 text-sm" />
          </FieldGroup>
          <FieldGroup label="Français">
            <Input value={(data.heading_fr as string) ?? ''} onChange={(e) => onChange({ ...data, heading_fr: e.target.value })} placeholder="en français" className="h-8 text-sm" />
          </FieldGroup>
        </div>
      </div>
      <div className="space-y-2">
        <SectionLabel>الأزرار</SectionLabel>
        {buttons.map((btn, i) => (
          <RepeaterItem key={btn.id || i} onDelete={() => onChange({ ...data, buttons: buttons.filter((_, j) => j !== i) })}>
            <div className="space-y-1.5 pr-5">
              <div className="border border-[#E5E7EB] rounded-lg p-2 space-y-1 bg-[#F8FAFC]">
                <span className="text-xs font-bold text-[#64748B]">نص الزر</span>
                <div className="grid grid-cols-2 gap-2">
                  <Input value={btn.label_ar ?? ''} onChange={(e) => onChange({ ...data, buttons: buttons.map((x, j) => (j === i ? { ...x, label_ar: e.target.value } : x)) })} placeholder="بالعربية" className="h-8 text-sm" />
                  <Input value={btn.label_fr ?? ''} onChange={(e) => onChange({ ...data, buttons: buttons.map((x, j) => (j === i ? { ...x, label_fr: e.target.value } : x)) })} placeholder="en français" className="h-8 text-sm" />
                </div>
              </div>
              <Input value={btn.url} onChange={(e) => onChange({ ...data, buttons: buttons.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)) })} placeholder="الرابط" className="h-8 text-sm" />
              <select value={btn.variant} onChange={(e) => onChange({ ...data, buttons: buttons.map((x, j) => (j === i ? { ...x, variant: e.target.value } : x)) })} className="h-8 w-full rounded-lg border border-[#E5E7EB] bg-transparent px-2.5 text-xs">
                <option value="primary">Primary</option>
                <option value="secondary">Secondary</option>
                <option value="outline">Outline</option>
              </select>
            </div>
          </RepeaterItem>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => onChange({ ...data, buttons: [...buttons, { id: 'btn-' + Date.now(), label_ar: '', label_fr: '', url: '#', variant: 'primary' }] })}>
          <Plus className="size-3.5" /> إضافة زر
        </Button>
      </div>
    </div>
  )
}

// =====================================================================
// SOS AMARE EDITORS
// =====================================================================

function SosHowEditor({ data, onChange }: CustomEditorProps) {
  const steps = (data.steps ?? []) as Array<{ title_ar: string; title_fr: string; description_ar: string; description_fr: string }>
  return (
    <div className="space-y-3">
      <div className="border border-[#E5E7EB] rounded-lg p-3 space-y-2 bg-[#F8FAFC]">
        <span className="text-xs font-bold text-[#123B78]">Eyebrow</span>
        <div className="grid grid-cols-2 gap-2">
          <FieldGroup label="العربية"><Input value={(data.eyebrow_ar as string) ?? ''} onChange={(e) => onChange({ ...data, eyebrow_ar: e.target.value })} placeholder="بالعربية" className="h-8 text-sm" /></FieldGroup>
          <FieldGroup label="Français"><Input value={(data.eyebrow_fr as string) ?? ''} onChange={(e) => onChange({ ...data, eyebrow_fr: e.target.value })} placeholder="en français" className="h-8 text-sm" /></FieldGroup>
        </div>
      </div>
      <div className="border border-[#E5E7EB] rounded-lg p-3 space-y-2 bg-[#F8FAFC]">
        <span className="text-xs font-bold text-[#123B78]">العنوان</span>
        <div className="grid grid-cols-2 gap-2">
          <FieldGroup label="العربية"><Input value={(data.heading_ar as string) ?? ''} onChange={(e) => onChange({ ...data, heading_ar: e.target.value })} placeholder="بالعربية" className="h-8 text-sm" /></FieldGroup>
          <FieldGroup label="Français"><Input value={(data.heading_fr as string) ?? ''} onChange={(e) => onChange({ ...data, heading_fr: e.target.value })} placeholder="en français" className="h-8 text-sm" /></FieldGroup>
        </div>
      </div>
      <div className="border border-[#E5E7EB] rounded-lg p-3 space-y-2 bg-[#F8FAFC]">
        <span className="text-xs font-bold text-[#123B78]">الوصف</span>
        <div className="grid grid-cols-2 gap-2">
          <FieldGroup label="العربية"><Textarea value={(data.description_ar as string) ?? ''} onChange={(e) => onChange({ ...data, description_ar: e.target.value })} placeholder="بالعربية" className="min-h-16 resize-y text-sm" /></FieldGroup>
          <FieldGroup label="Français"><Textarea value={(data.description_fr as string) ?? ''} onChange={(e) => onChange({ ...data, description_fr: e.target.value })} placeholder="en français" className="min-h-16 resize-y text-sm" /></FieldGroup>
        </div>
      </div>
      <div className="space-y-2">
        <SectionLabel>الخطوات</SectionLabel>
        {steps.map((step, i) => (
          <RepeaterItem key={i} onDelete={() => onChange({ ...data, steps: steps.filter((_, j) => j !== i) })}>
            <div className="space-y-1.5 pr-5">
              <div className="border border-[#E5E7EB] rounded-lg p-2 space-y-1 bg-[#F8FAFC]">
                <span className="text-xs font-bold text-[#64748B]">العنوان</span>
                <div className="grid grid-cols-2 gap-2">
                  <Input value={step.title_ar ?? ''} onChange={(e) => onChange({ ...data, steps: steps.map((x, j) => (j === i ? { ...x, title_ar: e.target.value } : x)) })} placeholder="بالعربية" className="h-8 text-sm" />
                  <Input value={step.title_fr ?? ''} onChange={(e) => onChange({ ...data, steps: steps.map((x, j) => (j === i ? { ...x, title_fr: e.target.value } : x)) })} placeholder="en français" className="h-8 text-sm" />
                </div>
              </div>
              <div className="border border-[#E5E7EB] rounded-lg p-2 space-y-1 bg-[#F8FAFC]">
                <span className="text-xs font-bold text-[#64748B]">الوصف</span>
                <div className="grid grid-cols-2 gap-2">
                  <Textarea value={step.description_ar ?? ''} onChange={(e) => onChange({ ...data, steps: steps.map((x, j) => (j === i ? { ...x, description_ar: e.target.value } : x)) })} placeholder="بالعربية" className="min-h-12 resize-y text-sm" />
                  <Textarea value={step.description_fr ?? ''} onChange={(e) => onChange({ ...data, steps: steps.map((x, j) => (j === i ? { ...x, description_fr: e.target.value } : x)) })} placeholder="en français" className="min-h-12 resize-y text-sm" />
                </div>
              </div>
            </div>
          </RepeaterItem>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => onChange({ ...data, steps: [...steps, { title_ar: '', title_fr: '', description_ar: '', description_fr: '' }] })}>
          <Plus className="size-3.5" /> إضافة خطوة
        </Button>
      </div>
    </div>
  )
}

function SosCategoriesEditor({ data, onChange }: CustomEditorProps) {
  const categories = (data.categories ?? []) as Array<{ title_ar: string; title_fr: string }>
  return (
    <div className="space-y-3">
      <div className="border border-[#E5E7EB] rounded-lg p-3 space-y-2 bg-[#F8FAFC]">
        <span className="text-xs font-bold text-[#123B78]">Eyebrow</span>
        <div className="grid grid-cols-2 gap-2">
          <FieldGroup label="العربية"><Input value={(data.eyebrow_ar as string) ?? ''} onChange={(e) => onChange({ ...data, eyebrow_ar: e.target.value })} placeholder="بالعربية" className="h-8 text-sm" /></FieldGroup>
          <FieldGroup label="Français"><Input value={(data.eyebrow_fr as string) ?? ''} onChange={(e) => onChange({ ...data, eyebrow_fr: e.target.value })} placeholder="en français" className="h-8 text-sm" /></FieldGroup>
        </div>
      </div>
      <div className="border border-[#E5E7EB] rounded-lg p-3 space-y-2 bg-[#F8FAFC]">
        <span className="text-xs font-bold text-[#123B78]">العنوان</span>
        <div className="grid grid-cols-2 gap-2">
          <FieldGroup label="العربية"><Input value={(data.heading_ar as string) ?? ''} onChange={(e) => onChange({ ...data, heading_ar: e.target.value })} placeholder="بالعربية" className="h-8 text-sm" /></FieldGroup>
          <FieldGroup label="Français"><Input value={(data.heading_fr as string) ?? ''} onChange={(e) => onChange({ ...data, heading_fr: e.target.value })} placeholder="en français" className="h-8 text-sm" /></FieldGroup>
        </div>
      </div>
      <div className="border border-[#E5E7EB] rounded-lg p-3 space-y-2 bg-[#F8FAFC]">
        <span className="text-xs font-bold text-[#123B78]">الوصف</span>
        <div className="grid grid-cols-2 gap-2">
          <FieldGroup label="العربية"><Textarea value={(data.description_ar as string) ?? ''} onChange={(e) => onChange({ ...data, description_ar: e.target.value })} placeholder="بالعربية" className="min-h-16 resize-y text-sm" /></FieldGroup>
          <FieldGroup label="Français"><Textarea value={(data.description_fr as string) ?? ''} onChange={(e) => onChange({ ...data, description_fr: e.target.value })} placeholder="en français" className="min-h-16 resize-y text-sm" /></FieldGroup>
        </div>
      </div>
      <div className="space-y-2">
        <SectionLabel>الفئات</SectionLabel>
        {categories.map((cat, i) => (
          <RepeaterItem key={i} onDelete={() => onChange({ ...data, categories: categories.filter((_, j) => j !== i) })}>
            <div className="border border-[#E5E7EB] rounded-lg p-2 space-y-1 bg-[#F8FAFC] pr-5">
              <span className="text-xs font-bold text-[#64748B]">الاسم</span>
              <div className="grid grid-cols-2 gap-2">
                <Input value={cat.title_ar ?? ''} onChange={(e) => onChange({ ...data, categories: categories.map((x, j) => (j === i ? { ...x, title_ar: e.target.value } : x)) })} placeholder="بالعربية" className="h-8 text-sm" />
                <Input value={cat.title_fr ?? ''} onChange={(e) => onChange({ ...data, categories: categories.map((x, j) => (j === i ? { ...x, title_fr: e.target.value } : x)) })} placeholder="en français" className="h-8 text-sm" />
              </div>
            </div>
          </RepeaterItem>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => onChange({ ...data, categories: [...categories, { title_ar: '', title_fr: '' }] })}>
          <Plus className="size-3.5" /> إضافة فئة
        </Button>
      </div>
    </div>
  )
}

function SosFormEditor({ data, onChange }: CustomEditorProps) {
  return (
    <div className="space-y-3">
      <div className="border border-[#E5E7EB] rounded-lg p-3 space-y-2 bg-[#F8FAFC]">
        <span className="text-xs font-bold text-[#123B78]">Eyebrow</span>
        <div className="grid grid-cols-2 gap-2">
          <FieldGroup label="العربية"><Input value={(data.eyebrow_ar as string) ?? ''} onChange={(e) => onChange({ ...data, eyebrow_ar: e.target.value })} placeholder="بالعربية" className="h-8 text-sm" /></FieldGroup>
          <FieldGroup label="Français"><Input value={(data.eyebrow_fr as string) ?? ''} onChange={(e) => onChange({ ...data, eyebrow_fr: e.target.value })} placeholder="en français" className="h-8 text-sm" /></FieldGroup>
        </div>
      </div>
      <div className="border border-[#E5E7EB] rounded-lg p-3 space-y-2 bg-[#F8FAFC]">
        <span className="text-xs font-bold text-[#123B78]">العنوان</span>
        <div className="grid grid-cols-2 gap-2">
          <FieldGroup label="العربية"><Input value={(data.heading_ar as string) ?? ''} onChange={(e) => onChange({ ...data, heading_ar: e.target.value })} placeholder="بالعربية" className="h-8 text-sm" /></FieldGroup>
          <FieldGroup label="Français"><Input value={(data.heading_fr as string) ?? ''} onChange={(e) => onChange({ ...data, heading_fr: e.target.value })} placeholder="en français" className="h-8 text-sm" /></FieldGroup>
        </div>
      </div>
      <div className="border border-[#E5E7EB] rounded-lg p-3 space-y-2 bg-[#F8FAFC]">
        <span className="text-xs font-bold text-[#123B78]">الوصف</span>
        <div className="grid grid-cols-2 gap-2">
          <FieldGroup label="العربية"><Textarea value={(data.description_ar as string) ?? ''} onChange={(e) => onChange({ ...data, description_ar: e.target.value })} placeholder="بالعربية" className="min-h-16 resize-y text-sm" /></FieldGroup>
          <FieldGroup label="Français"><Textarea value={(data.description_fr as string) ?? ''} onChange={(e) => onChange({ ...data, description_fr: e.target.value })} placeholder="en français" className="min-h-16 resize-y text-sm" /></FieldGroup>
        </div>
      </div>
    </div>
  )
}

function SosGreenEditor({ data, onChange }: CustomEditorProps) {
  const buttons = (data.buttons ?? []) as Array<{ id: string; label_ar: string; label_fr: string; url: string; variant: string }>
  return (
    <div className="space-y-3">
      <div className="border border-[#E5E7EB] rounded-lg p-3 space-y-2 bg-[#F8FAFC]">
        <span className="text-xs font-bold text-[#123B78]">العنوان</span>
        <div className="grid grid-cols-2 gap-2">
          <FieldGroup label="العربية"><Input value={(data.heading_ar as string) ?? ''} onChange={(e) => onChange({ ...data, heading_ar: e.target.value })} placeholder="بالعربية" className="h-8 text-sm" /></FieldGroup>
          <FieldGroup label="Français"><Input value={(data.heading_fr as string) ?? ''} onChange={(e) => onChange({ ...data, heading_fr: e.target.value })} placeholder="en français" className="h-8 text-sm" /></FieldGroup>
        </div>
      </div>
      <div className="border border-[#E5E7EB] rounded-lg p-3 space-y-2 bg-[#F8FAFC]">
        <span className="text-xs font-bold text-[#123B78]">الوصف</span>
        <div className="grid grid-cols-2 gap-2">
          <FieldGroup label="العربية"><Textarea value={(data.description_ar as string) ?? ''} onChange={(e) => onChange({ ...data, description_ar: e.target.value })} placeholder="بالعربية" className="min-h-16 resize-y text-sm" /></FieldGroup>
          <FieldGroup label="Français"><Textarea value={(data.description_fr as string) ?? ''} onChange={(e) => onChange({ ...data, description_fr: e.target.value })} placeholder="en français" className="min-h-16 resize-y text-sm" /></FieldGroup>
        </div>
      </div>
      <FieldGroup label="الرقم الأخضر"><Input value={(data.number as string) ?? ''} onChange={(e) => onChange({ ...data, number: e.target.value })} className="h-9 text-sm" /></FieldGroup>
      <div className="border border-[#E5E7EB] rounded-lg p-3 space-y-2 bg-[#F8FAFC]">
        <span className="text-xs font-bold text-[#123B78]">ساعات العمل</span>
        <div className="grid grid-cols-2 gap-2">
          <FieldGroup label="العربية"><Input value={(data.hours_ar as string) ?? ''} onChange={(e) => onChange({ ...data, hours_ar: e.target.value })} placeholder="بالعربية" className="h-8 text-sm" /></FieldGroup>
          <FieldGroup label="Français"><Input value={(data.hours_fr as string) ?? ''} onChange={(e) => onChange({ ...data, hours_fr: e.target.value })} placeholder="en français" className="h-8 text-sm" /></FieldGroup>
        </div>
      </div>
      <div className="space-y-2">
        <SectionLabel>الأزرار</SectionLabel>
        {buttons.map((btn, i) => (
          <RepeaterItem key={btn.id || i} onDelete={() => onChange({ ...data, buttons: buttons.filter((_, j) => j !== i) })}>
            <div className="space-y-1.5 pr-5">
              <div className="border border-[#E5E7EB] rounded-lg p-2 space-y-1 bg-[#F8FAFC]">
                <span className="text-xs font-bold text-[#64748B]">نص الزر</span>
                <div className="grid grid-cols-2 gap-2">
                  <Input value={btn.label_ar ?? ''} onChange={(e) => onChange({ ...data, buttons: buttons.map((x, j) => (j === i ? { ...x, label_ar: e.target.value } : x)) })} placeholder="بالعربية" className="h-8 text-sm" />
                  <Input value={btn.label_fr ?? ''} onChange={(e) => onChange({ ...data, buttons: buttons.map((x, j) => (j === i ? { ...x, label_fr: e.target.value } : x)) })} placeholder="en français" className="h-8 text-sm" />
                </div>
              </div>
              <Input value={btn.url} onChange={(e) => onChange({ ...data, buttons: buttons.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)) })} placeholder="الرابط" className="h-8 text-sm" />
              <select value={btn.variant} onChange={(e) => onChange({ ...data, buttons: buttons.map((x, j) => (j === i ? { ...x, variant: e.target.value } : x)) })} className="h-8 w-full rounded-lg border border-[#E5E7EB] bg-transparent px-2.5 text-xs"><option value="primary">Primary</option><option value="secondary">Secondary</option><option value="outline">Outline</option></select>
            </div>
          </RepeaterItem>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => onChange({ ...data, buttons: [...buttons, { id: 'btn-'+Date.now(), label_ar:'',label_fr:'',url:'#',variant:'primary' }] })}><Plus className="size-3.5" /> إضافة زر</Button>
      </div>
    </div>
  )
}

function SosFaqEditor({ data, onChange }: CustomEditorProps) {
  const items = (data.items ?? []) as Array<{ question_ar: string; question_fr: string; answer_ar: string; answer_fr: string }>
  return (
    <div className="space-y-3">
      <div className="border border-[#E5E7EB] rounded-lg p-3 space-y-2 bg-[#F8FAFC]">
        <span className="text-xs font-bold text-[#123B78]">Eyebrow</span>
        <div className="grid grid-cols-2 gap-2">
          <FieldGroup label="العربية"><Input value={(data.eyebrow_ar as string) ?? ''} onChange={(e) => onChange({ ...data, eyebrow_ar: e.target.value })} placeholder="بالعربية" className="h-8 text-sm" /></FieldGroup>
          <FieldGroup label="Français"><Input value={(data.eyebrow_fr as string) ?? ''} onChange={(e) => onChange({ ...data, eyebrow_fr: e.target.value })} placeholder="en français" className="h-8 text-sm" /></FieldGroup>
        </div>
      </div>
      <div className="border border-[#E5E7EB] rounded-lg p-3 space-y-2 bg-[#F8FAFC]">
        <span className="text-xs font-bold text-[#123B78]">العنوان</span>
        <div className="grid grid-cols-2 gap-2">
          <FieldGroup label="العربية"><Input value={(data.heading_ar as string) ?? ''} onChange={(e) => onChange({ ...data, heading_ar: e.target.value })} placeholder="بالعربية" className="h-8 text-sm" /></FieldGroup>
          <FieldGroup label="Français"><Input value={(data.heading_fr as string) ?? ''} onChange={(e) => onChange({ ...data, heading_fr: e.target.value })} placeholder="en français" className="h-8 text-sm" /></FieldGroup>
        </div>
      </div>
      <div className="border border-[#E5E7EB] rounded-lg p-3 space-y-2 bg-[#F8FAFC]">
        <span className="text-xs font-bold text-[#123B78]">الوصف</span>
        <div className="grid grid-cols-2 gap-2">
          <FieldGroup label="العربية"><Textarea value={(data.description_ar as string) ?? ''} onChange={(e) => onChange({ ...data, description_ar: e.target.value })} placeholder="بالعربية" className="min-h-16 resize-y text-sm" /></FieldGroup>
          <FieldGroup label="Français"><Textarea value={(data.description_fr as string) ?? ''} onChange={(e) => onChange({ ...data, description_fr: e.target.value })} placeholder="en français" className="min-h-16 resize-y text-sm" /></FieldGroup>
        </div>
      </div>
      <div className="space-y-2">
        <SectionLabel>الأسئلة</SectionLabel>
        {items.map((item, i) => (
          <RepeaterItem key={i} onDelete={() => onChange({ ...data, items: items.filter((_, j) => j !== i) })}>
            <div className="space-y-1.5 pr-5">
              <div className="border border-[#E5E7EB] rounded-lg p-2 space-y-1 bg-[#F8FAFC]">
                <span className="text-xs font-bold text-[#64748B]">السؤال</span>
                <div className="grid grid-cols-2 gap-2">
                  <Input value={item.question_ar ?? ''} onChange={(e) => onChange({ ...data, items: items.map((x, j) => (j === i ? { ...x, question_ar: e.target.value } : x)) })} placeholder="بالعربية" className="h-8 text-sm" />
                  <Input value={item.question_fr ?? ''} onChange={(e) => onChange({ ...data, items: items.map((x, j) => (j === i ? { ...x, question_fr: e.target.value } : x)) })} placeholder="en français" className="h-8 text-sm" />
                </div>
              </div>
              <div className="border border-[#E5E7EB] rounded-lg p-2 space-y-1 bg-[#F8FAFC]">
                <span className="text-xs font-bold text-[#64748B]">الجواب</span>
                <div className="grid grid-cols-2 gap-2">
                  <Textarea value={item.answer_ar ?? ''} onChange={(e) => onChange({ ...data, items: items.map((x, j) => (j === i ? { ...x, answer_ar: e.target.value } : x)) })} placeholder="بالعربية" className="min-h-16 resize-y text-sm" />
                  <Textarea value={item.answer_fr ?? ''} onChange={(e) => onChange({ ...data, items: items.map((x, j) => (j === i ? { ...x, answer_fr: e.target.value } : x)) })} placeholder="en français" className="min-h-16 resize-y text-sm" />
                </div>
              </div>
            </div>
          </RepeaterItem>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => onChange({ ...data, items: [...items, { question_ar: '', question_fr: '', answer_ar: '', answer_fr: '' }] })}><Plus className="size-3.5" /> إضافة سؤال</Button>
      </div>
    </div>
  )
}

function SosCtaEditor({ data, onChange }: CustomEditorProps) {
  const buttons = (data.buttons ?? []) as Array<{ id: string; label_ar: string; label_fr: string; url: string; variant: string }>
  return (
    <div className="space-y-3">
      <div className="border border-[#E5E7EB] rounded-lg p-3 space-y-2 bg-[#F8FAFC]">
        <span className="text-xs font-bold text-[#123B78]">العنوان</span>
        <div className="grid grid-cols-2 gap-2">
          <FieldGroup label="العربية"><Input value={(data.heading_ar as string) ?? ''} onChange={(e) => onChange({ ...data, heading_ar: e.target.value })} placeholder="بالعربية" className="h-8 text-sm" /></FieldGroup>
          <FieldGroup label="Français"><Input value={(data.heading_fr as string) ?? ''} onChange={(e) => onChange({ ...data, heading_fr: e.target.value })} placeholder="en français" className="h-8 text-sm" /></FieldGroup>
        </div>
      </div>
      <div className="space-y-2">
        <SectionLabel>الأزرار</SectionLabel>
        {buttons.map((btn, i) => (
          <RepeaterItem key={btn.id || i} onDelete={() => onChange({ ...data, buttons: buttons.filter((_, j) => j !== i) })}>
            <div className="space-y-1.5 pr-5">
              <div className="border border-[#E5E7EB] rounded-lg p-2 space-y-1 bg-[#F8FAFC]">
                <span className="text-xs font-bold text-[#64748B]">نص الزر</span>
                <div className="grid grid-cols-2 gap-2">
                  <Input value={btn.label_ar ?? ''} onChange={(e) => onChange({ ...data, buttons: buttons.map((x, j) => (j === i ? { ...x, label_ar: e.target.value } : x)) })} placeholder="بالعربية" className="h-8 text-sm" />
                  <Input value={btn.label_fr ?? ''} onChange={(e) => onChange({ ...data, buttons: buttons.map((x, j) => (j === i ? { ...x, label_fr: e.target.value } : x)) })} placeholder="en français" className="h-8 text-sm" />
                </div>
              </div>
              <Input value={btn.url} onChange={(e) => onChange({ ...data, buttons: buttons.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)) })} placeholder="الرابط" className="h-8 text-sm" />
              <select value={btn.variant} onChange={(e) => onChange({ ...data, buttons: buttons.map((x, j) => (j === i ? { ...x, variant: e.target.value } : x)) })} className="h-8 w-full rounded-lg border border-[#E5E7EB] bg-transparent px-2.5 text-xs"><option value="primary">Primary</option><option value="secondary">Secondary</option><option value="outline">Outline</option></select>
            </div>
          </RepeaterItem>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => onChange({ ...data, buttons: [...buttons, { id: 'btn-'+Date.now(), label_ar:'',label_fr:'',url:'#',variant:'primary' }] })}><Plus className="size-3.5" /> إضافة زر</Button>
      </div>
    </div>
  )
}

// =====================================================================
// RENDERER REGISTRY
// =====================================================================

type CustomSectionEditorComponent = React.ComponentType<CustomEditorProps>

const RENDERER_EDITORS: Record<string, CustomSectionEditorComponent> = {
  about: AboutEditor,
  featuresGrid: FeaturesGridEditor,
  activitiesGrid: ActivitiesGridEditor,
  activitiesCta: ActivitiesCtaEditor,
  newsGrid: NewsGridEditor,
  footer: FooterEditor,
  nationalVision: NationalVisionEditor,
  mission: MissionEditor,
  values: ValuesEditor,
  centralOffice: CentralOfficeEditor,
  expansionMap: ExpansionMapEditor,
  sosHow: SosHowEditor,
  sosCategories: SosCategoriesEditor,
  sosForm: SosFormEditor,
  sosGreen: SosGreenEditor,
  sosFaq: SosFaqEditor,
  sosCta: SosCtaEditor,
  partnerAbout: PartnerAboutEditor,
  partnerServices: PartnerServicesEditor,
  partnerWhy: PartnerWhyEditor,
  partnerGallery: PartnerGalleryEditor,
  partnerContact: PartnerContactEditor,
  partnerForm: PartnerFormEditor,
  partnerCta: PartnerCtaEditor,
  magFeatured: MagFeaturedEditor,
  magLatest: MagLatestEditor,
  magCats: MagCatsEditor,
  magNewsletter: MagNewsletterEditor,
  magCta: MagCtaEditor,
  docGrid: DocGridEditor,
  docDownload: DocDownloadEditor,
  docRequirements: DocRequirementsEditor,
  docFaq: DocFaqEditor,
  docCta: DocCtaEditor,
  nwFeatured: NwFeaturedEditor,
  nwGrid: NwGridEditor,
  nwCategories: NwCategoriesEditor,
  nwSearch: NwSearchEditor,
  nwNewsletter: NwNewsletterEditor,
  nwCta: NwCtaEditor,
  arStats: ArStatsEditor,
  arCategories: ArCategoriesEditor,
  arSearch: ArSearchEditor,
  arLibrary: ArLibraryEditor,
  arDownloads: ArDownloadsEditor,
  arFaq: ArFaqEditor,
  arCta: ArCtaEditor,
  contactCards: ContactCardsEditor,
  contactForm: ContactFormEditor,
  contactMap: ContactMapEditor,
  contactFaq: ContactFaqEditor,
  contactCta: ContactCtaEditor,
}

export function getCustomSectionEditor(
  data: Record<string, unknown>,
): CustomSectionEditorComponent {
  const renderer = data._renderer as string | undefined
  if (renderer && RENDERER_EDITORS[renderer]) {
    return RENDERER_EDITORS[renderer]!
  }
  return GenericStructuredEditor
}

export { AboutEditor, FeaturesGridEditor, ActivitiesGridEditor, NewsGridEditor, FooterEditor, GenericStructuredEditor }
