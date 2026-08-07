import { useEffect, useState } from 'react'
import { Check, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  updateWebsiteSettings,
  type WebsiteSettings,
} from '@/services/settingsService'
import { useWebsiteSettingsContext } from '@/contexts/WebsiteSettingsContext'

export function GeneralSettings() {
  const { settings, loading, refresh } = useWebsiteSettingsContext()
  const [form, setForm] = useState<WebsiteSettings | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (settings) {
      setForm(settings)
    }
  }, [settings])

  const updateField = (field: keyof WebsiteSettings, value: string) => {
    setForm((prev) => (prev ? { ...prev, [field]: value } : prev))
    setSaved(false)
  }

  const handleSave = async () => {
    if (!form) return

    if (!form.association_name?.trim()) {
      toast.error('اسم الجمعية مطلوب')
      return
    }
    if (!form.contact_email?.trim()) {
      toast.error('البريد الإلكتروني مطلوب')
      return
    }

    setSaving(true)
    try {
      await updateWebsiteSettings({
        association_name: form.association_name.trim(),
        short_name: form.short_name?.trim() || null,
        contact_email: form.contact_email.trim(),
        phone: form.phone?.trim() || null,
        whatsapp: form.whatsapp?.trim() || null,
        address: form.address?.trim() || null,
        google_maps_url: form.google_maps_url?.trim() || null,
        working_hours: form.working_hours?.trim() || null,
      })
      setSaved(true)
      toast.success('تم حفظ الإعدادات')
      refresh()
      setTimeout(() => setSaved(false), 2500)
    } catch {
      toast.error('فشل حفظ الإعدادات')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex h-40 items-center justify-center">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>عام</CardTitle>
        <CardDescription>
          اسم الجمعية وتفاصيل الاتصال والعنوان وساعات العمل.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="general-association-name">اسم الجمعية</Label>
            <Input
              id="general-association-name"
              value={form?.association_name ?? ''}
              onChange={(e) => updateField('association_name', e.target.value)}
              placeholder="الجمعية المغربية..."
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="general-short-name">الاسم المختصر</Label>
            <Input
              id="general-short-name"
              value={form?.short_name ?? ''}
              onChange={(e) => updateField('short_name', e.target.value)}
              placeholder="AMARE"
            />
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="general-email">البريد الإلكتروني</Label>
            <Input
              id="general-email"
              type="email"
              value={form?.contact_email ?? ''}
              onChange={(e) => updateField('contact_email', e.target.value)}
              placeholder="contact@amare.ma"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="general-phone">رقم الهاتف</Label>
            <Input
              id="general-phone"
              type="tel"
              value={form?.phone ?? ''}
              onChange={(e) => updateField('phone', e.target.value)}
              placeholder="+212"
            />
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="general-whatsapp">رقم الواتساب</Label>
            <Input
              id="general-whatsapp"
              type="tel"
              value={form?.whatsapp ?? ''}
              onChange={(e) => updateField('whatsapp', e.target.value)}
              placeholder="+2126..."
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="general-hours">ساعات العمل</Label>
            <Input
              id="general-hours"
              value={form?.working_hours ?? ''}
              onChange={(e) => updateField('working_hours', e.target.value)}
              placeholder="الإثنين - الجمعة | 09:00 - 18:00"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="general-address">العنوان</Label>
          <Textarea
            id="general-address"
            value={form?.address ?? ''}
            onChange={(e) => updateField('address', e.target.value)}
            placeholder="المغرب"
            className="min-h-16"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="general-maps">رابط خرائط جوجل</Label>
          <Input
            id="general-maps"
            value={form?.google_maps_url ?? ''}
            onChange={(e) => updateField('google_maps_url', e.target.value)}
            placeholder="https://www.google.com/maps?q=..."
          />
        </div>
      </CardContent>
      <CardFooter className="justify-between">
        <p className="text-xs text-muted-foreground">
          {saved ? 'تم حفظ الإعدادات' : 'التغييرات تطبق على الموقع بالكامل'}
        </p>
        <Button type="button" onClick={handleSave} disabled={saving}>
          {saving ? (
            <Loader2 className="size-4 animate-spin" />
          ) : saved ? (
            <Check className="size-4" />
          ) : null}
          {saved ? 'تم الحفظ' : 'حفظ التغييرات'}
        </Button>
      </CardFooter>
    </Card>
  )
}
