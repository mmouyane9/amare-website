import { useRef, useState, type DragEvent } from 'react'
import { Check, ImagePlus, Loader2, Upload, X } from 'lucide-react'
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
  uploadLogo,
  uploadFooterLogo,
  uploadFavicon,
  updateWebsiteBranding,
} from '@/services/settingsService'
import { useWebsiteSettingsContext } from '@/contexts/WebsiteSettingsContext'

type BrandingField = 'logo_url' | 'footer_logo_url' | 'favicon_url'

interface BrandingItem {
  field: BrandingField
  label: string
  description: string
  folder: string
  accept: string
  previewSize: string
}

const BRANDING_ITEMS: BrandingItem[] = [
  {
    field: 'logo_url',
    label: 'الشعار',
    description: 'الشعار الرئيسي — شريط التنقل والقائمة الجانبية وشاشة التحميل',
    folder: 'logo',
    accept: 'image/png,image/svg+xml,image/jpeg,image/webp',
    previewSize: 'size-20',
  },
  {
    field: 'footer_logo_url',
    label: 'شعار التذييل',
    description: 'نسخة التذييل — أصغر، بخلفية داكنة',
    folder: 'footer',
    accept: 'image/png,image/svg+xml,image/jpeg,image/webp',
    previewSize: 'size-20',
  },
  {
    field: 'favicon_url',
    label: 'الأيقونة',
    description: 'أيقونة علامة تبويب المتصفح — ICO, PNG أو SVG',
    folder: 'favicon',
    accept: 'image/png,image/svg+xml,image/x-icon,image/vnd.microsoft.icon,image/webp',
    previewSize: 'size-14',
  },
]

type UploadState = Record<BrandingField, boolean>

export function Branding() {
  const { settings, loading: ctxLoading, refresh } = useWebsiteSettingsContext()
  const [formUrls, setFormUrls] = useState<Record<BrandingField, string>>({
    logo_url: '',
    footer_logo_url: '',
    favicon_url: '',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [uploading, setUploading] = useState<UploadState>({
    logo_url: false,
    footer_logo_url: false,
    favicon_url: false,
  })
  const [dragOver, setDragOver] = useState<Record<BrandingField, boolean>>({
    logo_url: false,
    footer_logo_url: false,
    favicon_url: false,
  })
  const fileInputRefs = useRef<Record<BrandingField, HTMLInputElement | null>>({
    logo_url: null,
    footer_logo_url: null,
    favicon_url: null,
  })

  const currentUrls = {
    logo_url: settings?.logo_url ?? '',
    footer_logo_url: settings?.footer_logo_url ?? '',
    favicon_url: settings?.favicon_url ?? '',
  }

  const displayUrls = {
    logo_url: formUrls.logo_url || currentUrls.logo_url,
    footer_logo_url: formUrls.footer_logo_url || currentUrls.footer_logo_url,
    favicon_url: formUrls.favicon_url || currentUrls.favicon_url,
  }

  const setFieldUrl = (field: BrandingField, url: string) => {
    setFormUrls((prev) => ({ ...prev, [field]: url }))
    setSaved(false)
  }

  const handleUpload = async (file: File | undefined, item: BrandingItem) => {
    if (!file) return
    setUploading((prev) => ({ ...prev, [item.field]: true }))
    try {
      const currentUrl = currentUrls[item.field]
      let url: string
      if (item.field === 'favicon_url') {
        url = await uploadFavicon(file, currentUrl)
      } else if (item.field === 'footer_logo_url') {
        url = await uploadFooterLogo(file, currentUrl)
      } else {
        url = await uploadLogo(file, currentUrl)
      }
      setFieldUrl(item.field, url)
      toast.success(`تم رفع ${item.label}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'فشل رفع الصورة')
    } finally {
      setUploading((prev) => ({ ...prev, [item.field]: false }))
    }
  }

  const handleRemove = async (item: BrandingItem) => {
    setFieldUrl(item.field, '__REMOVE__')
    toast.success(`سيتم حذف ${item.label} عند الحفظ`)
  }

  const handleDragOver = (e: DragEvent, field: BrandingField) => {
    e.preventDefault()
    setDragOver((prev) => ({ ...prev, [field]: true }))
  }

  const handleDragLeave = (e: DragEvent, field: BrandingField) => {
    e.preventDefault()
    setDragOver((prev) => ({ ...prev, [field]: false }))
  }

  const handleDrop = (e: DragEvent, item: BrandingItem) => {
    e.preventDefault()
    setDragOver((prev) => ({ ...prev, [item.field]: false }))
    const file = e.dataTransfer.files?.[0]
    if (file) handleUpload(file, item)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const patch: Record<string, string | null> = {}
      for (const item of BRANDING_ITEMS) {
        const url = formUrls[item.field]
        if (url === '__REMOVE__') {
          patch[item.field] = null
        } else if (url) {
          patch[item.field] = url
        }
      }
      await updateWebsiteBranding(patch)
      setFormUrls({ logo_url: '', footer_logo_url: '', favicon_url: '' })
      refresh()
      setSaved(true)
      toast.success('تم حفظ العلامة التجارية')
      setTimeout(() => setSaved(false), 2500)
    } catch {
      toast.error('فشل حفظ العلامة التجارية')
    } finally {
      setSaving(false)
    }
  }

  const hasChanges = Object.values(formUrls).some((url) => url !== '')

  if (ctxLoading) {
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
        <CardTitle>العلامة التجارية</CardTitle>
        <CardDescription>
          رفع الشعارات والأيقونة. اسحب وأفلت أو انقر للتصفح. الصيغ المدعومة: PNG,
          SVG, JPG, WEBP, ICO. الحد الأقصى 5 ميجابايت لكل ملف.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {BRANDING_ITEMS.map((item) => {
          const isUploading = uploading[item.field]
          const isDragOver = dragOver[item.field]
          const url = displayUrls[item.field]
          const isMarkedForRemoval = formUrls[item.field] === '__REMOVE__'

          return (
            <div key={item.field} className="space-y-1.5">
              <Label>{item.label}</Label>
              <p className="text-xs text-muted-foreground">{item.description}</p>

              <div
                className={`flex items-start gap-4 rounded-xl border-2 p-4 transition-colors ${
                  isDragOver
                    ? 'border-primary bg-primary/5'
                    : 'border-dashed border-border bg-muted/30'
                } ${isMarkedForRemoval ? 'opacity-50' : ''}`}
                onDragOver={(e) => handleDragOver(e, item.field)}
                onDragLeave={(e) => handleDragLeave(e, item.field)}
                onDrop={(e) => handleDrop(e, item)}
              >
                <div
                  className={`flex shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-background ${
                    item.previewSize
                  }`}
                >
                  {url && !isMarkedForRemoval ? (
                    <img
                      src={url}
                      alt={item.label}
                      className="size-full object-contain p-1"
                    />
                  ) : (
                    <ImagePlus className="size-5 text-muted-foreground/50" />
                  )}
                </div>

                <div className="min-w-0 flex-1 space-y-2">
                  <input
                    ref={(el) => {
                      fileInputRefs.current[item.field] = el
                    }}
                    type="file"
                    accept={item.accept}
                    className="hidden"
                    onChange={(e) => {
                      handleUpload(e.target.files?.[0], item)
                      e.target.value = ''
                    }}
                  />

                  <Input
                    value={isMarkedForRemoval ? '' : (formUrls[item.field] || currentUrls[item.field])}
                    onChange={(e) => setFieldUrl(item.field, e.target.value)}
                    placeholder="https://... أو ارفع ملفاً"
                    className="h-9 text-xs"
                    disabled={isMarkedForRemoval}
                  />

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRefs.current[item.field]?.click()}
                      disabled={isUploading || isMarkedForRemoval}
                    >
                      {isUploading ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <Upload className="size-3.5" />
                      )}
                      <span className="ml-1.5">رفع</span>
                    </Button>

                    {(currentUrls[item.field] || formUrls[item.field]) && !isMarkedForRemoval && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemove(item)}
                        className="text-destructive hover:text-destructive"
                      >
                        <X className="size-3.5" />
                        <span className="ml-1.5">حذف</span>
                      </Button>
                    )}

                    {isMarkedForRemoval && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setFieldUrl(item.field, '')}
                      >
                        تراجع
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </CardContent>
      <CardFooter className="justify-between">
        <p className="text-xs text-muted-foreground">
          {saved
            ? 'تم حفظ العلامة التجارية'
            : hasChanges
              ? 'تغييرات غير محفوظة'
              : 'ارفع أو الصق رابط لكل صورة'}
        </p>
        <Button type="button" onClick={handleSave} disabled={saving || !hasChanges}>
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
