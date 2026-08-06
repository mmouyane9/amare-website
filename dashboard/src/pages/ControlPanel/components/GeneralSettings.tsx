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
      toast.error('Association Name is required')
      return
    }
    if (!form.contact_email?.trim()) {
      toast.error('Contact Email is required')
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
      toast.success('Settings saved')
      refresh()
      setTimeout(() => setSaved(false), 2500)
    } catch {
      toast.error('Failed to save settings')
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
        <CardTitle>General</CardTitle>
        <CardDescription>
          Association name, contact details, address and working hours.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="general-association-name">Association Name</Label>
            <Input
              id="general-association-name"
              value={form?.association_name ?? ''}
              onChange={(e) => updateField('association_name', e.target.value)}
              placeholder="الجمعية المغربية..."
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="general-short-name">Short Name</Label>
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
            <Label htmlFor="general-email">Contact Email</Label>
            <Input
              id="general-email"
              type="email"
              value={form?.contact_email ?? ''}
              onChange={(e) => updateField('contact_email', e.target.value)}
              placeholder="contact@amare.ma"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="general-phone">Phone Number</Label>
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
            <Label htmlFor="general-whatsapp">WhatsApp Number</Label>
            <Input
              id="general-whatsapp"
              type="tel"
              value={form?.whatsapp ?? ''}
              onChange={(e) => updateField('whatsapp', e.target.value)}
              placeholder="+2126..."
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="general-hours">Working Hours</Label>
            <Input
              id="general-hours"
              value={form?.working_hours ?? ''}
              onChange={(e) => updateField('working_hours', e.target.value)}
              placeholder="الإثنين - الجمعة | 09:00 - 18:00"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="general-address">Address</Label>
          <Textarea
            id="general-address"
            value={form?.address ?? ''}
            onChange={(e) => updateField('address', e.target.value)}
            placeholder="Morocco"
            className="min-h-16"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="general-maps">Google Maps URL</Label>
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
          {saved ? 'Settings saved' : 'Changes apply to the whole website'}
        </p>
        <Button type="button" onClick={handleSave} disabled={saving}>
          {saving ? (
            <Loader2 className="size-4 animate-spin" />
          ) : saved ? (
            <Check className="size-4" />
          ) : null}
          {saved ? 'Saved' : 'Save changes'}
        </Button>
      </CardFooter>
    </Card>
  )
}
