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
import { cn } from '@/lib/utils'
import {
  getSettings,
  saveSettings,
  type AppSettings,
} from '@/services/settings.service'

interface SocialChannel {
  key: keyof Pick<
    AppSettings,
    | 'facebook_url'
    | 'instagram_url'
    | 'linkedin_url'
    | 'youtube_url'
    | 'tiktok_url'
    | 'whatsapp_url'
  >
  label: string
  tile: string
  tileClass: string
  placeholder: string
}

const channels: SocialChannel[] = [
  {
    key: 'facebook_url',
    label: 'Facebook',
    tile: 'f',
    tileClass: 'bg-[#1877F2] text-white',
    placeholder: 'https://facebook.com/amare',
  },
  {
    key: 'instagram_url',
    label: 'Instagram',
    tile: 'IG',
    tileClass:
      'bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white',
    placeholder: 'https://instagram.com/amare',
  },
  {
    key: 'linkedin_url',
    label: 'LinkedIn',
    tile: 'in',
    tileClass: 'bg-[#0A66C2] text-white',
    placeholder: 'https://linkedin.com/company/amare',
  },
  {
    key: 'youtube_url',
    label: 'YouTube',
    tile: 'YT',
    tileClass: 'bg-[#FF0000] text-white',
    placeholder: 'https://youtube.com/@amare',
  },
  {
    key: 'tiktok_url',
    label: 'TikTok',
    tile: 'TT',
    tileClass: 'bg-black text-white',
    placeholder: 'https://tiktok.com/@amare',
  },
  {
    key: 'whatsapp_url',
    label: 'WhatsApp',
    tile: 'WA',
    tileClass: 'bg-[#25D366] text-white',
    placeholder: 'https://wa.me/212...',
  },
]

export function SocialMedia() {
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
    const patch: Partial<AppSettings> = {}
    for (const ch of channels) {
      patch[ch.key] = settings[ch.key]
    }
    try {
      await saveSettings(patch)
      setSaved(true)
      toast.success('Links saved')
      setTimeout(() => setSaved(false), 2500)
    } catch {
      toast.error('Failed to save links')
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
        <CardTitle>Social Media</CardTitle>
        <CardDescription>
          Links shown in the website footer and contact page.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {channels.map(({ key, label, tile, tileClass, placeholder }) => (
          <div key={key} className="flex items-center gap-3">
            <span
              className={cn(
                'flex size-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold',
                tileClass,
              )}
            >
              {tile}
            </span>
            <div className="min-w-0 flex-1">
              <p className="mb-1.5 text-sm font-medium text-foreground">
                {label}
              </p>
              <Input
                value={settings?.[key] ?? ''}
                onChange={(e) => updateField(key, e.target.value)}
                placeholder={placeholder}
                className="text-xs"
              />
            </div>
          </div>
        ))}
      </CardContent>
      <CardFooter className="justify-between">
        <p className="text-xs text-muted-foreground">
          {saved ? 'Links saved' : 'Leave empty to hide a social icon'}
        </p>
        <Button type="button" onClick={handleSave} disabled={saving}>
          {saving ? (
            <Loader2 className="size-4 animate-spin" />
          ) : saved ? (
            <Check className="size-4" />
          ) : null}
          {saved ? 'Saved' : 'Save links'}
        </Button>
      </CardFooter>
    </Card>
  )
}
