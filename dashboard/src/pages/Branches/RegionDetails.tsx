import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowRight,
  Building2,
  ChevronLeft,
  ImagePlus,
  Loader2,
  MapPin,
  MessageSquare,
  Newspaper,
  Pencil,
  Plus,
  Trash2,
  Users,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'

import {
  EMPTY_CITY_FORM,
  cityToForm,
  type Region,
  type City,
  type CityFormData,
} from '@/data/branches'
import {
  getRegionById,
  getCitiesByRegion,
  createCity,
  updateCity,
  deleteCity,
  updateRegion,
} from '@/services/branches.service'

export default function RegionDetailsPage() {
  const { regionId } = useParams<{ regionId: string }>()
  const navigate = useNavigate()

  const [region, setRegion] = useState<Region | null>(null)
  const [cities, setCities] = useState<City[]>([])
  const [loading, setLoading] = useState(true)

  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name_ar: '', name_fr: '', slug: '', description_ar: '', description_fr: '' })
  const [settings, setSettings] = useState({ published: true })

  const [cityModalOpen, setCityModalOpen] = useState(false)
  const [editingCityId, setEditingCityId] = useState<string | null>(null)
  const [cityForm, setCityForm] = useState<CityFormData>(EMPTY_CITY_FORM)
  const [citySaving, setCitySaving] = useState(false)

  const [deleteCityTarget, setDeleteCityTarget] = useState<City | null>(null)
  const [deletingCity, setDeletingCity] = useState(false)

  const loadData = async () => {
    if (!regionId) return
    try {
      const r = await getRegionById(regionId)
      setRegion(r)
      setForm({ name_ar: r.name_ar || '', name_fr: r.name_fr || '', slug: r.slug, description_ar: r.description_ar || r.description || '', description_fr: r.description_fr || '' })
      setSettings({ published: r.published !== false })
      const c = await getCitiesByRegion(regionId)
      setCities(c)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { loadData() }, [regionId])

  if (loading) {
    return <div className="flex flex-col items-center justify-center py-32 text-center"><Loader2 className="size-8 animate-spin text-muted-foreground/40" /><p className="mt-4 text-sm text-muted-foreground">جاري التحميل...</p></div>
  }

  if (!region) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <Building2 className="size-14 text-muted-foreground/25" />
        <p className="mt-4 text-sm font-medium text-muted-foreground">الجهة غير موجودة.</p>
        <Button variant="outline" size="sm" className="mt-4 gap-1.5" onClick={() => navigate('/branches')}><ChevronLeft className="size-3.5" />العودة إلى الفروع الجهوية</Button>
      </div>
    )
  }

  const handleEditToggle = () => {
    if (editing) { setForm({ name_ar: region.name_ar_ar || '', name_fr: region.name_ar_fr || '', slug: region.slug, description_ar: region.description_ar || region.description || '', description_fr: region.description_fr || '' }) }
    setEditing(!editing)
  }

  const handleFormChange = (field: string, value: string) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value }
      if (field === 'name_ar') { next.slug = value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\u0600-\u06FF-]/g, '') }
      return next
    })
  }

  const handleSave = async () => {
    setSaving(true)
    try { await updateRegion(region.id, form); setEditing(false); loadData() } catch (e) { console.error(e) } finally { setSaving(false) }
  }

  const handleCityFormChange = (field: keyof CityFormData, value: string) => { setCityForm((prev) => ({ ...prev, [field]: value })) }

  const openCityCreate = () => { setEditingCityId(null); setCityForm(EMPTY_CITY_FORM); setCityModalOpen(true) }

  const openCityEdit = (city: City) => {
    setEditingCityId(city.id)
    setCityForm({ name_ar: city.name_ar || '', name_fr: city.name_fr || '', slug: city.slug, description_ar: city.description_ar || city.description || '', description_fr: city.description_fr || '', cover_image: city.cover_image || '', address: city.address || '', phone: city.phone || '', email: city.email || '', facebook: city.facebook || '', whatsapp: city.whatsapp || '', published: city.published !== false })
    setCityModalOpen(true)
  }

  const handleCitySave = async () => {
    setCitySaving(true)
    try {
      if (editingCityId) { await updateCity(editingCityId, { ...cityForm, region_id: region.id }) }
      else { await createCity({ ...cityForm, region_id: region.id }) }
      setCityModalOpen(false); loadData()
    } catch (e) { console.error(e) } finally { setCitySaving(false) }
  }

  const handleCityDelete = async () => {
    if (!deleteCityTarget) return
    setDeletingCity(true)
    try { await deleteCity(deleteCityTarget.id); setDeleteCityTarget(null); loadData() } catch (e) { console.error(e) } finally { setDeletingCity(false) }
  }

  const regionCityCount = cities.length
  const regionMembers = cities.reduce((sum) => sum + 1, 0)

  return (
    <div>
      <nav className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link
          to="/branches"
          className="transition-colors hover:text-foreground"
        >
          الفروع الجهوية
        </Link>
        <ChevronLeft className="size-3.5" />
        <span className="font-medium text-foreground">{region.name_ar}</span>
      </nav>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">{region.name_ar}</h2>
          <p className="text-sm text-muted-foreground">
            إدارة معلومات الجهة والمدن التابعة لها.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {editing ? (
            <>
              <Button variant="outline" onClick={handleEditToggle} disabled={saving}>
                إلغاء
              </Button>
              <Button onClick={handleSave} disabled={saving} className="gap-1.5">
                {saving && <Loader2 className="size-3.5 animate-spin" />}
                حفظ
              </Button>
            </>
          ) : (
            <Button onClick={handleEditToggle} variant="outline" className="gap-1.5">
              <Pencil className="size-4" />
              تعديل
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <Card className="overflow-hidden">
          {region.coverImage ? (
            <div className="relative">
              <img
                src={region.coverImage}
                alt={region.name_ar}
                className="h-48 w-full object-cover"
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute bottom-3 left-3 bg-background/80 text-foreground backdrop-blur-sm hover:bg-background"
              >
                <ImagePlus className="size-3.5" />
                تغيير الغلاف
              </Button>
            </div>
          ) : (
            <div className="relative flex h-48 items-center justify-center bg-muted/30">
              <div className="text-center">
                <Building2 className="mx-auto size-10 text-muted-foreground/30" />
                <p className="mt-2 text-sm text-muted-foreground">
                  لا توجد صورة غلاف
                </p>
                <Button variant="outline" size="sm" className="mt-3 gap-1.5">
                  <ImagePlus className="size-3.5" />
                  إضافة غلاف
                </Button>
              </div>
            </div>
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>معلومات عامة</CardTitle>
            <CardDescription>
              التفاصيل الأساسية حول هذه الجهة.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {editing ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="region-name">اسم الجهة</Label>
                  <Input
                    id="region-name"
                    value={form.name}
                    onChange={(e) => handleFormChange('name', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="region-slug">الرابط المختصر</Label>
                  <Input
                    id="region-slug"
                    value={form.slug}
                    onChange={(e) => handleFormChange('slug', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="region-desc">الوصف</Label>
                  <Textarea
                    id="region-desc"
                    value={form.description}
                    onChange={(e) => handleFormChange('description', e.target.value)}
                    rows={3}
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <Label className="text-xs text-muted-foreground">
                    اسم الجهة
                  </Label>
                  <p className="mt-0.5 text-sm font-medium">{region.name_ar}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">
                    الرابط المختصر
                  </Label>
                  <p className="mt-0.5 font-mono text-sm">{region.slug}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">الوصف</Label>
                  <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
                    {region.description || 'لا يوجد وصف.'}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Card size="sm">
            <CardHeader>
              <CardDescription>عدد المدن</CardDescription>
              <CardTitle className="text-2xl font-semibold tracking-tight">
                {regionCityCount}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-1">
              <span className="flex size-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <MapPin className="size-4" />
              </span>
            </CardContent>
          </Card>

          <Card size="sm">
            <CardHeader>
              <CardDescription>عدد الأعضاء</CardDescription>
              <CardTitle className="text-2xl font-semibold tracking-tight">
                {regionMembers.toLocaleString()}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-1">
              <span className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Users className="size-4" />
              </span>
            </CardContent>
          </Card>

          <Card size="sm">
            <CardHeader>
              <CardDescription>عدد المنشورات</CardDescription>
              <CardTitle className="text-2xl font-semibold tracking-tight">
                {regionPosts.toLocaleString()}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-1">
              <span className="flex size-8 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400">
                <Newspaper className="size-4" />
              </span>
            </CardContent>
          </Card>

          <Card size="sm">
            <CardHeader>
              <CardDescription>عدد التعليقات</CardDescription>
              <CardTitle className="text-2xl font-semibold tracking-tight">
                {stats.comments.toLocaleString()}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-1">
              <span className="flex size-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <MessageSquare className="size-4" />
              </span>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>المدن التابعة</CardTitle>
                <CardDescription>
                  قائمة المدن المنتمية لهذه الجهة.
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={openCityCreate}
              >
                <Plus className="size-3.5" />
                + إضافة مدينة
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Separator className="mb-4" />
            {region.cities.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <MapPin className="size-8 text-muted-foreground/40" />
                <p className="mt-2 text-sm font-medium text-muted-foreground">
                  لا توجد مدن بعد.
                </p>
                <p className="mt-1 text-xs text-muted-foreground/70">
                  أضف مدناً إلى هذه الجهة.
                </p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {region.cities.map((city) => (
                  <div
                    key={city.id}
                    className="flex flex-col rounded-lg border border-border/60 p-4 transition-colors hover:border-border"
                  >
                    <div className="mb-3 flex items-start gap-2">
                      <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
                        <MapPin className="size-3.5" />
                      </span>
                      <div className="min-w-0 flex-1 text-right">
                        <p className="text-sm font-medium">{city.name_ar || city.name_en || ''}</p>
                      </div>
                    </div>

                    <div className="mb-3 grid grid-cols-2 gap-2">
                      <div className="rounded-md bg-muted/50 px-2 py-1.5 text-center">
                        <p className="text-[10px] text-muted-foreground">الأعضاء</p>
                        <p className="text-sm font-semibold">{city.members}</p>
                      </div>
                      <div className="rounded-md bg-muted/50 px-2 py-1.5 text-center">
                        <p className="text-[10px] text-muted-foreground">المنشورات</p>
                        <p className="text-sm font-semibold">{city.posts}</p>
                      </div>
                    </div>

                    <div className="mt-auto flex items-center gap-1 border-t border-border/60 pt-3">
                      <Button
                        variant="ghost"
                        size="xs"
                        className="flex-1 gap-1 text-xs"
                        onClick={() => navigate(`/branches/${region.id}/cities/${city.id}`)}
                      >
                        فتح
                        <ArrowRight className="size-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => openCityEdit(city)}
                        title="تعديل"
                      >
                        <Pencil className="size-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => setDeleteCityTarget(city)}
                        title="حذف"
                      >
                        <Trash2 className="size-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>الإعدادات</CardTitle>
            <CardDescription>
              تخصيص إعدادات الظهور والتفاعل.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>إظهار الجهة في الموقع</Label>
                <p className="text-xs text-muted-foreground">
                  إظهار هذه الجهة على الموقع الإلكتروني.
                </p>
              </div>
              <Switch
                checked={settings.showRegion}
                onCheckedChange={(v) =>
                  setSettings((prev) => ({ ...prev, published: v }))
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>السماح بالمنشورات</Label>
                <p className="text-xs text-muted-foreground">
                  السماح للأعضاء بإنشاء منشورات في هذه الجهة.
                </p>
              </div>
              <Switch
                checked={settings.allowPosts}
                onCheckedChange={(v) =>
                  setSettings((prev) => ({ ...prev, allowPosts: v }))
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>السماح بالتعليقات</Label>
                <p className="text-xs text-muted-foreground">
                  تفعيل التعليقات على محتوى الجهة.
                </p>
              </div>
              <Switch
                checked={settings.allowComments}
                onCheckedChange={(v) =>
                  setSettings((prev) => ({ ...prev, allowComments: v }))
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>السماح بالإعجابات</Label>
                <p className="text-xs text-muted-foreground">
                  تفعيل التفاعلات على منشورات الجهة.
                </p>
              </div>
              <Switch
                checked={settings.allowLikes}
                onCheckedChange={(v) =>
                  setSettings((prev) => ({ ...prev, allowLikes: v }))
                }
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={cityModalOpen} onOpenChange={setCityModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingCityId ? 'تعديل المدينة' : 'إضافة مدينة'}
            </DialogTitle>
            <DialogDescription>
              {editingCityId
                ? 'قم بتحديث تفاصيل المدينة أدناه.'
                : 'أدخل التفاصيل لإضافة مدينة جديدة.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="city-name">اسم المدينة</Label>
              <Input
                id="city-name"
                value={cityForm.name_ar}
                onChange={(e) => handleCityFormChange('name', e.target.value)}
                placeholder="أدخل اسم المدينة"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city-desc">الوصف</Label>
              <Textarea
                id="city-desc"
                value={cityForm.description_ar}
                onChange={(e) =>
                  handleCityFormChange('description', e.target.value)
                }
                placeholder="وصف مختصر عن المدينة..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>صورة الغلاف</Label>
              <label className="flex h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/30 text-muted-foreground transition-colors hover:bg-muted/50">
                <ImagePlus className="size-6" />
                <span className="text-sm font-medium">رفع صورة</span>
                <span className="text-xs">PNG, JPG, WEBP</span>
                <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" />
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCityModalOpen(false)}
              disabled={citySaving}
            >
              إلغاء
            </Button>
            <Button onClick={handleCitySave} disabled={citySaving}>
              {citySaving && <Loader2 className="ml-1 size-3 animate-spin" />}
              حفظ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!deleteCityTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteCityTarget(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>حذف المدينة</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من حذف{' '}
              <span className="font-medium text-foreground">
                {deleteCityTarget?.name ?? 'هذه المدينة'}
              </span>
              ؟ لا يمكن التراجع عن هذا الإجراء.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteCityTarget(null)}
              disabled={deletingCity}
            >
              إلغاء
            </Button>
            <Button
              variant="destructive"
              onClick={handleCityDelete}
              disabled={deletingCity}
            >
              {deletingCity && (
                <Loader2 className="ml-1 size-3 animate-spin" />
              )}
              حذف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
