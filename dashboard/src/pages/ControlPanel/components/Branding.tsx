import { useCallback, useEffect, useRef, useState } from 'react'
import { Check, ImagePlus, Loader2, Upload } from 'lucide-react'
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
import {
  getSettings,
  saveSettings,
  uploadBrandingImage,
  type AppSettings,
} from '@/services/settings.service'

const BRANDING_BUCKET = 'branding'

export function Branding() {
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingFavicon, setUploadingFavicon] = useState(false)
  const logoInputRef = useRef<HTMLInputElement>(null)
  const faviconInputRef = useRef<HTMLInputElement>(null)

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

  const handleUpload = async (
    file: File | undefined,
    field: 'logo_url' | 'favicon_url',
    setUploading: (v: boolean) => void,
  ) => {
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadBrandingImage(file, BRANDING_BUCKET, field.replace('_url', ''))
      setSettings((prev) => (prev ? { ...prev, [field]: url } : prev))
      setSaved(false)
      toast.success(`${field === 'logo_url' ? 'Logo' : 'Favicon'} uploaded`)
    } catch {
      toast.error('Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const updateUrl = (field: 'logo_url' | 'favicon_url', value: string) => {
    setSettings((prev) => (prev ? { ...prev, [field]: value } : prev))
    setSaved(false)
  }

  const handleSave = async () => {
    if (!settings) return
    setSaving(true)
    try {
      await saveSettings({
        logo_url: settings.logo_url,
        favicon_url: settings.favicon_url,
      })
      setSaved(true)
      toast.success('Branding saved')
      setTimeout(() => setSaved(false), 2500)
    } catch {
      toast.error('Failed to save branding')
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
        <CardTitle>Branding</CardTitle>
        <CardDescription>
          Upload your logo and favicon. Images are stored in Supabase Storage.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Logo</Label>
            <div className="flex items-center gap-3">
              <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-dashed border-border bg-muted/40 text-muted-foreground">
                {settings?.logo_url ? (
                  <img
                    src={settings.logo_url}
                    alt="Logo"
                    className="size-full object-cover"
                  />
                ) : (
                  <ImagePlus className="size-5" />
                )}
              </div>
              <div className="min-w-0 flex-1 space-y-2">
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    handleUpload(e.target.files?.[0], 'logo_url', setUploadingLogo)
                    e.target.value = ''
                  }}
                />
                <Input
                  value={settings?.logo_url ?? ''}
                  onChange={(e) => updateUrl('logo_url', e.target.value)}
                  placeholder="https://..."
                  className="text-xs"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => logoInputRef.current?.click()}
                  disabled={uploadingLogo}
                >
                  {uploadingLogo ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Upload className="size-3.5" />
                  )}
                  Upload
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Favicon</Label>
            <div className="flex items-center gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-dashed border-border bg-muted/40 text-muted-foreground">
                {settings?.favicon_url ? (
                  <img
                    src={settings.favicon_url}
                    alt="Favicon"
                    className="size-full object-cover"
                  />
                ) : (
                  <ImagePlus className="size-4" />
                )}
              </div>
              <div className="min-w-0 flex-1 space-y-2">
                <input
                  ref={faviconInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    handleUpload(e.target.files?.[0], 'favicon_url', setUploadingFavicon)
                    e.target.value = ''
                  }}
                />
                <Input
                  value={settings?.favicon_url ?? ''}
                  onChange={(e) => updateUrl('favicon_url', e.target.value)}
                  placeholder="https://..."
                  className="text-xs"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => faviconInputRef.current?.click()}
                  disabled={uploadingFavicon}
                >
                  {uploadingFavicon ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Upload className="size-3.5" />
                  )}
                  Upload
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="justify-between">
        <p className="text-xs text-muted-foreground">
          {saved ? 'Branding saved' : 'Upload or paste a URL for each image'}
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
