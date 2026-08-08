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
  const paragraphs = (data.paragraphs ?? []) as string[]
  const features = (data.features ?? []) as Array<{ title: string; description: string }>
  const buttons = (data.buttons ?? []) as Array<{ id: string; label: string; url: string; variant: string }>
  const image = (data.image ?? { url: '', alt: '' }) as { url: string; alt: string }
  const stats = (data.stats ?? []) as Array<{ value: string; suffix: string; label: string }>

  return (
    <div className="space-y-3">
      <div className="grid gap-3">
        <FieldGroup label="العنوان الفرعي (Eyebrow)">
          <Input value={(data.eyebrow as string) ?? ''} onChange={(e) => onChange({ ...data, eyebrow: e.target.value })} className="h-9 text-sm" />
        </FieldGroup>
        <FieldGroup label="العنوان الرئيسي">
          <Input value={(data.heading as string) ?? ''} onChange={(e) => onChange({ ...data, heading: e.target.value })} className="h-9 text-sm" />
        </FieldGroup>
        <FieldGroup label="الكلمة المميزة">
          <Input value={(data.headingHighlight as string) ?? ''} onChange={(e) => onChange({ ...data, headingHighlight: e.target.value })} className="h-9 text-sm" />
        </FieldGroup>
        <FieldGroup label="الوصف">
          <Input value={(data.description as string) ?? ''} onChange={(e) => onChange({ ...data, description: e.target.value })} className="h-9 text-sm" />
        </FieldGroup>
      </div>

      {/* Paragraphs */}
      <div className="space-y-2">
        <SectionLabel>الفقرات</SectionLabel>
        {paragraphs.map((p, i) => (
          <RepeaterItem key={i} onDelete={() => onChange({ ...data, paragraphs: paragraphs.filter((_, j) => j !== i) })}>
            <Textarea
              value={p}
              onChange={(e) => onChange({ ...data, paragraphs: paragraphs.map((x, j) => (j === i ? e.target.value : x)) })}
              className="min-h-16 resize-y text-sm"
              placeholder="نص الفقرة"
            />
          </RepeaterItem>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => onChange({ ...data, paragraphs: [...paragraphs, ''] })}>
          <Plus className="size-3.5" /> إضافة فقرة
        </Button>
      </div>

      {/* Features */}
      <div className="space-y-2">
        <SectionLabel>المميزات</SectionLabel>
        {features.map((f, i) => (
          <RepeaterItem key={i} onDelete={() => onChange({ ...data, features: features.filter((_, j) => j !== i) })}>
            <div className="space-y-2 pr-5">
              <Input value={f.title} onChange={(e) => onChange({ ...data, features: features.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)) })} placeholder="العنوان" className="h-8 text-sm" />
              <Input value={f.description} onChange={(e) => onChange({ ...data, features: features.map((x, j) => (j === i ? { ...x, description: e.target.value } : x)) })} placeholder="الوصف" className="h-8 text-sm" />
            </div>
          </RepeaterItem>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => onChange({ ...data, features: [...features, { title: '', description: '' }] })}>
          <Plus className="size-3.5" /> إضافة ميزة
        </Button>
      </div>

      {/* Buttons */}
      <div className="space-y-2">
        <SectionLabel>الأزرار</SectionLabel>
        {buttons.map((btn, i) => (
          <RepeaterItem key={btn.id || i} onDelete={() => onChange({ ...data, buttons: buttons.filter((_, j) => j !== i) })}>
            <div className="space-y-2 pr-5">
              <Input value={btn.label} onChange={(e) => onChange({ ...data, buttons: buttons.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)) })} placeholder="نص الزر" className="h-8 text-sm" />
              <Input value={btn.url} onChange={(e) => onChange({ ...data, buttons: buttons.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)) })} placeholder="الرابط" className="h-8 text-sm" />
            </div>
          </RepeaterItem>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => onChange({ ...data, buttons: [...buttons, { id: `btn-${Date.now()}`, label: '', url: '#', variant: 'primary' }] })}>
          <Plus className="size-3.5" /> إضافة زر
        </Button>
      </div>

      {/* Image */}
      <FieldGroup label="الصورة">
        <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-lg border border-dashed bg-muted/40">
          {image.url ? <img src={image.url} alt={image.alt} className="size-full object-cover" /> : <ImageIcon className="size-6 text-muted-foreground" />}
        </div>
        <Input value={image.url} onChange={(e) => onChange({ ...data, image: { ...image, url: e.target.value } })} placeholder="رابط الصورة" className="h-9 text-sm" />
        <Input value={image.alt} onChange={(e) => onChange({ ...data, image: { ...image, alt: e.target.value } })} placeholder="النص البديل" className="h-9 text-sm" />
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
              <Input value={s.label} onChange={(e) => onChange({ ...data, stats: stats.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)) })} placeholder="تسمية" className="h-8 text-center text-xs" />
            </div>
          ))}
        </div>
        <Button type="button" variant="outline" size="sm" onClick={() => onChange({ ...data, stats: [...stats, { value: '0', suffix: '+', label: '' }] })}>
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
  const cards = (data.cards ?? []) as Array<{ heading: string; description: string }>

  return (
    <div className="space-y-3">
      <FieldGroup label="العنوان الفرعي (Eyebrow)">
        <Input value={(data.eyebrow as string) ?? ''} onChange={(e) => onChange({ ...data, eyebrow: e.target.value })} className="h-9 text-sm" />
      </FieldGroup>
      <FieldGroup label="العنوان الرئيسي">
        <Input value={(data.heading as string) ?? ''} onChange={(e) => onChange({ ...data, heading: e.target.value })} className="h-9 text-sm" />
      </FieldGroup>
      <FieldGroup label="الوصف">
        <Textarea value={(data.description as string) ?? ''} onChange={(e) => onChange({ ...data, description: e.target.value })} className="min-h-16 resize-y text-sm" />
      </FieldGroup>

      <div className="space-y-2">
        <SectionLabel>البطاقات</SectionLabel>
        {cards.map((card, i) => (
          <RepeaterItem key={i} onDelete={() => onChange({ ...data, cards: cards.filter((_, j) => j !== i) })}>
            <div className="space-y-2 pr-5">
              <Input value={card.heading} onChange={(e) => onChange({ ...data, cards: cards.map((x, j) => (j === i ? { ...x, heading: e.target.value } : x)) })} placeholder="العنوان" className="h-8 text-sm font-medium" />
              <Textarea value={card.description} onChange={(e) => onChange({ ...data, cards: cards.map((x, j) => (j === i ? { ...x, description: e.target.value } : x)) })} placeholder="الوصف" className="min-h-12 resize-y text-sm" />
            </div>
          </RepeaterItem>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => onChange({ ...data, cards: [...cards, { heading: '', description: '' }] })}>
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
    title: string
    description: string
    image: string
    linkText: string
    linkUrl: string
  }>

  return (
    <div className="space-y-3">
      <FieldGroup label="العنوان الرئيسي">
        <Input value={(data.heading as string) ?? ''} onChange={(e) => onChange({ ...data, heading: e.target.value })} className="h-9 text-sm" />
      </FieldGroup>
      <FieldGroup label="الوصف">
        <Input value={(data.description as string) ?? ''} onChange={(e) => onChange({ ...data, description: e.target.value })} className="h-9 text-sm" />
      </FieldGroup>

      <div className="space-y-2">
        <SectionLabel>البطاقات</SectionLabel>
        {cards.map((card, i) => (
          <RepeaterItem key={i} onDelete={() => onChange({ ...data, cards: cards.filter((_, j) => j !== i) })}>
            <div className="space-y-2 pr-5">
              <div className="relative aspect-video w-full overflow-hidden rounded-md bg-muted">
                {card.image ? (
                  <img src={card.image} alt={card.title} className="size-full object-cover" />
                ) : (
                  <div className="flex size-full items-center justify-center">
                    <ImageIcon className="size-5 text-muted-foreground" />
                  </div>
                )}
              </div>
              <Input value={card.image} onChange={(e) => onChange({ ...data, cards: cards.map((x, j) => (j === i ? { ...x, image: e.target.value } : x)) })} placeholder="رابط الصورة" className="h-8 text-sm" />
              <Input value={card.title} onChange={(e) => onChange({ ...data, cards: cards.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)) })} placeholder="العنوان" className="h-8 text-sm font-medium" />
              <Textarea value={card.description} onChange={(e) => onChange({ ...data, cards: cards.map((x, j) => (j === i ? { ...x, description: e.target.value } : x)) })} placeholder="الوصف" className="min-h-12 resize-y text-sm" />
              <div className="flex gap-2">
                <Input value={card.linkText} onChange={(e) => onChange({ ...data, cards: cards.map((x, j) => (j === i ? { ...x, linkText: e.target.value } : x)) })} placeholder="نص الرابط" className="h-8 flex-1 text-sm" />
                <Input value={card.linkUrl} onChange={(e) => onChange({ ...data, cards: cards.map((x, j) => (j === i ? { ...x, linkUrl: e.target.value } : x)) })} placeholder="الرابط" className="h-8 flex-1 text-sm" />
              </div>
            </div>
          </RepeaterItem>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => onChange({ ...data, cards: [...cards, { title: '', description: '', image: '', linkText: 'اكتشف المزيد', linkUrl: '#' }] })}>
          <Plus className="size-3.5" /> إضافة بطاقة
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
    title: string
    date: string
    badge: string
    image: string
    linkText: string
    linkUrl: string
  }>

  return (
    <div className="space-y-3">
      <FieldGroup label="العنوان الفرعي (Eyebrow)">
        <Input value={(data.eyebrow as string) ?? ''} onChange={(e) => onChange({ ...data, eyebrow: e.target.value })} className="h-9 text-sm" />
      </FieldGroup>
      <FieldGroup label="العنوان الرئيسي">
        <Input value={(data.heading as string) ?? ''} onChange={(e) => onChange({ ...data, heading: e.target.value })} className="h-9 text-sm" />
      </FieldGroup>

      <div className="space-y-2">
        <SectionLabel>الأخبار</SectionLabel>
        {cards.map((card, i) => (
          <RepeaterItem key={i} onDelete={() => onChange({ ...data, cards: cards.filter((_, j) => j !== i) })}>
            <div className="space-y-2 pr-5">
              <div className="relative aspect-video w-full overflow-hidden rounded-md bg-muted">
                {card.image ? (
                  <img src={card.image} alt={card.title} className="size-full object-cover" />
                ) : (
                  <div className="flex size-full items-center justify-center">
                    <ImageIcon className="size-5 text-muted-foreground" />
                  </div>
                )}
              </div>
              <Input value={card.image} onChange={(e) => onChange({ ...data, cards: cards.map((x, j) => (j === i ? { ...x, image: e.target.value } : x)) })} placeholder="رابط الصورة" className="h-8 text-sm" />
              <div className="flex gap-2">
                <Input value={card.badge} onChange={(e) => onChange({ ...data, cards: cards.map((x, j) => (j === i ? { ...x, badge: e.target.value } : x)) })} placeholder="التصنيف" className="h-8 w-24 text-sm" />
                <Input value={card.date} onChange={(e) => onChange({ ...data, cards: cards.map((x, j) => (j === i ? { ...x, date: e.target.value } : x)) })} placeholder="التاريخ" className="h-8 flex-1 text-sm" />
              </div>
              <Input value={card.title} onChange={(e) => onChange({ ...data, cards: cards.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)) })} placeholder="العنوان" className="h-8 text-sm font-medium" />
              <div className="flex gap-2">
                <Input value={card.linkText} onChange={(e) => onChange({ ...data, cards: cards.map((x, j) => (j === i ? { ...x, linkText: e.target.value } : x)) })} placeholder="نص الرابط" className="h-8 flex-1 text-sm" />
                <Input value={card.linkUrl} onChange={(e) => onChange({ ...data, cards: cards.map((x, j) => (j === i ? { ...x, linkUrl: e.target.value } : x)) })} placeholder="الرابط" className="h-8 flex-1 text-sm" />
              </div>
            </div>
          </RepeaterItem>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => onChange({ ...data, cards: [...cards, { title: '', date: '', badge: '', image: '', linkText: 'اقرأ المزيد', linkUrl: '#' }] })}>
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
  const quickLinks = (data.quickLinks ?? []) as Array<{ label: string; url: string }>
  const programs = (data.programs ?? []) as Array<{ label: string; url: string }>
  const contact = (data.contact ?? { address: '', phone: '', email: '' }) as { address: string; phone: string; email: string }
  const bottomLinks = (data.bottomLinks ?? []) as Array<{ label: string; url: string }>

  return (
    <div className="space-y-3">
      <div className="grid gap-3">
        <FieldGroup label="اسم الجمعية">
          <Input value={(data.brandName as string) ?? ''} onChange={(e) => onChange({ ...data, brandName: e.target.value })} className="h-9 text-sm" />
        </FieldGroup>
        <FieldGroup label="شعار الجمعية (رابط الصورة)">
          <Input value={(data.brandLogo as string) ?? ''} onChange={(e) => onChange({ ...data, brandLogo: e.target.value })} className="h-9 text-sm" />
        </FieldGroup>
        <FieldGroup label="النص التعريفي">
          <Textarea value={(data.description as string) ?? ''} onChange={(e) => onChange({ ...data, description: e.target.value })} className="min-h-16 resize-y text-sm" />
        </FieldGroup>
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
        <FieldGroup label="عنوان الروابط السريعة">
          <Input value={(data.quickLinksHeading as string) ?? ''} onChange={(e) => onChange({ ...data, quickLinksHeading: e.target.value })} className="h-9 text-sm" />
        </FieldGroup>
        <SectionLabel>الروابط السريعة</SectionLabel>
        {quickLinks.map((link, i) => (
          <RepeaterItem key={i} onDelete={() => onChange({ ...data, quickLinks: quickLinks.filter((_, j) => j !== i) })}>
            <div className="flex gap-2 pr-5">
              <Input value={link.label} onChange={(e) => onChange({ ...data, quickLinks: quickLinks.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)) })} placeholder="النص" className="h-8 flex-1 text-sm" />
              <Input value={link.url} onChange={(e) => onChange({ ...data, quickLinks: quickLinks.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)) })} placeholder="الرابط" className="h-8 flex-1 text-sm" />
            </div>
          </RepeaterItem>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => onChange({ ...data, quickLinks: [...quickLinks, { label: '', url: '#' }] })}>
          <Plus className="size-3.5" /> إضافة رابط
        </Button>
      </div>

      {/* Programs */}
      <div className="space-y-2">
        <FieldGroup label="عنوان البرامج">
          <Input value={(data.programsHeading as string) ?? ''} onChange={(e) => onChange({ ...data, programsHeading: e.target.value })} className="h-9 text-sm" />
        </FieldGroup>
        <SectionLabel>البرامج</SectionLabel>
        {programs.map((prog, i) => (
          <RepeaterItem key={i} onDelete={() => onChange({ ...data, programs: programs.filter((_, j) => j !== i) })}>
            <div className="flex gap-2 pr-5">
              <Input value={prog.label} onChange={(e) => onChange({ ...data, programs: programs.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)) })} placeholder="النص" className="h-8 flex-1 text-sm" />
              <Input value={prog.url} onChange={(e) => onChange({ ...data, programs: programs.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)) })} placeholder="الرابط" className="h-8 flex-1 text-sm" />
            </div>
          </RepeaterItem>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => onChange({ ...data, programs: [...programs, { label: '', url: '#' }] })}>
          <Plus className="size-3.5" /> إضافة برنامج
        </Button>
      </div>

      {/* Contact */}
      <div className="space-y-2">
        <SectionLabel>معلومات التواصل</SectionLabel>
        <Input value={contact.address} onChange={(e) => onChange({ ...data, contact: { ...contact, address: e.target.value } })} placeholder="العنوان" className="h-9 text-sm" />
        <Input value={contact.phone} onChange={(e) => onChange({ ...data, contact: { ...contact, phone: e.target.value } })} placeholder="الهاتف" className="h-9 text-sm" />
        <Input value={contact.email} onChange={(e) => onChange({ ...data, contact: { ...contact, email: e.target.value } })} placeholder="البريد الإلكتروني" className="h-9 text-sm" />
      </div>

      {/* Map */}
      <div className="grid gap-3">
        <FieldGroup label="عنوان الخريطة">
          <Input value={(data.mapHeading as string) ?? ''} onChange={(e) => onChange({ ...data, mapHeading: e.target.value })} className="h-9 text-sm" />
        </FieldGroup>
        <FieldGroup label="تسمية الموقع">
          <Input value={(data.mapLabel as string) ?? ''} onChange={(e) => onChange({ ...data, mapLabel: e.target.value })} className="h-9 text-sm" />
        </FieldGroup>
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
      <FieldGroup label="حقوق النشر">
        <Input value={(data.copyright as string) ?? ''} onChange={(e) => onChange({ ...data, copyright: e.target.value })} className="h-9 text-sm" />
      </FieldGroup>

      {/* Bottom Links */}
      <div className="space-y-2">
        <SectionLabel>روابط التذييل</SectionLabel>
        {bottomLinks.map((link, i) => (
          <RepeaterItem key={i} onDelete={() => onChange({ ...data, bottomLinks: bottomLinks.filter((_, j) => j !== i) })}>
            <div className="flex gap-2 pr-5">
              <Input value={link.label} onChange={(e) => onChange({ ...data, bottomLinks: bottomLinks.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)) })} placeholder="النص" className="h-8 flex-1 text-sm" />
              <Input value={link.url} onChange={(e) => onChange({ ...data, bottomLinks: bottomLinks.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)) })} placeholder="الرابط" className="h-8 flex-1 text-sm" />
            </div>
          </RepeaterItem>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => onChange({ ...data, bottomLinks: [...bottomLinks, { label: '', url: '#' }] })}>
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
  const cards = (data.cards ?? []) as Array<{ title: string; description: string }>

  return (
    <div className="space-y-3">
      <FieldGroup label="العنوان الفرعي (Eyebrow)">
        <Input value={(data.eyebrow as string) ?? ''} onChange={(e) => onChange({ ...data, eyebrow: e.target.value })} className="h-9 text-sm" />
      </FieldGroup>
      <FieldGroup label="العنوان الرئيسي">
        <Input value={(data.heading as string) ?? ''} onChange={(e) => onChange({ ...data, heading: e.target.value })} className="h-9 text-sm" />
      </FieldGroup>
      <FieldGroup label="النص الرئيسي">
        <Textarea value={(data.description as string) ?? ''} onChange={(e) => onChange({ ...data, description: e.target.value })} className="min-h-20 resize-y text-sm" />
      </FieldGroup>

      <div className="space-y-2">
        <SectionLabel>بطاقات الرؤية</SectionLabel>
        {cards.map((card, i) => (
          <RepeaterItem key={i} onDelete={() => onChange({ ...data, cards: cards.filter((_, j) => j !== i) })}>
            <div className="space-y-2 pr-5">
              <Input value={card.title} onChange={(e) => onChange({ ...data, cards: cards.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)) })} placeholder="العنوان" className="h-8 text-sm font-medium" />
              <Textarea value={card.description} onChange={(e) => onChange({ ...data, cards: cards.map((x, j) => (j === i ? { ...x, description: e.target.value } : x)) })} placeholder="الوصف" className="min-h-12 resize-y text-sm" />
            </div>
          </RepeaterItem>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => onChange({ ...data, cards: [...cards, { title: '', description: '' }] })}>
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
      <FieldGroup label="العنوان الفرعي (Eyebrow)">
        <Input value={(data.eyebrow as string) ?? ''} onChange={(e) => onChange({ ...data, eyebrow: e.target.value })} className="h-9 text-sm" />
      </FieldGroup>
      <FieldGroup label="العنوان الرئيسي">
        <Input value={(data.heading as string) ?? ''} onChange={(e) => onChange({ ...data, heading: e.target.value })} className="h-9 text-sm" />
      </FieldGroup>
      <FieldGroup label="النص الرئيسي">
        <Textarea value={(data.description as string) ?? ''} onChange={(e) => onChange({ ...data, description: e.target.value })} className="min-h-24 resize-y text-sm" />
      </FieldGroup>
    </div>
  )
}

// =====================================================================
// VALUES EDITOR  (_renderer: "values")
// =====================================================================

function ValuesEditor({ data, onChange }: CustomEditorProps) {
  const cards = (data.cards ?? []) as Array<{ title: string; description: string }>

  return (
    <div className="space-y-3">
      <FieldGroup label="العنوان الفرعي (Eyebrow)">
        <Input value={(data.eyebrow as string) ?? ''} onChange={(e) => onChange({ ...data, eyebrow: e.target.value })} className="h-9 text-sm" />
      </FieldGroup>
      <FieldGroup label="العنوان الرئيسي">
        <Input value={(data.heading as string) ?? ''} onChange={(e) => onChange({ ...data, heading: e.target.value })} className="h-9 text-sm" />
      </FieldGroup>
      <FieldGroup label="الوصف">
        <Textarea value={(data.description as string) ?? ''} onChange={(e) => onChange({ ...data, description: e.target.value })} className="min-h-16 resize-y text-sm" />
      </FieldGroup>

      <div className="space-y-2">
        <SectionLabel>القيم</SectionLabel>
        {cards.map((card, i) => (
          <RepeaterItem key={i} onDelete={() => onChange({ ...data, cards: cards.filter((_, j) => j !== i) })}>
            <div className="space-y-2 pr-5">
              <Input value={card.title} onChange={(e) => onChange({ ...data, cards: cards.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)) })} placeholder="العنوان" className="h-8 text-sm font-medium" />
              <Textarea value={card.description} onChange={(e) => onChange({ ...data, cards: cards.map((x, j) => (j === i ? { ...x, description: e.target.value } : x)) })} placeholder="الوصف" className="min-h-12 resize-y text-sm" />
            </div>
          </RepeaterItem>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => onChange({ ...data, cards: [...cards, { title: '', description: '' }] })}>
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
    name: string
    role: string
    bio: string
    color: string
    facebook: string
    instagram: string
    linkedin: string
    profileUrl: string
  }>

  return (
    <div className="space-y-3">
      <FieldGroup label="العنوان الفرعي (Eyebrow)">
        <Input value={(data.eyebrow as string) ?? ''} onChange={(e) => onChange({ ...data, eyebrow: e.target.value })} className="h-9 text-sm" />
      </FieldGroup>
      <FieldGroup label="العنوان الرئيسي">
        <Input value={(data.heading as string) ?? ''} onChange={(e) => onChange({ ...data, heading: e.target.value })} className="h-9 text-sm" />
      </FieldGroup>
      <FieldGroup label="النص التعريفي">
        <Textarea value={(data.description as string) ?? ''} onChange={(e) => onChange({ ...data, description: e.target.value })} className="min-h-20 resize-y text-sm" />
      </FieldGroup>

      <div className="border-t border-[#E5E7EB] pt-3 space-y-3">
        <FieldGroup label="العنوان الفرعي للفريق">
          <Input value={(data.teamEyebrow as string) ?? ''} onChange={(e) => onChange({ ...data, teamEyebrow: e.target.value })} className="h-9 text-sm" />
        </FieldGroup>
        <FieldGroup label="عنوان الفريق">
          <Input value={(data.teamHeading as string) ?? ''} onChange={(e) => onChange({ ...data, teamHeading: e.target.value })} className="h-9 text-sm" />
        </FieldGroup>
        <FieldGroup label="وصف الفريق">
          <Textarea value={(data.teamDescription as string) ?? ''} onChange={(e) => onChange({ ...data, teamDescription: e.target.value })} className="min-h-16 resize-y text-sm" />
        </FieldGroup>
      </div>

      <div className="space-y-2">
        <SectionLabel>الأعضاء</SectionLabel>
        {members.map((m, i) => (
          <RepeaterItem key={i} onDelete={() => onChange({ ...data, members: members.filter((_, j) => j !== i) })}>
            <div className="space-y-1.5 pr-5">
              <div className="flex gap-2">
                <Input value={m.name} onChange={(e) => onChange({ ...data, members: members.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)) })} placeholder="الاسم" className="h-8 flex-1 text-sm" />
                <input
                  type="color"
                  value={m.color ?? '#123B78'}
                  onChange={(e) => onChange({ ...data, members: members.map((x, j) => (j === i ? { ...x, color: e.target.value } : x)) })}
                  className="h-8 w-10 cursor-pointer rounded-lg border border-[#E5E7EB] p-0.5"
                />
              </div>
              <Input value={m.role} onChange={(e) => onChange({ ...data, members: members.map((x, j) => (j === i ? { ...x, role: e.target.value } : x)) })} placeholder="المنصب" className="h-8 text-sm" />
              <Textarea value={m.bio} onChange={(e) => onChange({ ...data, members: members.map((x, j) => (j === i ? { ...x, bio: e.target.value } : x)) })} placeholder="النبذة" className="min-h-12 resize-y text-sm" />
              <div className="flex gap-2">
                <Input value={m.facebook} onChange={(e) => onChange({ ...data, members: members.map((x, j) => (j === i ? { ...x, facebook: e.target.value } : x)) })} placeholder="فيسبوك" className="h-8 flex-1 text-sm" />
                <Input value={m.profileUrl} onChange={(e) => onChange({ ...data, members: members.map((x, j) => (j === i ? { ...x, profileUrl: e.target.value } : x)) })} placeholder="الرابط الشخصي" className="h-8 flex-1 text-sm" />
              </div>
            </div>
          </RepeaterItem>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => onChange({ ...data, members: [...members, { name: '', role: '', bio: '', color: '#123B78', facebook: '#', instagram: '#', linkedin: '#', profileUrl: '#' }] })}>
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
  const regions = (data.regions ?? []) as Array<{ id: string; name: string; status: string; branches: number }>

  return (
    <div className="space-y-3">
      <FieldGroup label="العنوان الفرعي (Eyebrow)">
        <Input value={(data.eyebrow as string) ?? ''} onChange={(e) => onChange({ ...data, eyebrow: e.target.value })} className="h-9 text-sm" />
      </FieldGroup>
      <FieldGroup label="العنوان الرئيسي">
        <Input value={(data.heading as string) ?? ''} onChange={(e) => onChange({ ...data, heading: e.target.value })} className="h-9 text-sm" />
      </FieldGroup>
      <FieldGroup label="النص التعريفي">
        <Textarea value={(data.description as string) ?? ''} onChange={(e) => onChange({ ...data, description: e.target.value })} className="min-h-20 resize-y text-sm" />
      </FieldGroup>

      <div className="border-t border-[#E5E7EB] pt-3 space-y-3">
        <FieldGroup label="العنوان الفرعي للخريطة">
          <Input value={(data.mapEyebrow as string) ?? ''} onChange={(e) => onChange({ ...data, mapEyebrow: e.target.value })} className="h-9 text-sm" />
        </FieldGroup>
        <FieldGroup label="عنوان الخريطة">
          <Input value={(data.mapHeading as string) ?? ''} onChange={(e) => onChange({ ...data, mapHeading: e.target.value })} className="h-9 text-sm" />
        </FieldGroup>
        <FieldGroup label="وصف الخريطة">
          <Textarea value={(data.mapDescription as string) ?? ''} onChange={(e) => onChange({ ...data, mapDescription: e.target.value })} className="min-h-16 resize-y text-sm" />
        </FieldGroup>
      </div>

      <div className="border-t border-[#E5E7EB] pt-3 space-y-3">
        <SectionLabel>نصوص دليل الألوان</SectionLabel>
        <FieldGroup label="عنوان الدليل">
          <Input value={(data.legendTitle as string) ?? ''} onChange={(e) => onChange({ ...data, legendTitle: e.target.value })} className="h-9 text-sm" />
        </FieldGroup>
        <FieldGroup label="شرح الدليل">
          <Input value={(data.legendSub as string) ?? ''} onChange={(e) => onChange({ ...data, legendSub: e.target.value })} className="h-9 text-sm" />
        </FieldGroup>
        <FieldGroup label="نص فروع نشطة">
          <Input value={(data.legendActive as string) ?? ''} onChange={(e) => onChange({ ...data, legendActive: e.target.value })} className="h-9 text-sm" />
        </FieldGroup>
        <FieldGroup label="نص فروع مرتقبة">
          <Input value={(data.legendUpcoming as string) ?? ''} onChange={(e) => onChange({ ...data, legendUpcoming: e.target.value })} className="h-9 text-sm" />
        </FieldGroup>
        <FieldGroup label="نص توسع مستقبلي">
          <Input value={(data.legendFuture as string) ?? ''} onChange={(e) => onChange({ ...data, legendFuture: e.target.value })} className="h-9 text-sm" />
        </FieldGroup>
        <FieldGroup label="نص التفاصيل الفارغة">
          <Input value={(data.emptyDetail as string) ?? ''} onChange={(e) => onChange({ ...data, emptyDetail: e.target.value })} className="h-9 text-sm" />
        </FieldGroup>
      </div>

      <div className="space-y-2">
        <SectionLabel>الجهات</SectionLabel>
        {regions.map((r, i) => (
          <RepeaterItem key={r.id || i} onDelete={() => onChange({ ...data, regions: regions.filter((_, j) => j !== i) })}>
            <div className="space-y-1.5 pr-5">
              <div className="flex gap-2">
                <Input value={r.id} onChange={(e) => onChange({ ...data, regions: regions.map((x, j) => (j === i ? { ...x, id: e.target.value } : x)) })} placeholder="الرمز" className="h-8 w-20 text-sm" />
                <Input value={r.name} onChange={(e) => onChange({ ...data, regions: regions.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)) })} placeholder="الاسم" className="h-8 flex-1 text-sm" />
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
        <Button type="button" variant="outline" size="sm" onClick={() => onChange({ ...data, regions: [...regions, { id: '', name: '', status: 'future', branches: 0 }] })}>
          <Plus className="size-3.5" /> إضافة جهة
        </Button>
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
  newsGrid: NewsGridEditor,
  footer: FooterEditor,
  nationalVision: NationalVisionEditor,
  mission: MissionEditor,
  values: ValuesEditor,
  centralOffice: CentralOfficeEditor,
  expansionMap: ExpansionMapEditor,
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
