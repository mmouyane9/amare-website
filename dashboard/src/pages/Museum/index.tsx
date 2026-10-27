import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowDown,
  ArrowUp,
  ExternalLink,
  Eye,
  EyeOff,
  Film,
  Image as ImageIcon,
  ImagePlus,
  Landmark,
  Loader2,
  Pencil,
  Play,
  Plus,
  Search,
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
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'

import { formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import {
  createMuseumItem,
  deleteMuseumItem,
  getMuseumItems,
  moveMuseumItem,
  removeUnreferencedMuseumMedia,
  setMuseumPublished,
  subscribeToMuseum,
  updateMuseumItem,
  uploadMuseumMedia,
  validateMuseumFile,
} from '@/services/museum.service'
import {
  MUSEUM_IMAGE_ACCEPT,
  MUSEUM_MEDIA_LABELS,
  MUSEUM_VIDEO_ACCEPT,
  type MuseumItem,
  type MuseumItemInput,
  type MuseumMediaType,
} from '@/types/museum'

// Matches the existing News dashboard convention: the dashboard is served
// alongside the public site, so a relative path reaches the public page.
const PUBLIC_PAGE_URL = '../Our%20services/digital-museum.html'

interface MuseumFormState {
  title: string
  description: string
  media_type: MuseumMediaType
  media_url: string
  thumbnail_url: string
  category: string
  is_published: boolean
  display_order: string
}

const EMPTY_FORM: MuseumFormState = {
  title: '',
  description: '',
  media_type: 'image',
  media_url: '',
  thumbnail_url: '',
  category: '',
  is_published: false,
  display_order: '0',
}

function itemToForm(item: MuseumItem): MuseumFormState {
  return {
    title: item.title ?? '',
    description: item.description ?? '',
    media_type: item.media_type === 'video' ? 'video' : 'image',
    media_url: item.media_url ?? '',
    thumbnail_url: item.thumbnail_url ?? '',
    category: item.category ?? '',
    is_published: item.is_published,
    display_order: String(item.display_order ?? 0),
  }
}

function friendlyError(error: unknown, fallback: string): string {
  const message = error instanceof Error ? error.message : String(error ?? '')

  if (/row-level security|permission denied|42501|not authorized/i.test(message)) {
    return 'ليست لديك صلاحية لإدارة المتحف. تواصل مع مسؤول النظام.'
  }
  if (/bucket|storage|mime|payload too large|413/i.test(message)) {
    return 'تعذر رفع الملف. تحقق من نوع الملف وحجمه ومن إعدادات التخزين في Supabase.'
  }
  if (/museum_items|schema cache|does not exist|42P01|PGRST205/i.test(message)) {
    return 'جدول المتحف غير مهيأ في قاعدة البيانات. شغّل سكربت 00038_create_museum_items.sql أولاً.'
  }
  return fallback
}

function TypeBadge({ type }: { type: string }) {
  const isVideo = type === 'video'
  return (
    <Badge
      className={cn(
        'gap-1',
        isVideo
          ? 'bg-violet-100 text-violet-700 hover:bg-violet-100 dark:bg-violet-500/15 dark:text-violet-300'
          : 'bg-sky-100 text-sky-700 hover:bg-sky-100 dark:bg-sky-500/15 dark:text-sky-300',
      )}
    >
      {isVideo ? <Film className="size-3" /> : <ImageIcon className="size-3" />}
      {MUSEUM_MEDIA_LABELS[type] ?? type}
    </Badge>
  )
}

function StatusBadge({ published }: { published: boolean }) {
  return (
    <Badge
      className={cn(
        published
          ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/15 dark:text-emerald-300'
          : 'bg-amber-100 text-amber-700 hover:bg-amber-100 dark:bg-amber-500/15 dark:text-amber-300',
      )}
    >
      {published ? 'منشور' : 'غير منشور'}
    </Badge>
  )
}

function MediaThumb({
  item,
  className,
}: {
  item: Pick<MuseumItem, 'media_type' | 'media_url' | 'thumbnail_url' | 'title'>
  className?: string
}) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const isVideo = item.media_type === 'video'
  const src = isVideo ? item.thumbnail_url || null : item.media_url || null
  const failed = !!src && failedSrc === src

  return (
    <div
      className={cn(
        'relative shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-sky-100 to-blue-100 dark:from-sky-500/15 dark:to-blue-500/10',
        className,
      )}
    >
      <div className="absolute inset-0 flex items-center justify-center text-sky-600/60 dark:text-sky-300/60">
        {isVideo ? <Film className="size-5" /> : <ImageIcon className="size-5" />}
      </div>
      {src && !failed && (
        <img
          src={src}
          alt={item.title}
          loading="lazy"
          className="absolute inset-0 size-full object-cover"
          onError={() => setFailedSrc(src)}
        />
      )}
      {isVideo && (
        <span className="absolute inset-0 flex items-center justify-center bg-black/20">
          <span className="flex size-7 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm">
            <Play className="size-3.5 fill-current" />
          </span>
        </span>
      )}
    </div>
  )
}

function TableSkeleton() {
  return (
    <TableBody>
      {Array.from({ length: 5 }).map((_, row) => (
        <TableRow key={row}>
          {Array.from({ length: 6 }).map((__, cell) => (
            <TableCell key={cell}>
              <span className="block h-4 w-16 animate-pulse rounded bg-muted" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  )
}

export default function MuseumPage() {
  const [items, setItems] = useState<MuseumItem[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<MuseumItem | null>(null)
  const [form, setForm] = useState<MuseumFormState>(EMPTY_FORM)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  const [mediaFile, setMediaFile] = useState<File | null>(null)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [mediaPreview, setMediaPreview] = useState<string | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)

  const [previewItem, setPreviewItem] = useState<MuseumItem | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<MuseumItem | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [reorderingId, setReorderingId] = useState<string | null>(null)

  const mediaObjectUrl = useRef<string | null>(null)
  const thumbObjectUrl = useRef<string | null>(null)

  const fetchItems = useCallback(async (showSkeleton = true) => {
    if (showSkeleton) setLoading(true)
    try {
      const rows = await getMuseumItems()
      setItems(rows)
      setLoadError(null)
    } catch (error) {
      console.error('Failed to load museum items:', error)
      setLoadError(friendlyError(error, 'تعذر تحميل مقتنيات المتحف.'))
      toast.error(friendlyError(error, 'تعذر تحميل مقتنيات المتحف.'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let active = true
    // Defer the first fetch out of the effect body so the loading state update
    // happens asynchronously (React's set-state-in-effect guidance).
    Promise.resolve().then(() => {
      if (active) fetchItems()
    })
    return () => {
      active = false
    }
  }, [fetchItems])

  useEffect(() => {
    const channel = subscribeToMuseum(() => {
      fetchItems(false)
    })
    return () => {
      channel.unsubscribe()
    }
  }, [fetchItems])

  useEffect(() => {
    return () => {
      if (mediaObjectUrl.current) URL.revokeObjectURL(mediaObjectUrl.current)
      if (thumbObjectUrl.current) URL.revokeObjectURL(thumbObjectUrl.current)
    }
  }, [])

  const filteredItems = useMemo(() => {
    const needle = search.trim().toLowerCase()
    return items.filter((item) => {
      if (typeFilter !== 'all' && item.media_type !== typeFilter) return false
      if (statusFilter === 'published' && !item.is_published) return false
      if (statusFilter === 'draft' && item.is_published) return false
      if (!needle) return true
      return [item.title, item.description, item.category]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(needle))
    })
  }, [items, search, typeFilter, statusFilter])

  const publishedCount = useMemo(
    () => items.filter((item) => item.is_published).length,
    [items],
  )

  function clearMediaSelection() {
    if (mediaObjectUrl.current) {
      URL.revokeObjectURL(mediaObjectUrl.current)
      mediaObjectUrl.current = null
    }
    setMediaFile(null)
    setMediaPreview(null)
  }

  function clearThumbnailSelection() {
    if (thumbObjectUrl.current) {
      URL.revokeObjectURL(thumbObjectUrl.current)
      thumbObjectUrl.current = null
    }
    setThumbnailFile(null)
    setThumbnailPreview(null)
  }

  function resetFileState() {
    clearMediaSelection()
    clearThumbnailSelection()
  }

  function nextDisplayOrder(): number {
    if (!items.length) return 1
    return Math.max(...items.map((item) => item.display_order)) + 1
  }

  function openCreateModal() {
    setEditingItem(null)
    setForm({ ...EMPTY_FORM, display_order: String(nextDisplayOrder()) })
    setErrors({})
    resetFileState()
    setModalOpen(true)
  }

  function openEditModal(item: MuseumItem) {
    setEditingItem(item)
    setForm(itemToForm(item))
    setErrors({})
    resetFileState()
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setErrors({})
    resetFileState()
  }

  function handleFormChange<K extends keyof MuseumFormState>(
    field: K,
    value: MuseumFormState[K],
  ) {
    setForm((previous) => ({ ...previous, [field]: value }))
    setErrors((previous) => {
      if (!previous[field]) return previous
      const next = { ...previous }
      delete next[field]
      return next
    })
  }

  function handleMediaTypeChange(value: string) {
    const mediaType: MuseumMediaType = value === 'video' ? 'video' : 'image'
    clearMediaSelection()
    if (mediaType !== form.media_type) {
      handleFormChange('media_type', mediaType)
      handleFormChange('media_url', '')
      if (mediaType === 'image') handleFormChange('thumbnail_url', '')
    }
  }

  function handleMediaFile(file: File | undefined) {
    if (!file) return
    const error = validateMuseumFile(file, form.media_type)
    if (error) {
      toast.error(error)
      return
    }
    clearMediaSelection()
    mediaObjectUrl.current = URL.createObjectURL(file)
    setMediaFile(file)
    setMediaPreview(mediaObjectUrl.current)
    handleFormChange('media_url', '')
  }

  function handleThumbnailFile(file: File | undefined) {
    if (!file) return
    const error = validateMuseumFile(file, 'image')
    if (error) {
      toast.error(error)
      return
    }
    clearThumbnailSelection()
    thumbObjectUrl.current = URL.createObjectURL(file)
    setThumbnailFile(file)
    setThumbnailPreview(thumbObjectUrl.current)
    handleFormChange('thumbnail_url', '')
  }

  function validateForm(): Record<string, string> {
    const next: Record<string, string> = {}
    if (!form.title.trim()) next.title = 'العنوان مطلوب.'
    else if (form.title.trim().length > 200)
      next.title = 'العنوان يجب ألا يتجاوز 200 حرف.'

    if (!mediaFile && !form.media_url.trim()) {
      next.media_url = 'أضف ملف وسائط أو رابطًا مباشرًا.'
    }

    if (form.description.length > 2000) {
      next.description = 'الوصف يجب ألا يتجاوز 2000 حرف.'
    }

    if (form.category.length > 80) {
      next.category = 'الفئة يجب ألا تتجاوز 80 حرفًا.'
    }

    const order = Number(form.display_order)
    if (
      form.display_order.trim() === '' ||
      !Number.isFinite(order) ||
      order < 0
    ) {
      next.display_order = 'أدخل رقم ترتيب صحيحًا (0 أو أكبر).'
    }

    return next
  }

  async function handleSave() {
    const validationErrors = validateForm()
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors)
      return
    }

    setSaving(true)
    const uploadedUrls: string[] = []

    try {
      let mediaUrl = form.media_url.trim()
      if (mediaFile) {
        mediaUrl = await uploadMuseumMedia(mediaFile, form.media_type)
        uploadedUrls.push(mediaUrl)
      }

      let thumbnailUrl = form.thumbnail_url.trim()
      if (thumbnailFile) {
        thumbnailUrl = await uploadMuseumMedia(thumbnailFile, 'image')
        uploadedUrls.push(thumbnailUrl)
      }

      const payload: MuseumItemInput = {
        title: form.title,
        description: form.description,
        media_type: form.media_type,
        media_url: mediaUrl,
        thumbnail_url: thumbnailUrl,
        category: form.category,
        is_published: form.is_published,
        display_order: Number(form.display_order),
      }

      if (editingItem) {
        await updateMuseumItem(editingItem.id, payload)
      } else {
        await createMuseumItem(payload)
      }

      const replacedUrls = editingItem
        ? [editingItem.media_url, editingItem.thumbnail_url].filter(
            (url): url is string =>
              !!url && url !== mediaUrl && url !== thumbnailUrl,
          )
        : []

      setModalOpen(false)
      setEditingItem(null)
      resetFileState()
      toast.success(
        editingItem ? 'تم تحديث قطعة المتحف.' : 'تمت إضافة قطعة المتحف.',
      )
      await fetchItems(false)

      if (replacedUrls.length) {
        await removeUnreferencedMuseumMedia(replacedUrls).catch((error) => {
          console.warn('[Museum] Old media cleanup skipped:', error)
        })
      }
    } catch (error) {
      console.error('Failed to save museum item:', error)
      // Do not leave freshly uploaded orphans behind if the DB write failed.
      if (uploadedUrls.length) {
        await removeUnreferencedMuseumMedia(uploadedUrls).catch(() => {})
      }
      toast.error(friendlyError(error, 'فشل حفظ قطعة المتحف.'))
    } finally {
      setSaving(false)
    }
  }

  async function handleTogglePublished(item: MuseumItem, next: boolean) {
    setTogglingId(item.id)
    try {
      const updated = await setMuseumPublished(item.id, next)
      setItems((previous) =>
        previous.map((row) => (row.id === item.id ? updated : row)),
      )
      toast.success(next ? 'تم نشر القطعة.' : 'تم إلغاء نشر القطعة.')
    } catch (error) {
      console.error('Failed to update museum visibility:', error)
      toast.error(friendlyError(error, 'تعذر تحديث حالة النشر.'))
    } finally {
      setTogglingId(null)
    }
  }

  async function handleMove(item: MuseumItem, direction: 'up' | 'down') {
    setReorderingId(item.id)
    try {
      await moveMuseumItem(item.id, direction)
      await fetchItems(false)
      toast.success('تم تحديث ترتيب العرض.')
    } catch (error) {
      console.error('Failed to reorder museum items:', error)
      toast.error(friendlyError(error, 'تعذر تحديث الترتيب.'))
    } finally {
      setReorderingId(null)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteMuseumItem(deleteTarget.id)
      toast.success('تم حذف القطعة.')
      setDeleteTarget(null)
      await fetchItems(false)
    } catch (error) {
      console.error('Failed to delete museum item:', error)
      toast.error(friendlyError(error, 'تعذر حذف القطعة.'))
    } finally {
      setDeleting(false)
    }
  }

  const previewSrc = mediaPreview ?? form.media_url
  const previewThumbnail = thumbnailPreview ?? form.thumbnail_url
  const hasActiveFilters =
    search.trim() !== '' || typeFilter !== 'all' || statusFilter !== 'all'

  function renderActions(item: MuseumItem) {
    const globalIndex = items.findIndex((row) => row.id === item.id)
    const isBusy = reorderingId === item.id || togglingId === item.id
    return (
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon-xs"
          title="معاينة"
          aria-label={`معاينة ${item.title}`}
          onClick={() => setPreviewItem(item)}
          disabled={isBusy}
        >
          <Eye className="size-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon-xs"
          title="تعديل"
          aria-label={`تعديل ${item.title}`}
          onClick={() => openEditModal(item)}
          disabled={isBusy}
        >
          <Pencil className="size-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon-xs"
          title="تحريك للأعلى"
          aria-label={`تحريك ${item.title} للأعلى`}
          onClick={() => handleMove(item, 'up')}
          disabled={isBusy || globalIndex <= 0}
        >
          {reorderingId === item.id ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <ArrowUp className="size-3.5" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon-xs"
          title="تحريك للأسفل"
          aria-label={`تحريك ${item.title} للأسفل`}
          onClick={() => handleMove(item, 'down')}
          disabled={
            isBusy || globalIndex < 0 || globalIndex >= items.length - 1
          }
        >
          <ArrowDown className="size-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon-xs"
          title="حذف"
          aria-label={`حذف ${item.title}`}
          onClick={() => setDeleteTarget(item)}
          disabled={isBusy}
        >
          <Trash2 className="size-3.5 text-red-500" />
        </Button>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <Landmark className="size-6 text-primary" />
            المتحف الرقمي
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            إدارة مقتنيات المتحف والصور والفيديوهات المنشورة على الموقع العام.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <a href={PUBLIC_PAGE_URL} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="size-4" />
              عرض الصفحة العامة
            </a>
          </Button>
          <Button onClick={openCreateModal} className="gap-1.5">
            <Plus className="size-4" />
            إضافة قطعة
          </Button>
        </div>
      </div>

      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-border/60 bg-card p-4">
          <p className="text-xs text-muted-foreground">إجمالي القطع</p>
          <p className="mt-1 text-2xl font-semibold">{items.length}</p>
        </div>
        <div className="rounded-xl border border-border/60 bg-card p-4">
          <p className="text-xs text-muted-foreground">القطع المنشورة</p>
          <p className="mt-1 text-2xl font-semibold text-emerald-600">
            {publishedCount}
          </p>
        </div>
        <div className="rounded-xl border border-border/60 bg-card p-4">
          <p className="text-xs text-muted-foreground">الفيديوهات</p>
          <p className="mt-1 text-2xl font-semibold text-violet-600">
            {items.filter((item) => item.media_type === 'video').length}
          </p>
        </div>
      </div>

      {loadError && (
        <div className="mb-4 flex flex-col gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive sm:flex-row sm:items-center sm:justify-between">
          <span>{loadError}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchItems()}
            className="w-fit"
          >
            إعادة المحاولة
          </Button>
        </div>
      )}

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="ابحث بالعنوان أو الوصف أو الفئة..."
            className="h-9 pr-9"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            aria-label="البحث في مقتنيات المتحف"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="h-9 w-full lg:w-40" aria-label="تصفية حسب النوع">
            <SelectValue placeholder="النوع" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الأنواع</SelectItem>
            <SelectItem value="image">صور</SelectItem>
            <SelectItem value="video">فيديوهات</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-9 w-full lg:w-44" aria-label="تصفية حسب الحالة">
            <SelectValue placeholder="الحالة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الحالات</SelectItem>
            <SelectItem value="published">منشور</SelectItem>
            <SelectItem value="draft">غير منشور</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Desktop list */}
      <div className="hidden overflow-hidden rounded-xl border border-border/60 bg-card md:block">
        <div className="overflow-x-auto">
          <Table className="min-w-[860px]">
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">الوسائط</TableHead>
                <TableHead>القطعة</TableHead>
                <TableHead className="w-24">النوع</TableHead>
                <TableHead className="w-20">الترتيب</TableHead>
                <TableHead className="w-44">الحالة</TableHead>
                <TableHead className="w-52">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            {loading ? (
              <TableSkeleton />
            ) : filteredItems.length === 0 ? (
              <TableBody>
                <TableRow>
                  <TableCell colSpan={6}>
                    <EmptyState
                      hasItems={items.length > 0}
                      hasFilters={hasActiveFilters}
                      onCreate={openCreateModal}
                      onClearFilters={() => {
                        setSearch('')
                        setTypeFilter('all')
                        setStatusFilter('all')
                      }}
                    />
                  </TableCell>
                </TableRow>
              </TableBody>
            ) : (
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <MediaThumb item={item} className="size-11" />
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[320px]">
                        <p className="truncate font-medium">{item.title}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {item.category || 'بدون فئة'}
                          {item.description ? ` · ${item.description}` : ''}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <TypeBadge type={item.media_type} />
                    </TableCell>
                    <TableCell className="text-sm tabular-nums text-muted-foreground">
                      {item.display_order}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={item.is_published}
                          disabled={togglingId === item.id}
                          onCheckedChange={(checked) =>
                            handleTogglePublished(item, checked)
                          }
                          aria-label={`${item.is_published ? 'إلغاء نشر' : 'نشر'} ${item.title}`}
                        />
                        <StatusBadge published={item.is_published} />
                      </div>
                    </TableCell>
                    <TableCell>{renderActions(item)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            )}
          </Table>
        </div>
      </div>

      {/* Mobile / tablet cards */}
      <div className="space-y-3 md:hidden">
        {loading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-36 animate-pulse rounded-xl border border-border/60 bg-card"
            />
          ))
        ) : filteredItems.length === 0 ? (
          <div className="rounded-xl border border-border/60 bg-card">
            <EmptyState
              hasItems={items.length > 0}
              hasFilters={hasActiveFilters}
              onCreate={openCreateModal}
              onClearFilters={() => {
                setSearch('')
                setTypeFilter('all')
                setStatusFilter('all')
              }}
            />
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-border/60 bg-card p-3"
            >
              <div className="flex gap-3">
                <MediaThumb item={item} className="size-20" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{item.title}</p>
                  <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                    {item.description || 'بدون وصف'}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <TypeBadge type={item.media_type} />
                    <StatusBadge published={item.is_published} />
                    {item.category && (
                      <Badge variant="outline">{item.category}</Badge>
                    )}
                    <span className="text-xs text-muted-foreground">
                      الترتيب: {item.display_order}
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between gap-2 border-t border-border/60 pt-2">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={item.is_published}
                    disabled={togglingId === item.id}
                    onCheckedChange={(checked) =>
                      handleTogglePublished(item, checked)
                    }
                    aria-label={`${item.is_published ? 'إلغاء نشر' : 'نشر'} ${item.title}`}
                  />
                  <span className="text-xs text-muted-foreground">
                    {item.is_published ? 'منشور' : 'غير منشور'}
                  </span>
                </div>
                {renderActions(item)}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create / edit form */}
      <Dialog
        open={modalOpen}
        onOpenChange={(open) => {
          if (!open) closeModal()
        }}
      >
        <DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'تعديل قطعة متحف' : 'إضافة قطعة إلى المتحف'}
            </DialogTitle>
            <DialogDescription>
              أضف الصورة أو الفيديو، واملأ البيانات ثم انشر القطعة عندما تصبح
              جاهزة. لن تظهر القطع غير المنشورة للزوار.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">
            <div className="space-y-2">
              <Label htmlFor="museum-title">العنوان *</Label>
              <Input
                id="museum-title"
                value={form.title}
                onChange={(event) =>
                  handleFormChange('title', event.target.value)
                }
                placeholder="مثال: قطعة أثرية من تراث سوس"
                className="h-11 text-base"
                aria-invalid={!!errors.title}
              />
              {errors.title && (
                <p className="text-xs text-red-500">{errors.title}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="museum-description">الوصف</Label>
              <Textarea
                id="museum-description"
                value={form.description}
                onChange={(event) =>
                  handleFormChange('description', event.target.value)
                }
                placeholder="وصف مختصر للقطعة، أصلها، أو قصتها..."
                rows={4}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>اختياري</span>
                <span dir="ltr">{form.description.length}/2000</span>
              </div>
              {errors.description && (
                <p className="text-xs text-red-500">{errors.description}</p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="museum-media-type">نوع الوسائط *</Label>
                <Select
                  value={form.media_type}
                  onValueChange={handleMediaTypeChange}
                >
                  <SelectTrigger id="museum-media-type" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="image">صورة</SelectItem>
                    <SelectItem value="video">فيديو</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="museum-category">الفئة</Label>
                <Input
                  id="museum-category"
                  value={form.category}
                  onChange={(event) =>
                    handleFormChange('category', event.target.value)
                  }
                  placeholder="مثال: تراث، مستكشفات، وثائق"
                  className="h-11 text-base"
                />
                {errors.category && (
                  <p className="text-xs text-red-500">{errors.category}</p>
                )}
              </div>
            </div>

            <div className="space-y-3 rounded-xl border border-border/60 bg-muted/20 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <Label htmlFor="museum-media-file">
                    {form.media_type === 'video'
                      ? 'ملف الفيديو'
                      : 'ملف الصورة'}{' '}
                    *
                  </Label>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {form.media_type === 'video'
                      ? 'MP4 أو WebM أو Ogg — بحد أقصى 100 MB.'
                      : 'JPG أو PNG أو WebP أو GIF أو AVIF — بحد أقصى 20 MB.'}
                  </p>
                </div>
                <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium hover:bg-muted">
                  <Upload className="size-3.5" />
                  اختيار ملف
                  <input
                    id="museum-media-file"
                    type="file"
                    className="hidden"
                    accept={
                      form.media_type === 'video'
                        ? MUSEUM_VIDEO_ACCEPT
                        : MUSEUM_IMAGE_ACCEPT
                    }
                    onChange={(event) => {
                      handleMediaFile(event.target.files?.[0])
                      event.target.value = ''
                    }}
                  />
                </label>
              </div>

              {previewSrc ? (
                <div className="relative overflow-hidden rounded-lg border border-border/60 bg-black/5">
                  {form.media_type === 'video' ? (
                    <video
                      key={previewSrc}
                      src={previewSrc}
                      poster={previewThumbnail || undefined}
                      controls
                      playsInline
                      preload="metadata"
                      className="mx-auto max-h-64 w-full bg-black object-contain"
                    />
                  ) : (
                    <img
                      key={previewSrc}
                      src={previewSrc}
                      alt={form.title || 'معاينة الصورة'}
                      className="mx-auto max-h-64 w-full object-contain"
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      clearMediaSelection()
                      handleFormChange('media_url', '')
                    }}
                    className="absolute top-2 left-2 flex size-7 items-center justify-center rounded-full bg-black/65 text-white shadow hover:bg-black/80"
                    aria-label="إزالة الوسائط"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ) : (
                <div className="flex h-28 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border text-muted-foreground">
                  {form.media_type === 'video' ? (
                    <Film className="size-6" />
                  ) : (
                    <ImagePlus className="size-6" />
                  )}
                  <span className="text-xs">لم يتم اختيار وسائط بعد</span>
                </div>
              )}

              {mediaFile && (
                <p className="text-xs text-muted-foreground">
                  الملف المحدد: {mediaFile.name}
                </p>
              )}

              <div className="space-y-2">
                <Label htmlFor="museum-media-url">
                  أو رابط وسائط مباشر
                </Label>
                <Input
                  id="museum-media-url"
                  value={form.media_url}
                  onChange={(event) =>
                    handleFormChange('media_url', event.target.value)
                  }
                  placeholder="https://..."
                  dir="ltr"
                  className="h-10 text-left text-sm"
                  aria-invalid={!!errors.media_url}
                />
                {errors.media_url && (
                  <p className="text-xs text-red-500">{errors.media_url}</p>
                )}
              </div>
            </div>

            <div className="space-y-3 rounded-xl border border-border/60 p-4">
              <div>
                <Label htmlFor="museum-thumb-file">
                  صورة مصغرة / غلاف الفيديو
                </Label>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  يُنصح بها للفيديوهات. تظهر في البطاقة قبل التشغيل.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {previewThumbnail ? (
                  <div className="relative">
                    <img
                      key={previewThumbnail}
                      src={previewThumbnail}
                      alt="معاينة الصورة المصغرة"
                      className="h-20 w-20 rounded-lg border object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        clearThumbnailSelection()
                        handleFormChange('thumbnail_url', '')
                      }}
                      className="absolute -top-1.5 -left-1.5 flex size-6 items-center justify-center rounded-full bg-red-500 text-white shadow"
                      aria-label="إزالة الصورة المصغرة"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex size-20 items-center justify-center rounded-lg border border-dashed border-border text-muted-foreground">
                    <ImagePlus className="size-5" />
                  </div>
                )}
                <div className="min-w-[180px] flex-1 space-y-2">
                  <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium hover:bg-muted">
                    <Upload className="size-3.5" />
                    اختيار صورة
                    <input
                      id="museum-thumb-file"
                      type="file"
                      className="hidden"
                      accept={MUSEUM_IMAGE_ACCEPT}
                      onChange={(event) => {
                        handleThumbnailFile(event.target.files?.[0])
                        event.target.value = ''
                      }}
                    />
                  </label>
                  <Input
                    value={form.thumbnail_url}
                    onChange={(event) =>
                      handleFormChange('thumbnail_url', event.target.value)
                    }
                    placeholder="أو رابط الصورة المصغرة https://..."
                    dir="ltr"
                    className="h-9 text-left text-sm"
                  />
                  {thumbnailFile && (
                    <p className="text-xs text-muted-foreground">
                      الملف المحدد: {thumbnailFile.name}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="museum-order">ترتيب العرض</Label>
                <Input
                  id="museum-order"
                  type="number"
                  min={0}
                  step={1}
                  value={form.display_order}
                  onChange={(event) =>
                    handleFormChange('display_order', event.target.value)
                  }
                  className="h-11 text-base"
                  aria-invalid={!!errors.display_order}
                />
                <p className="text-xs text-muted-foreground">
                  الأرقام الأصغر تظهر أولًا في الصفحة العامة.
                </p>
                {errors.display_order && (
                  <p className="text-xs text-red-500">
                    {errors.display_order}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>حالة النشر</Label>
                <div className="flex h-11 items-center gap-3 rounded-lg border border-border px-3">
                  <Switch
                    checked={form.is_published}
                    onCheckedChange={(checked) =>
                      handleFormChange('is_published', checked)
                    }
                    aria-label="نشر القطعة"
                  />
                  <div className="flex items-center gap-2 text-sm">
                    {form.is_published ? (
                      <Eye className="size-4 text-emerald-600" />
                    ) : (
                      <EyeOff className="size-4 text-muted-foreground" />
                    )}
                    <span>
                      {form.is_published
                        ? 'ستظهر للزوار بعد الحفظ'
                        : 'لن تظهر للزوار'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={closeModal}
              disabled={saving}
              className="text-base"
            >
              إلغاء
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="text-base"
            >
              {saving && <Loader2 className="size-4 animate-spin" />}
              {saving
                ? 'جارٍ الحفظ...'
                : editingItem
                  ? 'تحديث القطعة'
                  : 'إضافة القطعة'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Admin preview */}
      <Dialog
        open={!!previewItem}
        onOpenChange={(open) => {
          if (!open) setPreviewItem(null)
        }}
      >
        <DialogContent className="max-w-4xl gap-0 overflow-hidden p-0">
          <DialogHeader className="border-b border-border/60 p-4 pb-3">
            <DialogTitle className="flex items-center gap-2">
              {previewItem?.media_type === 'video' ? (
                <Film className="size-5 text-violet-600" />
              ) : (
                <ImageIcon className="size-5 text-sky-600" />
              )}
              {previewItem?.title || 'معاينة القطعة'}
            </DialogTitle>
            {previewItem?.category && (
              <DialogDescription>{previewItem.category}</DialogDescription>
            )}
          </DialogHeader>
          <div className="flex max-h-[65vh] items-center justify-center bg-black">
            {previewItem?.media_type === 'video' ? (
              <video
                key={previewItem.id}
                src={previewItem.media_url}
                poster={previewItem.thumbnail_url || undefined}
                controls
                autoPlay
                playsInline
                className="max-h-[65vh] w-full"
              />
            ) : previewItem ? (
              <img
                src={previewItem.media_url}
                alt={previewItem.title}
                className="max-h-[65vh] w-full object-contain"
              />
            ) : null}
          </div>
          <div className="space-y-2 p-4">
            <p className="whitespace-pre-line text-sm text-muted-foreground">
              {previewItem?.description || 'لا يوجد وصف لهذه القطعة.'}
            </p>
            <p className="text-xs text-muted-foreground">
              آخر تحديث: {previewItem ? formatDate(previewItem.updated_at) : '—'}
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>حذف قطعة المتحف</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من حذف &ldquo;{deleteTarget?.title}&rdquo;؟ سيتم حذف
              السجل وملفاته المرفوعة من التخزين عندما لا تعد مستخدمة في قطعة
              أخرى. لا يمكن التراجع عن هذا الإجراء.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
            >
              إلغاء
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting && <Loader2 className="size-4 animate-spin" />}
              حذف نهائي
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function EmptyState({
  hasItems,
  hasFilters,
  onCreate,
  onClearFilters,
}: {
  hasItems: boolean
  hasFilters: boolean
  onCreate: () => void
  onClearFilters: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Landmark className="size-10 text-muted-foreground/40" />
      <p className="mt-3 text-sm font-medium text-muted-foreground">
        {hasItems ? 'لا توجد نتائج مطابقة' : 'لا توجد قطع في المتحف بعد'}
      </p>
      <p className="mt-1 max-w-sm text-xs text-muted-foreground/80">
        {hasItems
          ? 'جرّب تعديل كلمة البحث أو إزالة عوامل التصفية.'
          : 'أضف أول صورة أو فيديو لتبدأ في بناء المتحف الرقمي للجمعية.'}
      </p>
      <div className="mt-4 flex gap-2">
        {hasFilters && (
          <Button variant="outline" onClick={onClearFilters}>
            مسح التصفية
          </Button>
        )}
        {!hasItems && (
          <Button onClick={onCreate} className="gap-1.5">
            <Plus className="size-4" />
            إضافة أول قطعة
          </Button>
        )}
      </div>
    </div>
  )
}
