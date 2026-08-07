import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Calendar,
  Eye,
  Globe,
  ImagePlus,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  Upload,
  X,
} from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  getHeroUpdates,
  createHeroUpdate,
  updateHeroUpdate,
  deleteHeroUpdate,
  uploadHeroImage,
  deleteHeroImage,
  subscribeToHeroUpdates,
} from '@/services/updates.service'
import type { HeroUpdate, HeroUpdateCreateInput } from '@/types/updates'

interface UpdateForm {
  title: string
  description: string
  image_url: string
  banner_text: string
  button1_text: string
  button1_url: string
  button2_text: string
  button2_url: string
  button3_text: string
  button3_url: string
  status: 'live' | 'draft'
}

const EMPTY_FORM: UpdateForm = {
  title: '',
  description: '',
  image_url: '',
  banner_text: '',
  button1_text: '',
  button1_url: '',
  button2_text: '',
  button2_url: '',
  button3_text: '',
  button3_url: '',
  status: 'draft',
}

function updateToForm(u: HeroUpdate): UpdateForm {
  return {
    title: u.title,
    description: u.description,
    image_url: u.image_url,
    banner_text: u.banner_text,
    button1_text: u.button1_text,
    button1_url: u.button1_url,
    button2_text: u.button2_text,
    button2_url: u.button2_url,
    button3_text: u.button3_text,
    button3_url: u.button3_url,
    status: u.status,
  }
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const STATUS_BADGE_VARIANT: Record<string, 'default' | 'secondary'> = {
  live: 'default',
  draft: 'secondary',
}

export default function UpdatesPage() {
  const [updates, setUpdates] = useState<HeroUpdate[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingUpdate, setEditingUpdate] = useState<HeroUpdate | null>(null)
  const [form, setForm] = useState<UpdateForm>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [deleteTarget, setDeleteTarget] = useState<HeroUpdate | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchUpdates = useCallback(async () => {
    try {
      const data = await getHeroUpdates()
      setUpdates(data)
    } catch {
      toast.error('فشل تحميل المستجدات')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUpdates()
  }, [fetchUpdates])

  useEffect(() => {
    const channel = subscribeToHeroUpdates(() => {
      fetchUpdates()
    })
    return () => {
      channel.unsubscribe()
    }
  }, [fetchUpdates])

  const openCreateModal = () => {
    setEditingUpdate(null)
    setForm(EMPTY_FORM)
    setImageFile(null)
    setImagePreview(null)
    setModalOpen(true)
  }

  const openEditModal = (u: HeroUpdate) => {
    setEditingUpdate(u)
    setForm(updateToForm(u))
    setImageFile(null)
    setImagePreview(u.image_url)
    setModalOpen(true)
  }

  const handleFormChange = (field: keyof UpdateForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleImageSelect = (file: File | undefined) => {
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith('image/')) {
      handleImageSelect(file)
    }
  }

  const clearImage = () => {
    setImageFile(null)
    setImagePreview(null)
  }

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast.error('العنوان مطلوب')
      return
    }

    setSaving(true)

    try {
      let imageUrl = editingUpdate?.image_url ?? ''

      if (imageFile) {
        imageUrl = await uploadHeroImage(imageFile)
        if (editingUpdate?.image_url) {
          await deleteHeroImage(editingUpdate.image_url)
        }
      }

      const payload: HeroUpdateCreateInput = {
        ...form,
        image_url: imageUrl,
      }

      if (editingUpdate) {
        const updated = await updateHeroUpdate(editingUpdate.id, payload)
        setUpdates((prev) =>
          prev.map((u) => (u.id === editingUpdate.id ? updated : u)),
        )
        toast.success('تم حفظ المستجد بنجاح')
      } else {
        const created = await createHeroUpdate(payload)
        setUpdates((prev) => [created, ...prev])
        toast.success('تم نشر المستجد بنجاح')
      }

      setModalOpen(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'فشل حفظ المستجد')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteHeroUpdate(deleteTarget.id)
      setUpdates((prev) => prev.filter((u) => u.id !== deleteTarget.id))
      setDeleteTarget(null)
      toast.success('تم حذف المستجد')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'فشل حذف المستجد')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">المستجدات</h2>
          <p className="text-sm text-muted-foreground">
            إدارة محتوى الصفحة الرئيسية والإعلانات.
          </p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="size-4" />
          مستجد جديد
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-xl border border-border bg-card"
            >
              <div className="aspect-video animate-pulse bg-muted" />
              <div className="space-y-2.5 p-4">
                <span className="block h-4 w-16 animate-pulse rounded bg-muted" />
                <span className="block h-4 w-full animate-pulse rounded bg-muted" />
                <span className="block h-3 w-3/4 animate-pulse rounded bg-muted" />
                <div className="flex gap-1.5 pt-0.5">
                  <span className="block h-5 w-16 animate-pulse rounded-md bg-muted" />
                  <span className="block h-5 w-16 animate-pulse rounded-md bg-muted" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : updates.length === 0 ? (
        <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-border bg-muted/30">
          <p className="text-sm text-muted-foreground">
            لا توجد مستجدات. أنشئ أول مستجد.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {updates.map((update) => (
            <div
              key={update.id}
              className="group/update overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-sm"
            >
              <div className="relative flex aspect-video items-center justify-center overflow-hidden bg-muted/40">
                {update.image_url ? (
                  <img
                    src={update.image_url}
                    alt={update.title}
                    className="size-full object-cover transition-transform duration-200 group-hover/update:scale-[1.02]"
                  />
                ) : (
                  <span className="flex size-12 items-center justify-center rounded-lg bg-muted text-muted-foreground ring-1 ring-border">
                    <ImagePlus className="size-6" />
                  </span>
                )}
                <Badge
                  variant={STATUS_BADGE_VARIANT[update.status]}
                  className="absolute top-2.5 right-2.5"
                >
                  {update.status === 'live' ? (
                    <Globe className="mr-1 size-3" />
                  ) : null}
                  {update.status === 'live' ? 'منشور' : 'مسودة'}
                </Badge>
              </div>

              <div className="space-y-2.5 p-4">
                {update.banner_text && (
                  <Badge variant="outline" className="text-[11px]">
                    {update.banner_text}
                  </Badge>
                )}

                <h3 className="whitespace-pre-line text-sm font-medium leading-snug text-foreground">
                  {update.title}
                </h3>
                <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                  {update.description}
                </p>

                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {update.button1_text && (
                    <span className="inline-flex items-center rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground">
                      {update.button1_text}
                    </span>
                  )}
                  {update.button2_text && (
                    <span className="inline-flex items-center rounded-md border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground">
                      {update.button2_text}
                    </span>
                  )}
                  {update.button3_text && (
                    <span className="inline-flex items-center rounded-md border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground">
                      {update.button3_text}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Calendar className="size-3" />
                    {formatDate(update.updated_at)}
                  </span>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      title="معاينة"
                      onClick={() =>
                        toast.info(`Preview: ${update.title}`, {
                          description: 'سيتم فتح المعاينة في علامة تبويب جديدة.',
                        })
                      }
                    >
                      <Eye className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      title="تعديل"
                      onClick={() => openEditModal(update)}
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      title="حذف"
                      onClick={() => setDeleteTarget(update)}
                    >
                      <Trash2 className="size-3.5 text-red-500" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingUpdate ? 'تعديل المستجد' : 'مستجد جديد'}
            </DialogTitle>
            <DialogDescription>
              {editingUpdate
                ? 'تعديل محتوى المستجد وتفاصيل الإعلان.'
                : 'إنشاء مستجد جديد للصفحة الرئيسية مع أزرار الدعوة للإجراء.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <Label>الصورة الرئيسية</Label>
              {imagePreview ? (
                <div className="relative inline-block">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-48 w-full max-w-sm rounded-xl border object-cover"
                  />
                  <button
                    type="button"
                    onClick={clearImage}
                    className="absolute -right-1 -top-1 flex size-6 items-center justify-center rounded-full bg-red-500 text-white shadow"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              ) : (
                <label
                  className={`flex h-48 w-full max-w-sm cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed transition-colors ${
                    isDragOver
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border bg-muted/30 text-muted-foreground hover:bg-muted/50'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  {isDragOver ? (
                    <Upload className="size-8" />
                  ) : (
                    <ImagePlus className="size-8" />
                  )}
                  <span className="text-sm font-medium">
                    {isDragOver ? 'أسقط الصورة هنا' : 'رفع صورة'}
                  </span>
                  <span className="text-xs">
                    {isDragOver
                      ? 'حرّر للرفع'
                      : 'اسحب وأفلت أو انقر للتصفح'}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    الموصى به: 1920 × 1080
                  </span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => handleImageSelect(e.target.files?.[0])}
                  />
                </label>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="u-banner">نص الشريط</Label>
              <Input
                id="u-banner"
                value={form.banner_text}
                onChange={(e) => handleFormChange('banner_text', e.target.value)}
                placeholder="التسجيل مفتوح الآن"
                className="h-11 text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="u-title">العنوان</Label>
              <Input
                id="u-title"
                value={form.title}
                onChange={(e) => handleFormChange('title', e.target.value)}
                placeholder="مرحباً بكم في AMARE"
                className="h-11 text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="u-desc">الوصف</Label>
              <Textarea
                id="u-desc"
                value={form.description}
                onChange={(e) => handleFormChange('description', e.target.value)}
                placeholder="وصف مختصر لقسم المستجدات..."
                rows={3}
              />
            </div>

            <div className="space-y-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                أزرار الدعوة للإجراء
              </p>

              <div className="grid gap-3">
                <div className="space-y-2">
                  <Label htmlFor="btn1-text" className="text-xs">
                    الزر ١
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      id="btn1-text"
                      value={form.button1_text}
                      onChange={(e) =>
                        handleFormChange('button1_text', e.target.value)
                      }
                      placeholder="النص"
                    />
                    <Input
                      value={form.button1_url}
                      onChange={(e) =>
                        handleFormChange('button1_url', e.target.value)
                      }
                      placeholder="الرابط"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="btn2-text" className="text-xs">
                    الزر ٢
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      id="btn2-text"
                      value={form.button2_text}
                      onChange={(e) =>
                        handleFormChange('button2_text', e.target.value)
                      }
                      placeholder="النص"
                    />
                    <Input
                      value={form.button2_url}
                      onChange={(e) =>
                        handleFormChange('button2_url', e.target.value)
                      }
                      placeholder="الرابط"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="btn3-text" className="text-xs">
                    الزر ٣
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      id="btn3-text"
                      value={form.button3_text}
                      onChange={(e) =>
                        handleFormChange('button3_text', e.target.value)
                      }
                      placeholder="النص"
                    />
                    <Input
                      value={form.button3_url}
                      onChange={(e) =>
                        handleFormChange('button3_url', e.target.value)
                      }
                      placeholder="الرابط"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="u-status">الحالة</Label>
              <Select
                value={form.status}
                onValueChange={(value) =>
                  handleFormChange('status', value as 'live' | 'draft')
                }
              >
                <SelectTrigger id="u-status" className="w-full">
                  <SelectValue placeholder="اختر الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="live">منشور</SelectItem>
                  <SelectItem value="draft">مسودة</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="size-4 animate-spin" />}
              {editingUpdate ? 'حفظ التغييرات' : 'نشر'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteTarget} onOpenChange={(v) => { if (!v) setDeleteTarget(null) }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>حذف المستجد</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من حذف &ldquo;{deleteTarget?.title}&rdquo;؟
              لا يمكن التراجع عن هذا الإجراء.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              إلغاء
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting && <Loader2 className="size-4 animate-spin" />}
              حذف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
