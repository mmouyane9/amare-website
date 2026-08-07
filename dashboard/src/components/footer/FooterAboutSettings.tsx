import { useEffect, useState } from 'react'
import { Loader2, Save, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase, supabaseAnon } from '@/lib/supabase'

const SETTINGS_ID = '00000000-0000-0000-0000-000000000001'

interface AboutData {
  association_name: string | null
  organization_description: string | null
  logo_url: string | null
  show_logo: boolean
}

export default function FooterAboutSettings() {
  const [data, setData] = useState<AboutData>({
    association_name: '',
    organization_description: '',
    logo_url: null,
    show_logo: true,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    async function fetch() {
      try {
        const { data: row, error } = await supabaseAnon
          .from('website_settings')
          .select('association_name, organization_description, footer_logo_url, show_logo')
          .eq('id', SETTINGS_ID)
          .single()

        if (error) throw error
        setData({
          association_name: row.association_name ?? '',
          organization_description: row.organization_description ?? '',
          logo_url: row.footer_logo_url ?? null,
          show_logo: row.show_logo ?? true,
        })
      } catch {
        toast.error('فشل تحميل بيانات القسم')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('website_settings')
        .update({
          association_name: data.association_name,
          organization_description: data.organization_description,
          show_logo: data.show_logo,
        })
        .eq('id', SETTINGS_ID)

      if (error) throw error
      toast.success('تم حفظ التغييرات بنجاح')
    } catch {
      toast.error('فشل حفظ التغييرات')
    } finally {
      setSaving(false)
    }
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const filePath = `logos/${Date.now()}-${file.name}`
      const { error: uploadError } = await supabase.storage
        .from('branding')
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage
        .from('branding')
        .getPublicUrl(filePath)

      const logoUrl = urlData.publicUrl

      const { error: updateError } = await supabase
        .from('website_settings')
        .update({ footer_logo_url: logoUrl })
        .eq('id', SETTINGS_ID)

      if (updateError) throw updateError

      setData((prev) => ({ ...prev, logo_url: logoUrl }))
      toast.success('تم رفع الشعار بنجاح')
    } catch {
      toast.error('فشل رفع الشعار')
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveLogo = async () => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('website_settings')
        .update({ footer_logo_url: null })
        .eq('id', SETTINGS_ID)

      if (error) throw error
      setData((prev) => ({ ...prev, logo_url: null }))
      toast.success('تم إزالة الشعار')
    } catch {
      toast.error('فشل إزالة الشعار')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="space-y-4">
            <span className="block h-5 w-32 animate-pulse rounded bg-muted" />
            <span className="block h-16 w-full animate-pulse rounded bg-muted" />
            <span className="block h-10 w-24 animate-pulse rounded bg-muted" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">حول الجمعية</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="about-title">اسم الجمعية</Label>
          <Input
            id="about-title"
            value={data.association_name ?? ''}
            onChange={(e) =>
              setData((prev) => ({ ...prev, association_name: e.target.value }))
            }
          />
        </div>

        <div>
          <Label htmlFor="about-desc">الوصف</Label>
          <Textarea
            id="about-desc"
            value={data.organization_description ?? ''}
            onChange={(e) =>
              setData((prev) => ({
                ...prev,
                organization_description: e.target.value,
              }))
            }
            rows={4}
          />
        </div>

        <div>
          <Label>الشعار</Label>
          <div className="mt-2 flex items-center gap-4">
            {data.logo_url && (
              <img
                src={data.logo_url}
                alt="الشعار"
                className="h-16 w-16 rounded-lg border object-contain"
              />
            )}
            <div className="flex gap-2">
              <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm hover:bg-muted">
                <Upload className="size-3.5" />
                {uploading ? 'جاري الرفع...' : 'رفع شعار'}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoUpload}
                  disabled={uploading}
                />
              </label>
              {data.logo_url && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive"
                  onClick={handleRemoveLogo}
                >
                  إزالة
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="about-show-logo" className="cursor-pointer">
            إظهار الشعار
          </Label>
          <Switch
            id="about-show-logo"
            checked={data.show_logo}
            onCheckedChange={(v) =>
              setData((prev) => ({ ...prev, show_logo: v }))
            }
            size="sm"
          />
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full gap-1.5">
          {saving && <Loader2 className="size-3 animate-spin" />}
          <Save className="size-3.5" />
          حفظ التغييرات
        </Button>
      </CardContent>
    </Card>
  )
}
