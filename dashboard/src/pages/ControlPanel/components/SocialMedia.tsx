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
import { useWebsiteSettingsContext } from '@/contexts/WebsiteSettingsContext'
import { updateSocialMedia } from '@/services/settingsService'

interface SocialChannel {
  field: keyof SocialMediaPatch
  label: string
  icon: React.ReactNode
  bgClass: string
  placeholder: string
  urlPrefix: string
}

type SocialMediaPatch = {
  facebook: string | null
  instagram: string | null
  linkedin: string | null
  youtube: string | null
  tiktok: string | null
  twitter: string | null
  whatsapp_url: string | null
  telegram: string | null
}

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="size-4">
    <path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0 0 22 12z"/>
  </svg>
)

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4">
    <rect x="2" y="2" width="20" height="20" rx="5"/>
    <circle cx="12" cy="12" r="4"/>
    <circle cx="17.5" cy="6.5" r="1"/>
  </svg>
)

const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="size-4">
    <path d="M4.98 3.5C4.98 5 3.79 6.2 2.3 6.2 1 6.2 0 5 0 3.5 0 2 1.1.8 2.5.8s2.48 1.2 2.48 2.7zM.2 8.5h4.6V23H.2V8.5zM8 8.5h4.4v2h.06c.6-1.2 2.1-2.4 4.4-2.4 4.7 0 5.6 3.1 5.6 7.1V23h-4.6v-6.7c0-1.6 0-3.7-2.3-3.7s-2.6 1.8-2.6 3.6V23H8V8.5z"/>
  </svg>
)

const YouTubeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4">
    <rect x="2" y="5" width="20" height="14" rx="4"/>
    <path d="m10 9 5 3-5 3V9z" fill="currentColor" stroke="none"/>
  </svg>
)

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="size-4">
    <path d="M19.6 5.6A5.3 5.3 0 0 1 17 3.2V2h-4v15.4a3.2 3.2 0 1 1-2.2-3.1V10a7 7 0 1 0 5.8 6.9V8.2a9.1 9.1 0 0 0 5 1.5V5.6Z"/>
  </svg>
)

const TwitterIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="size-4">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
)

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="size-4">
    <path d="M17.5 14.4c-.3-.1-1.7-.9-2-1-.3-.1-.5-.1-.6.1-.2.3-.7 1-.9 1.2-.1.2-.3.2-.6.1-.3-.1-1.2-.5-2.3-1.5-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6.1-.1.3-.3.4-.5.1-.1.2-.3.2-.4.1-.2 0-.4 0-.5s-.6-1.5-.8-2c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.2s1 2.6 1.1 2.7c.1.2 2 3 4.7 4.2.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.5-.1 1.7-.7 2-1.4.2-.6.2-1.2.1-1.3-.1-.1-.3-.2-.6-.3z"/><path d="M12 2C6.5 2 2 6.5 2 12c0 1.8.5 3.6 1.4 5.1L2 22l5.1-1.3C8.5 21.5 10.2 22 12 22c5.5 0 10-4.5 10-10S17.5 2 12 2zm0 18c-1.6 0-3.1-.4-4.5-1.2l-.3-.2-3.3.9.9-3.2-.2-.3C3.7 14.6 3.2 13.3 3.2 12c0-4.9 3.9-8.8 8.8-8.8s8.8 3.9 8.8 8.8-3.9 8.8-8.8 8.8z"/>
  </svg>
)

const TelegramIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="size-4">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.87-1.25 4.79-2.08 5.76-2.48 2.74-1.14 3.31-1.34 3.68-1.34.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
  </svg>
)

const URL_PATTERNS: Record<string, RegExp> = {
  facebook: /^https:\/\/facebook\.com\//i,
  instagram: /^https:\/\/instagram\.com\//i,
  linkedin: /^https:\/\/linkedin\.com\//i,
  youtube: /^https:\/\/youtube\.com\//i,
  tiktok: /^https:\/\/tiktok\.com\//i,
  twitter: /^https:\/\/(x\.com|twitter\.com)\//i,
  whatsapp_url: /^https:\/\/wa\.me\//i,
  telegram: /^https:\/\/t\.me\//i,
}

function validateUrl(field: string, value: string): string | null {
  if (!value.trim()) return null
  if (!value.startsWith('https://')) return 'يجب أن يبدأ الرابط بـ https://'
  const pattern = URL_PATTERNS[field]
  if (pattern && !pattern.test(value)) return 'صيغة الرابط غير صحيحة لهذه المنصة'
  try {
    new URL(value)
  } catch {
    return 'الرابط غير صالح'
  }
  return null
}

const channels: SocialChannel[] = [
  {
    field: 'facebook',
    label: 'Facebook',
    icon: <FacebookIcon />,
    bgClass: 'bg-[#1877F2] text-white',
    placeholder: 'https://facebook.com/...',
    urlPrefix: 'https://facebook.com/',
  },
  {
    field: 'instagram',
    label: 'Instagram',
    icon: <InstagramIcon />,
    bgClass: 'bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white',
    placeholder: 'https://instagram.com/...',
    urlPrefix: 'https://instagram.com/',
  },
  {
    field: 'linkedin',
    label: 'LinkedIn',
    icon: <LinkedInIcon />,
    bgClass: 'bg-[#0A66C2] text-white',
    placeholder: 'https://linkedin.com/company/...',
    urlPrefix: 'https://linkedin.com/',
  },
  {
    field: 'youtube',
    label: 'YouTube',
    icon: <YouTubeIcon />,
    bgClass: 'bg-[#FF0000] text-white',
    placeholder: 'https://youtube.com/@...',
    urlPrefix: 'https://youtube.com/',
  },
  {
    field: 'tiktok',
    label: 'TikTok',
    icon: <TikTokIcon />,
    bgClass: 'bg-black text-white',
    placeholder: 'https://tiktok.com/@...',
    urlPrefix: 'https://tiktok.com/',
  },
  {
    field: 'twitter',
    label: 'X / Twitter',
    icon: <TwitterIcon />,
    bgClass: 'bg-black text-white',
    placeholder: 'https://x.com/...',
    urlPrefix: 'https://x.com/',
  },
  {
    field: 'whatsapp_url',
    label: 'WhatsApp',
    icon: <WhatsAppIcon />,
    bgClass: 'bg-[#25D366] text-white',
    placeholder: 'https://wa.me/212...',
    urlPrefix: 'https://wa.me/',
  },
  {
    field: 'telegram',
    label: 'Telegram',
    icon: <TelegramIcon />,
    bgClass: 'bg-[#0088cc] text-white',
    placeholder: 'https://t.me/...',
    urlPrefix: 'https://t.me/',
  },
]

export function SocialMedia() {
  const { settings, loading, error } = useWebsiteSettingsContext()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [formValues, setFormValues] = useState<Record<string, string>>({})
  const [errors, setErrors] = useState<Record<string, string | null>>({})

  useEffect(() => {
    if (settings) {
      const initial: Record<string, string> = {}
      for (const ch of channels) {
        initial[ch.field] = settings[ch.field] ?? ''
      }
      setFormValues(initial)
    }
  }, [settings])

  useEffect(() => {
    if (error) toast.error('Failed to load settings')
  }, [error])

  const handleChange = useCallback(
    (field: string, value: string) => {
      setFormValues((prev) => ({ ...prev, [field]: value }))
      setSaved(false)
      const validationError = validateUrl(field, value)
      setErrors((prev) => {
        if (prev[field] === validationError) return prev
        return { ...prev, [field]: validationError }
      })
    },
    [],
  )

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!settings) return

    setSaving(true)
    try {
      const patch: SocialMediaPatch = {
        facebook: null,
        instagram: null,
        linkedin: null,
        youtube: null,
        tiktok: null,
        twitter: null,
        whatsapp_url: null,
        telegram: null,
      }

      for (const ch of channels) {
        const value = (formValues[ch.field] ?? '').trim()
        if (value && validateUrl(ch.field, value) === null) {
          patch[ch.field] = value
        } else if (value && validateUrl(ch.field, value) !== null) {
          toast.error(`Please fix the ${ch.label} URL before saving`)
          setSaving(false)
          return
        }
      }

      await updateSocialMedia(patch)
      setSaved(true)
      toast.success('Social media links saved')
      setTimeout(() => setSaved(false), 2500)
    } catch {
      toast.error('Failed to save social media links')
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
          Links shown in the website navbar, footer, and contact page. Leave empty to hide a social icon.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSave}>
        <CardContent className="space-y-5">
          {channels.map(({ field, label, icon, bgClass, placeholder }) => {
            const rawValue = formValues[field] ?? ''
            const fieldError = errors[field] ?? validateUrl(field, rawValue)
            return (
              <div key={field}>
                <div className="flex items-center gap-3">
                  <span
                    className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${bgClass}`}
                  >
                    {icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="mb-1.5 text-sm font-medium text-foreground">
                      {label}
                    </p>
                    <Input
                      value={rawValue}
                      onChange={(e) => handleChange(field, e.target.value)}
                      placeholder={placeholder}
                      className="text-xs"
                      dir="ltr"
                    />
                    {fieldError && rawValue.trim() ? (
                      <p className="mt-1 text-xs text-destructive" dir="rtl">
                        {fieldError}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
            )
          })}
        </CardContent>
        <CardFooter className="justify-between">
          <p className="text-xs text-muted-foreground">
            {saved ? 'Links saved' : 'Leave empty to hide a social icon'}
          </p>
          <Button type="submit" disabled={saving}>
            {saving ? (
              <Loader2 className="size-4 animate-spin" />
            ) : saved ? (
              <Check className="size-4" />
            ) : null}
            {saved ? 'Saved' : 'Save links'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
