import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowRight,
  Eye,
  ImageIcon,
  Loader2,
  Plus,
  Save,
  Trash2,
  Upload,
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { supabase } from '@/lib/supabase'
import {
  getPage,
  getPageSections,
  updatePage,
  type PageRow,
  type SectionRow,
} from '@/services/pages.service'

/* ──────────────────────────────────────────────
   Types for each section's content shape
   ────────────────────────────────────────────── */

interface HeroContent {
  heading: string
  subheading: string
  description: string
  primaryButtonText: string
  primaryButtonUrl: string
  secondaryButtonText: string
  secondaryButtonUrl: string
  badge: string
  backgroundImage: string
  overlayOpacity: number
}

interface StatItem {
  id: string
  icon: string
  number: string
  suffix: string
  label: string
}

interface StatsContent {
  heading: string
  description: string
  stats: StatItem[]
}

interface AboutContent {
  heading: string
  subheading: string
  body: string
  buttonText: string
  buttonUrl: string
  image: string
}

interface CardItem {
  id: string
  icon: string
  title: string
  description: string
  link: string
  image?: string
}

interface CardGroupContent {
  heading: string
  subheading: string
  cards: CardItem[]
}

interface PartnerItem {
  id: string
  name: string
  logo: string
  website: string
}

interface PartnersContent {
  heading: string
  partners: PartnerItem[]
}

interface CTAContent {
  heading: string
  description: string
  buttonText: string
  buttonUrl: string
  image: string
}

interface NewsContent {
  heading: string
  subheading: string
  postsCount: number
}

/* ──────────────────────────────────────────────
   Section definitions for the Home page
   ────────────────────────────────────────────── */

const HOME_SECTIONS = [
  { key: 'hero',      label: 'القسم الرئيسي',       icon: '🏠' },
  { key: 'statistics',label: 'الإحصائيات',           icon: '📊' },
  { key: 'about',     label: 'من نحن',               icon: '👥' },
  { key: 'features',  label: 'المميزات',             icon: '⭐' },
  { key: 'activities',label: 'الأنشطة',              icon: '🎯' },
  { key: 'partners',  label: 'الشركاء',              icon: '🤝' },
  { key: 'cta',       label: 'دعوة للإجراء',          icon: '📞' },
  { key: 'news',      label: 'آخر الأخبار',           icon: '📰' },
  { key: 'seo',       label: 'تحسين البحث',           icon: '🔍' },
] as const

/* ──────────────────────────────────────────────
   Helper: upload an image via Supabase storage
   ────────────────────────────────────────────── */

function uploadViaPicker(sectionId: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return reject('No file')
      const path = `pages/home/${sectionId}/${Date.now()}-${file.name}`
      const { error } = await supabase.storage.from('cms-images').upload(path, file, { upsert: true })
      if (error) return reject(error)
      const { data } = supabase.storage.from('cms-images').getPublicUrl(path)
      resolve(data.publicUrl)
    }
    input.click()
  })
}

/* ──────────────────────────────────────────────
   Section Editor: Hero
   ────────────────────────────────────────────── */

function HeroEditor({ section, onRefresh }: { section: SectionRow; onRefresh: () => void }) {
  const content = (section.content ?? {}) as Record<string, unknown>
  const [data, setData] = useState<HeroContent>({
    heading: (content.heading as string) ?? '',
    subheading: (content.subheading as string) ?? '',
    description: (content.description as string) ?? '',
    primaryButtonText: (content.primaryButtonText as string) ?? '',
    primaryButtonUrl: (content.primaryButtonUrl as string) ?? '',
    secondaryButtonText: (content.secondaryButtonText as string) ?? '',
    secondaryButtonUrl: (content.secondaryButtonUrl as string) ?? '',
    badge: (content.badge as string) ?? '',
    backgroundImage: (content.backgroundImage as string) ?? '',
    overlayOpacity: (content.overlayOpacity as number) ?? 50,
  })

  // Re-sync state when section content changes (e.g., after Supabase fetch)
  useEffect(() => {
    const c = section.content ?? {}
    setData({
      heading: (c.heading as string) ?? '',
      subheading: (c.subheading as string) ?? '',
      description: (c.description as string) ?? '',
      primaryButtonText: (c.primaryButtonText as string) ?? '',
      primaryButtonUrl: (c.primaryButtonUrl as string) ?? '',
      secondaryButtonText: (c.secondaryButtonText as string) ?? '',
      secondaryButtonUrl: (c.secondaryButtonUrl as string) ?? '',
      badge: (c.badge as string) ?? '',
      backgroundImage: (c.backgroundImage as string) ?? '',
      overlayOpacity: (c.overlayOpacity as number) ?? 50,
    })
  }, [section.id, section.content])
  const [saving, setSaving] = useState(false)

  const update = (f: keyof HeroContent, v: unknown) => setData((p) => ({ ...p, [f]: v }))

  const save = async () => {
    setSaving(true)
    await supabase.from('page_sections').update({ content: data }).eq('id', section.id)
    setSaving(false)
    toast.success('تم حفظ القسم الرئيسي')
    onRefresh()
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2"><Label>العنوان الرئيسي</Label><Input value={data.heading} onChange={(e) => update('heading', e.target.value)} /></div>
        <div><Label>العنوان الفرعي</Label><Input value={data.subheading} onChange={(e) => update('subheading', e.target.value)} /></div>
        <div><Label>الشارة (Badge)</Label><Input value={data.badge} onChange={(e) => update('badge', e.target.value)} /></div>
        <div className="sm:col-span-2"><Label>الوصف</Label><Textarea value={data.description} onChange={(e) => update('description', e.target.value)} rows={2} /></div>
      </div>

      <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
        <Label className="mb-2 block text-xs">الزر الأساسي</Label>
        <div className="grid gap-2 sm:grid-cols-2">
          <Input className="h-8" value={data.primaryButtonText} onChange={(e) => update('primaryButtonText', e.target.value)} placeholder="النص" />
          <Input className="h-8" value={data.primaryButtonUrl} onChange={(e) => update('primaryButtonUrl', e.target.value)} placeholder="الرابط" />
        </div>
      </div>

      <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
        <Label className="mb-2 block text-xs">الزر الثانوي</Label>
        <div className="grid gap-2 sm:grid-cols-2">
          <Input className="h-8" value={data.secondaryButtonText} onChange={(e) => update('secondaryButtonText', e.target.value)} placeholder="النص" />
          <Input className="h-8" value={data.secondaryButtonUrl} onChange={(e) => update('secondaryButtonUrl', e.target.value)} placeholder="الرابط" />
        </div>
      </div>

      <div>
        <Label>صورة الخلفية</Label>
        <div className="mt-1 flex gap-2">
          <Input value={data.backgroundImage} onChange={(e) => update('backgroundImage', e.target.value)} className="flex-1" placeholder="https://..." />
          <Button variant="outline" size="sm" onClick={async () => { const url = await uploadViaPicker(section.id); update('backgroundImage', url) }}>
            <Upload className="size-3" />
          </Button>
        </div>
        {data.backgroundImage && <img src={data.backgroundImage} className="mt-2 h-20 w-full rounded-md object-cover" alt="" />}
      </div>

      <div>
        <Label>شفافية الطبقة ({data.overlayOpacity}%)</Label>
        <input type="range" min="0" max="100" value={data.overlayOpacity} onChange={(e) => update('overlayOpacity', Number(e.target.value))} className="mt-1 w-full" />
      </div>

      <div className="flex justify-end"><Button onClick={save} disabled={saving} size="sm"><Save className="size-4" /> حفظ القسم الرئيسي</Button></div>
    </div>
  )
}

/* ──────────────────────────────────────────────
   Section Editor: Statistics
   ────────────────────────────────────────────── */

function StatsEditor({ section, onRefresh }: { section: SectionRow; onRefresh: () => void }) {
  const c = (section.content ?? {}) as Record<string, unknown>
  const [data, setData] = useState<StatsContent>({
    heading: (c.heading as string) ?? '',
    description: (c.description as string) ?? '',
    stats: (c.stats as StatItem[]) ?? [],
  })

  useEffect(() => {
    const ct = section.content ?? {}
    setData({
      heading: (ct.heading as string) ?? '',
      description: (ct.description as string) ?? '',
      stats: (ct.stats as StatItem[]) ?? [],
    })
  }, [section.id, section.content])
  const [saving, setSaving] = useState(false)

  const add = () => setData((p) => ({ ...p, stats: [...p.stats, { id: crypto.randomUUID(), icon: '📊', number: '0', suffix: '', label: '' }] }))
  const remove = (i: number) => setData((p) => ({ ...p, stats: p.stats.filter((_, j) => j !== i) }))
  const move = (i: number, dir: number) => {
    const s = [...data.stats]; const t = i + dir
    if (t < 0 || t >= s.length) return; [s[i], s[t]] = [s[t], s[i]]; setData((p) => ({ ...p, stats: s }))
  }
  const upd = (i: number, f: string, v: string) => {
    const s = [...data.stats]; s[i] = { ...s[i], [f]: v }; setData((p) => ({ ...p, stats: s }))
  }

  const save = async () => {
    setSaving(true)
    await supabase.from('page_sections').update({ content: data }).eq('id', section.id)
    setSaving(false); toast.success('تم حفظ الإحصائيات'); onRefresh()
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div><Label>العنوان</Label><Input value={data.heading} onChange={(e) => setData((p) => ({ ...p, heading: e.target.value }))} /></div>
        <div><Label>الوصف</Label><Input value={data.description} onChange={(e) => setData((p) => ({ ...p, description: e.target.value }))} /></div>
      </div>
      {data.stats.map((s, i) => (
        <div key={s.id} className="flex items-start gap-2 rounded-lg border border-border/60 bg-card p-3">
          <span className="mt-1.5 text-xs text-muted-foreground">{i + 1}.</span>
          <div className="grid flex-1 gap-1 sm:grid-cols-4">
            <Input className="h-8" value={s.icon} onChange={(e) => upd(i, 'icon', e.target.value)} placeholder="أيقونة" />
            <Input className="h-8" value={s.number} onChange={(e) => upd(i, 'number', e.target.value)} placeholder="الرقم" />
            <Input className="h-8" value={s.suffix} onChange={(e) => upd(i, 'suffix', e.target.value)} placeholder="لاحقة" />
            <Input className="h-8" value={s.label} onChange={(e) => upd(i, 'label', e.target.value)} placeholder="العنوان" />
          </div>
          <div className="flex flex-col gap-0.5">
            <Button variant="ghost" size="icon-xs" className="size-6" onClick={() => move(i, -1)} disabled={i === 0}>▲</Button>
            <Button variant="ghost" size="icon-xs" className="size-6 text-destructive" onClick={() => remove(i)}><Trash2 className="size-2.5" /></Button>
          </div>
        </div>
      ))}
      <Button variant="outline" size="sm" className="w-full" onClick={add}><Plus className="size-4" /> إضافة إحصائية</Button>
      <div className="flex justify-end"><Button onClick={save} disabled={saving} size="sm"><Save className="size-4" /> حفظ الإحصائيات</Button></div>
    </div>
  )
}

/* ──────────────────────────────────────────────
   Section Editor: About
   ────────────────────────────────────────────── */

function AboutEditor({ section, onRefresh }: { section: SectionRow; onRefresh: () => void }) {
  const c = (section.content ?? {}) as Record<string, unknown>
  const [data, setData] = useState<AboutContent>({
    heading: (c.heading as string) ?? '',
    subheading: (c.subheading as string) ?? '',
    body: (c.body as string) ?? '',
    buttonText: (c.buttonText as string) ?? '',
    buttonUrl: (c.buttonUrl as string) ?? '',
    image: (c.image as string) ?? '',
  })

  useEffect(() => {
    const ct = section.content ?? {}
    setData({
      heading: (ct.heading as string) ?? '',
      subheading: (ct.subheading as string) ?? '',
      body: (ct.body as string) ?? '',
      buttonText: (ct.buttonText as string) ?? '',
      buttonUrl: (ct.buttonUrl as string) ?? '',
      image: (ct.image as string) ?? '',
    })
  }, [section.id, section.content])
  const [saving, setSaving] = useState(false)

  const update = (f: keyof AboutContent, v: string) => setData((p) => ({ ...p, [f]: v }))

  const save = async () => {
    setSaving(true)
    await supabase.from('page_sections').update({ content: data }).eq('id', section.id)
    setSaving(false); toast.success('تم حفظ قسم من نحن'); onRefresh()
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div><Label>العنوان</Label><Input value={data.heading} onChange={(e) => update('heading', e.target.value)} /></div>
        <div><Label>العنوان الفرعي</Label><Input value={data.subheading} onChange={(e) => update('subheading', e.target.value)} /></div>
      </div>
      <div><Label>المحتوى</Label><Textarea value={data.body} onChange={(e) => update('body', e.target.value)} rows={4} /></div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div><Label>نص الزر</Label><Input value={data.buttonText} onChange={(e) => update('buttonText', e.target.value)} /></div>
        <div><Label>رابط الزر</Label><Input value={data.buttonUrl} onChange={(e) => update('buttonUrl', e.target.value)} /></div>
      </div>
      <div>
        <Label>الصورة</Label>
        <div className="mt-1 flex gap-2">
          <Input value={data.image} onChange={(e) => update('image', e.target.value)} className="flex-1" placeholder="https://..." />
          <Button variant="outline" size="sm" onClick={async () => { const url = await uploadViaPicker(section.id); update('image', url) }}><Upload className="size-3" /></Button>
        </div>
        {data.image ? <img src={data.image} className="mt-2 h-32 w-full rounded-md object-cover" alt="" /> : <div className="mt-2 flex h-20 items-center justify-center rounded-md border border-dashed border-border bg-muted/20"><ImageIcon className="size-6 text-muted-foreground/30" /></div>}
      </div>
      <div className="flex justify-end"><Button onClick={save} disabled={saving} size="sm"><Save className="size-4" /> حفظ من نحن</Button></div>
    </div>
  )
}

/* ──────────────────────────────────────────────
   Section Editor: Card Group (Features / Activities)
   ────────────────────────────────────────────── */

function CardGroupEditor({ section, onRefresh, showImage }: { section: SectionRow; onRefresh: () => void; showImage?: boolean }) {
  const c = (section.content ?? {}) as Record<string, unknown>
  const [data, setData] = useState<CardGroupContent>({
    heading: (c.heading as string) ?? '',
    subheading: (c.subheading as string) ?? '',
    cards: (c.cards as CardItem[]) ?? [],
  })

  useEffect(() => {
    const ct = section.content ?? {}
    setData({
      heading: (ct.heading as string) ?? '',
      subheading: (ct.subheading as string) ?? '',
      cards: (ct.cards as CardItem[]) ?? [],
    })
  }, [section.id, section.content])
  const [saving, setSaving] = useState(false)

  const add = () => setData((p) => ({ ...p, cards: [...p.cards, { id: crypto.randomUUID(), icon: '⭐', title: '', description: '', link: '' }] }))
  const remove = (i: number) => setData((p) => ({ ...p, cards: p.cards.filter((_, j) => j !== i) }))
  const move = (i: number, dir: number) => {
    const arr = [...data.cards]; const t = i + dir
    if (t < 0 || t >= arr.length) return; [arr[i], arr[t]] = [arr[t], arr[i]]; setData((p) => ({ ...p, cards: arr }))
  }
  const upd = (i: number, f: string, v: string) => {
    const arr = [...data.cards]; arr[i] = { ...arr[i], [f]: v }; setData((p) => ({ ...p, cards: arr }))
  }

  const save = async () => {
    setSaving(true)
    await supabase.from('page_sections').update({ content: data }).eq('id', section.id)
    setSaving(false); toast.success('تم حفظ البطاقات'); onRefresh()
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div><Label>العنوان</Label><Input value={data.heading} onChange={(e) => setData((p) => ({ ...p, heading: e.target.value }))} /></div>
        <div><Label>العنوان الفرعي</Label><Input value={data.subheading} onChange={(e) => setData((p) => ({ ...p, subheading: e.target.value }))} /></div>
      </div>
      {data.cards.map((card, i) => (
        <div key={card.id} className="rounded-xl border border-border/60 bg-card p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">بطاقة {i + 1}</span>
            <div className="flex gap-0.5">
              <Button variant="ghost" size="icon-xs" className="size-6" onClick={() => move(i, -1)} disabled={i === 0}>▲</Button>
              <Button variant="ghost" size="icon-xs" className="size-6" onClick={() => move(i, 1)} disabled={i === data.cards.length - 1}>▼</Button>
              <Button variant="ghost" size="icon-xs" className="size-6 text-destructive" onClick={() => remove(i)}><Trash2 className="size-2.5" /></Button>
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <div><Label className="text-xs">الأيقونة</Label><Input className="h-8" value={card.icon} onChange={(e) => upd(i, 'icon', e.target.value)} /></div>
            <div><Label className="text-xs">العنوان</Label><Input className="h-8" value={card.title} onChange={(e) => upd(i, 'title', e.target.value)} /></div>
            <div className="sm:col-span-2"><Label className="text-xs">الوصف</Label><Textarea className="min-h-[50px] text-xs" value={card.description} onChange={(e) => upd(i, 'description', e.target.value)} /></div>
            <div><Label className="text-xs">الرابط</Label><Input className="h-8" value={card.link} onChange={(e) => upd(i, 'link', e.target.value)} /></div>
            {showImage && (
              <div>
                <Label className="text-xs">الصورة</Label>
                <div className="flex gap-1">
                  <Input className="h-8 flex-1" value={card.image ?? ''} onChange={(e) => upd(i, 'image', e.target.value)} placeholder="رابط الصورة" />
                  <Button variant="outline" size="icon-xs" className="shrink-0" onClick={async () => { const url = await uploadViaPicker(section.id); upd(i, 'image', url) }}><Upload className="size-2.5" /></Button>
                </div>
              </div>
            )}
          </div>
          {showImage && card.image && <img src={card.image} className="mt-2 h-20 w-full rounded-md object-cover" alt="" />}
        </div>
      ))}
      <Button variant="outline" size="sm" className="w-full" onClick={add}><Plus className="size-4" /> إضافة بطاقة</Button>
      <div className="flex justify-end"><Button onClick={save} disabled={saving} size="sm"><Save className="size-4" /> حفظ البطاقات</Button></div>
    </div>
  )
}

/* ──────────────────────────────────────────────
   Section Editor: Partners
   ────────────────────────────────────────────── */

function PartnersEditor({ section, onRefresh }: { section: SectionRow; onRefresh: () => void }) {
  const c = (section.content ?? {}) as Record<string, unknown>
  const [data, setData] = useState<PartnersContent>({
    heading: (c.heading as string) ?? '',
    partners: (c.partners as PartnerItem[]) ?? [],
  })

  useEffect(() => {
    const ct = section.content ?? {}
    setData({
      heading: (ct.heading as string) ?? '',
      partners: (ct.partners as PartnerItem[]) ?? [],
    })
  }, [section.id, section.content])
  const [saving, setSaving] = useState(false)

  const add = () => setData((p) => ({ ...p, partners: [...p.partners, { id: crypto.randomUUID(), name: '', logo: '', website: '' }] }))
  const remove = (i: number) => setData((p) => ({ ...p, partners: p.partners.filter((_, j) => j !== i) }))
  const upd = (i: number, f: string, v: string) => {
    const arr = [...data.partners]; arr[i] = { ...arr[i], [f]: v }; setData((p) => ({ ...p, partners: arr }))
  }

  const save = async () => {
    setSaving(true)
    await supabase.from('page_sections').update({ content: data }).eq('id', section.id)
    setSaving(false); toast.success('تم حفظ الشركاء'); onRefresh()
  }

  return (
    <div className="space-y-4">
      <div><Label>العنوان</Label><Input value={data.heading} onChange={(e) => setData((p) => ({ ...p, heading: e.target.value }))} /></div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {data.partners.map((p, i) => (
          <div key={p.id} className="space-y-2 rounded-xl border border-border/60 bg-card p-3">
            {p.logo ? <img src={p.logo} className="h-20 w-full rounded-lg object-contain bg-muted/20" alt="" /> : <div className="flex h-20 items-center justify-center rounded-lg border border-dashed border-border bg-muted/20"><ImageIcon className="size-6 text-muted-foreground/30" /></div>}
            <Input className="h-8 text-xs" value={p.name} onChange={(e) => upd(i, 'name', e.target.value)} placeholder="اسم الشريك" />
            <Input className="h-8 text-xs" value={p.website} onChange={(e) => upd(i, 'website', e.target.value)} placeholder="الموقع" />
            <div className="flex gap-1">
              <Button variant="outline" size="xs" className="flex-1" onClick={async () => { const url = await uploadViaPicker(section.id); upd(i, 'logo', url) }}><Upload className="size-3" /> شعار</Button>
              <Button variant="ghost" size="icon-xs" className="text-destructive" onClick={() => remove(i)}><Trash2 className="size-3" /></Button>
            </div>
          </div>
        ))}
      </div>
      <Button variant="outline" size="sm" className="w-full" onClick={add}><Plus className="size-4" /> إضافة شريك</Button>
      <div className="flex justify-end"><Button onClick={save} disabled={saving} size="sm"><Save className="size-4" /> حفظ الشركاء</Button></div>
    </div>
  )
}

/* ──────────────────────────────────────────────
   Section Editor: CTA
   ────────────────────────────────────────────── */

function CTAEditor({ section, onRefresh }: { section: SectionRow; onRefresh: () => void }) {
  const c = (section.content ?? {}) as Record<string, unknown>
  const [data, setData] = useState<CTAContent>({
    heading: (c.heading as string) ?? '',
    description: (c.description as string) ?? '',
    buttonText: (c.buttonText as string) ?? '',
    buttonUrl: (c.buttonUrl as string) ?? '',
    image: (c.image as string) ?? '',
  })

  useEffect(() => {
    const ct = section.content ?? {}
    setData({
      heading: (ct.heading as string) ?? '',
      description: (ct.description as string) ?? '',
      buttonText: (ct.buttonText as string) ?? '',
      buttonUrl: (ct.buttonUrl as string) ?? '',
      image: (ct.image as string) ?? '',
    })
  }, [section.id, section.content])
  const [saving, setSaving] = useState(false)

  const update = (f: keyof CTAContent, v: string) => setData((p) => ({ ...p, [f]: v }))

  const save = async () => {
    setSaving(true)
    await supabase.from('page_sections').update({ content: data }).eq('id', section.id)
    setSaving(false); toast.success('تم حفظ دعوة الإجراء'); onRefresh()
  }

  return (
    <div className="space-y-4">
      <div><Label>العنوان</Label><Input value={data.heading} onChange={(e) => update('heading', e.target.value)} /></div>
      <div><Label>الوصف</Label><Textarea value={data.description} onChange={(e) => update('description', e.target.value)} rows={2} /></div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div><Label>نص الزر</Label><Input value={data.buttonText} onChange={(e) => update('buttonText', e.target.value)} /></div>
        <div><Label>رابط الزر</Label><Input value={data.buttonUrl} onChange={(e) => update('buttonUrl', e.target.value)} /></div>
      </div>
      <div>
        <Label>الصورة</Label>
        <div className="mt-1 flex gap-2">
          <Input value={data.image} onChange={(e) => update('image', e.target.value)} className="flex-1" placeholder="https://..." />
          <Button variant="outline" size="sm" onClick={async () => { const url = await uploadViaPicker(section.id); update('image', url) }}><Upload className="size-3" /></Button>
        </div>
      </div>
      <div className="flex justify-end"><Button onClick={save} disabled={saving} size="sm"><Save className="size-4" /> حفظ القسم</Button></div>
    </div>
  )
}

/* ──────────────────────────────────────────────
   Section Editor: News
   ────────────────────────────────────────────── */

function NewsEditor({ section, onRefresh }: { section: SectionRow; onRefresh: () => void }) {
  const c = (section.content ?? {}) as Record<string, unknown>
  const [data, setData] = useState<NewsContent>({
    heading: (c.heading as string) ?? '',
    subheading: (c.subheading as string) ?? '',
    postsCount: (c.postsCount as number) ?? 3,
  })

  useEffect(() => {
    const ct = section.content ?? {}
    setData({
      heading: (ct.heading as string) ?? '',
      subheading: (ct.subheading as string) ?? '',
      postsCount: (ct.postsCount as number) ?? 3,
    })
  }, [section.id, section.content])
  const [saving, setSaving] = useState(false)

  const save = async () => {
    setSaving(true)
    await supabase.from('page_sections').update({ content: data }).eq('id', section.id)
    setSaving(false); toast.success('تم حفظ إعدادات الأخبار'); onRefresh()
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div><Label>العنوان</Label><Input value={data.heading} onChange={(e) => setData((p) => ({ ...p, heading: e.target.value }))} /></div>
        <div><Label>العنوان الفرعي</Label><Input value={data.subheading} onChange={(e) => setData((p) => ({ ...p, subheading: e.target.value }))} /></div>
      </div>
      <div><Label>عدد المنشورات المعروضة</Label><Input type="number" value={data.postsCount} onChange={(e) => setData((p) => ({ ...p, postsCount: Number(e.target.value) || 3 }))} /></div>
      <div className="flex justify-end"><Button onClick={save} disabled={saving} size="sm"><Save className="size-4" /> حفظ</Button></div>
    </div>
  )
}

/* ──────────────────────────────────────────────
   Section Editor: SEO
   ────────────────────────────────────────────── */

function SEOEditor({ page, onRefresh }: { page: PageRow; onRefresh: () => void }) {
  const [data, setData] = useState({
    seo_title: page.seo_title ?? '',
    seo_description: page.seo_description ?? '',
    seo_keywords: page.seo_keywords ?? '',
    og_image: page.og_image ?? '',
    canonical_url: page.canonical_url ?? '',
  })

  useEffect(() => {
    setData({
      seo_title: page.seo_title ?? '',
      seo_description: page.seo_description ?? '',
      seo_keywords: page.seo_keywords ?? '',
      og_image: page.og_image ?? '',
      canonical_url: page.canonical_url ?? '',
    })
  }, [page.id, page.seo_title, page.seo_description, page.seo_keywords, page.og_image, page.canonical_url])
  const [saving, setSaving] = useState(false)

  const upd = (f: string, v: string) => setData((p) => ({ ...p, [f]: v }))

  const save = async () => {
    setSaving(true)
    await updatePage(page.id, data)
    setSaving(false); toast.success('تم حفظ SEO'); onRefresh()
  }

  return (
    <div className="space-y-4">
      <div><Label>Meta Title</Label><Input value={data.seo_title} onChange={(e) => upd('seo_title', e.target.value)} /></div>
      <div><Label>Meta Description</Label><Textarea value={data.seo_description} onChange={(e) => upd('seo_description', e.target.value)} rows={2} /></div>
      <div><Label>الكلمات المفتاحية</Label><Input value={data.seo_keywords} onChange={(e) => upd('seo_keywords', e.target.value)} /></div>
      <div><Label>Open Graph Image</Label><Input value={data.og_image} onChange={(e) => upd('og_image', e.target.value)} /></div>
      <div><Label>Canonical URL</Label><Input value={data.canonical_url} onChange={(e) => upd('canonical_url', e.target.value)} /></div>
      <div className="flex justify-end"><Button onClick={save} disabled={saving} size="sm"><Save className="size-4" /> حفظ SEO</Button></div>
    </div>
  )
}

/* ──────────────────────────────────────────────
   Main HomePageEditor component
   ────────────────────────────────────────────── */

export default function HomePageEditor() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [page, setPage] = useState<PageRow | null>(null)
  const [sections, setSections] = useState<SectionRow[]>([])
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['hero']))
  const [loading, setLoading] = useState(true)

  const fetchAll = useCallback(async () => {
    if (!id) return
    setLoading(true)
    const [p, s] = await Promise.all([getPage(id), getPageSections(id)])
    if (!p) { toast.error('الصفحة غير موجودة'); navigate('/pages'); return }
    setPage(p)
    setSections(s)
    setLoading(false)
  }, [id, navigate])

  useEffect(() => { fetchAll() }, [fetchAll])

  const toggle = (key: string) => setExpanded((prev) => {
    const next = new Set(prev)
    if (next.has(key)) next.delete(key); else next.add(key)
    return next
  })

  const getSection = (key: string) => sections.find((s) => s.section_key === key)

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="size-8 animate-spin text-muted-foreground" /></div>
  if (!page) return <div className="flex h-64 items-center justify-center"><p className="text-muted-foreground">الصفحة غير موجودة</p></div>

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon-sm" onClick={() => navigate('/pages')}><ArrowRight className="size-4" /></Button>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">تحرير الصفحة الرئيسية</h2>
            <p className="text-sm text-muted-foreground">{page.slug}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => setExpanded(new Set(HOME_SECTIONS.map((s) => s.key)))}>توسيع الكل</Button>
          <Button variant="ghost" size="sm" onClick={() => setExpanded(new Set())}>طي الكل</Button>
          <Button variant="outline" size="sm" onClick={() => window.open(page.slug, '_blank')}><Eye className="size-4" /> معاينة</Button>
        </div>
      </div>

      <div className="space-y-3">
        {HOME_SECTIONS.map(({ key, label, icon }) => {
          const sec = getSection(key)
          const isOpen = expanded.has(key)

          return (
            <Card key={key} className="border-border/60">
              <button onClick={() => toggle(key)} className="flex w-full items-center gap-3 px-5 py-4 text-right hover:bg-muted/30">
                <span className="text-xl">{icon}</span>
                <span className="flex-1 text-sm font-medium">{label}</span>
                <span className={`text-xs text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`}>▼</span>
              </button>

              {isOpen && sec && (
                <div className="border-t border-border/40 px-5 py-4" key={sec.id + '-' + JSON.stringify(sec.content)}>
                  {key === 'hero' && <HeroEditor section={sec} onRefresh={fetchAll} />}
                  {key === 'statistics' && <StatsEditor section={sec} onRefresh={fetchAll} />}
                  {key === 'about' && <AboutEditor section={sec} onRefresh={fetchAll} />}
                  {key === 'features' && <CardGroupEditor section={sec} onRefresh={fetchAll} />}
                  {key === 'activities' && <CardGroupEditor section={sec} onRefresh={fetchAll} showImage />}
                  {key === 'partners' && <PartnersEditor section={sec} onRefresh={fetchAll} />}
                  {key === 'cta' && <CTAEditor section={sec} onRefresh={fetchAll} />}
                  {key === 'news' && <NewsEditor section={sec} onRefresh={fetchAll} />}
                  {key === 'seo' && <SEOEditor page={page} onRefresh={fetchAll} />}
                </div>
              )}

              {isOpen && !sec && key !== 'seo' && (
                <div className="border-t border-border/40 px-5 py-4">
                  <div className="py-8 text-center">
                    <p className="text-sm text-muted-foreground">هذا القسم غير موجود بعد. قم بتشغيل الترحيل SQL أولا.</p>
                  </div>
                </div>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
