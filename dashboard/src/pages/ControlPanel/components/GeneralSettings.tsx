import { useCallback, useEffect, useState } from 'react'
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
  getSettings,
  saveSettings,
  type AppSettings,
} from '@/services/settings.service'

export function GeneralSettings() {
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const loadSettings = useCallback(async () => {
    try {
      const data = await getSettings()
      setSettings(data)
    } catch {
      toast.error('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  const updateField = (field: keyof AppSettings, value: string) => {
    setSettings((prev) => (prev ? { ...prev, [field]: value } : prev))
    setSaved(false)
  }

  const handleSave = async () => {
    if (!settings) return
    setSaving(true)
    try {
      await saveSettings({
        association_name: settings.association_name,
        email: settings.email,
        phone: settings.phone,
        address: settings.address,
      })
      setSaved(true)
      toast.success('Settings saved')
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
          Association name, contact email, phone and address.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="general-name">Association Name</Label>
          <Input
            id="general-name"
            value={settings?.association_name ?? ''}
            onChange={(e) => updateField('association_name', e.target.value)}
            placeholder="AMARE"
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="general-email">Contact Email</Label>
            <Input
              id="general-email"
              type="email"
              value={settings?.email ?? ''}
              onChange={(e) => updateField('email', e.target.value)}
              placeholder="contact@amare.ma"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="general-phone">Phone</Label>
            <Input
              id="general-phone"
              type="tel"
              value={settings?.phone ?? ''}
              onChange={(e) => updateField('phone', e.target.value)}
              placeholder="+212"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="general-address">Address</Label>
          <Textarea
            id="general-address"
            value={settings?.address ?? ''}
            onChange={(e) => updateField('address', e.target.value)}
            placeholder="Morocco"
            className="min-h-16"
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
