import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Eye,
  ImagePlus,
  Loader2,
  Newspaper,
  Pencil,
  Plus,
  Search,
  Trash2,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'

import { useAuth } from '@/contexts/AuthContext'
import { formatDate } from '@/lib/format'
import {
  createNews,
  deleteNews,
  deleteNewsImage,
  getNews,
  isSlugTaken,
  subscribeToNews,
  updateNews,
  uploadNewsImage,
} from '@/services/news.service'
import {
  NEWS_FILTER_OPTIONS,
  NEWS_STATUS_LABELS,
  type NewsArticle,
  type NewsCreateInput,
} from '@/types/news'

const EMPTY_FORM: NewsCreateInput = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  featured_image: '',
  status: 'draft',
  published_at: '',
  seo_title: '',
  seo_description: '',
}

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\u0600-\u06FF-]/g, '')
}

function toLocalInput(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function newsToForm(n: NewsArticle): NewsCreateInput {
  return {
    title: n.title ?? '',
    slug: n.slug ?? '',
    excerpt: n.excerpt ?? '',
    content: n.content ?? '',
    featured_image: n.featured_image ?? '',
    status:
      n.status === 'published' || n.status === 'archived' ? n.status : 'draft',
    published_at: n.published_at ? toLocalInput(n.published_at) : '',
    seo_title: n.seo_title ?? '',
    seo_description: n.seo_description ?? '',
  }
}

function statusBadgeClass(status: string): string {
  if (status === 'published') {
    return 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100'
  }
  if (status === 'archived') {
    return 'bg-muted text-muted-foreground hover:bg-muted'
  }
  return 'bg-amber-100 text-amber-700 hover:bg-amber-100'
}

function statusLabel(status: string | null): string {
  const s = status?.toLowerCase() ?? ''
  return NEWS_STATUS_LABELS[s] ?? status ?? '—'
}

function truncate(text: string | null, max = 40): string {
  if (!text) return '—'
  return text.length > max ? text.slice(0, max) + '…' : text
}

function TableSkeleton() {
  return (
    <TableBody>
      {Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i}>
          {Array.from({ length: 6 }).map((__, j) => (
            <TableCell key={j}>
              <span className="block h-4 w-16 animate-pulse rounded bg-muted" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  )
}

export default function NewsPage() {
  const { user } = useAuth()

  const [news, setNews] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const [modalOpen, setModalOpen] = useState(false)
  const [editingNews, setEditingNews] = useState<NewsArticle | null>(null)
  const [form, setForm] = useState<NewsCreateInput>(EMPTY_FORM)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [deleteTarget, setDeleteTarget] = useState<NewsArticle | null>(null)
  const [deleting, setDeleting] = useState(false)

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const searchTimeout = useRef<ReturnType<typeof setTimeout>>(undefined)

  const fetchNews = useCallback(async () => {
    setLoading(true)
    try {
      const result = await getNews({
        search: search || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      })
      setNews(result.news)
    } catch (err) {
      console.error('Failed to load news:', err)
      toast.error('فشل تحميل الأخبار')
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter])

  useEffect(() => {
    fetchNews()
  }, [fetchNews])

  useEffect(() => {
    const channel = subscribeToNews(() => {
      fetchNews()
    })
    return () => {
      channel.unsubscribe()
    }
  }, [fetchNews])

  const handleSearchInput = (value: string) => {
    setSearchInput(value)
    if (searchTimeout.current) clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(() => setSearch(value), 300)
  }

  const openCreateModal = () => {
    setEditingNews(null)
    setForm(EMPTY_FORM)
    setErrors({})
    setImageFile(null)
    setImagePreview(null)
    setModalOpen(true)
  }

  const openEditModal = (article: NewsArticle) => {
    setEditingNews(article)
    setForm(newsToForm(article))
    setErrors({})
    setImageFile(null)
    setImagePreview(null)
    setModalOpen(true)
  }

  const handleFormChange = (
    field: keyof NewsCreateInput,
    value: string,
  ) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value }
      if (field === 'title') {
        const generated = slugify(value)
        if (next.slug === '' || next.slug === slugify(prev.title)) {
          next.slug = generated
        }
      }
      return next
    })
    setErrors((prev) => {
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const validateForm = (f: NewsCreateInput): Record<string, string> => {
    const errs: Record<string, string> = {}
    if (!f.title.trim()) errs.title = 'العنوان مطلوب'
    if (!f.slug.trim()) errs.slug = 'الرابط المختصر مطلوب'
    return errs
  }

  const handleSave = async () => {
    const validationErrors = validateForm(form)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setSaving(true)
    try {
      let imageUrl = form.featured_image.trim()
      if (imageFile) {
        if (editingNews?.featured_image) {
          await deleteNewsImage(editingNews.featured_image).catch(() => {})
        }
        imageUrl = await uploadNewsImage(imageFile)
      }

      const payload = { ...form, featured_image: imageUrl, slug: form.slug.trim() }

      const taken = await isSlugTaken(payload.slug, editingNews?.id)
      if (taken) {
        setErrors({ slug: 'هذا الرابط المختصر مستخدم بالفعل' })
        setSaving(false)
        return
      }

      if (editingNews) {
        await updateNews(editingNews.id, payload)
        toast.success('تم تحديث الخبر')
      } else {
        await createNews(payload, user?.id ?? null)
        toast.success('تم إضافة الخبر')
      }

      setModalOpen(false)
      await fetchNews()
    } catch (err) {
      console.error('Failed to save news:', err)
      const message = err instanceof Error ? err.message : ''
      toast.error(
        /duplicate|unique|409|23505/i.test(message)
          ? 'هذا الرابط المختصر مستخدم بالفعل'
          : 'فشل حفظ الخبر',
      )
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteNews(deleteTarget.id)
      toast.success('تم حذف الخبر')
      setDeleteTarget(null)
      await fetchNews()
    } catch (err) {
      console.error('Failed to delete news:', err)
      toast.error('فشل حذف الخبر')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">الأخبار</h2>
          <p className="text-sm text-muted-foreground">
            نشر وإدارة المقالات الإخبارية.
          </p>
        </div>
        <Button onClick={openCreateModal} className="gap-1.5">
          <Plus className="size-4" />
          إضافة خبر
        </Button>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="ابحث بعنوان الخبر..."
            className="h-9 pr-9"
            value={searchInput}
            onChange={(e) => handleSearchInput(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-9 w-full sm:w-40">
            <SelectValue placeholder="تصفية حسب الحالة" />
          </SelectTrigger>
          <SelectContent>
            {NEWS_FILTER_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border border-border/60 bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">الصورة</TableHead>
              <TableHead>العنوان</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>تاريخ النشر</TableHead>
              <TableHead>تاريخ الإضافة</TableHead>
              <TableHead className="w-32">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          {loading ? (
            <TableSkeleton />
          ) : news.length === 0 ? (
            <TableBody>
              <TableRow>
                <TableCell colSpan={6}>
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <Newspaper className="size-10 text-muted-foreground/40" />
                    <p className="mt-3 text-sm font-medium text-muted-foreground">
                      لا توجد أخبار حالياً
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground/70">
                      {search || statusFilter !== 'all'
                        ? 'جرّب تعديل البحث أو التصفية.'
                        : 'أضف أول خبر للبدء.'}
                    </p>
                    <Button onClick={openCreateModal} className="mt-4 gap-1.5">
                      <Plus className="size-4" />
                      إضافة خبر
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          ) : (
            <TableBody>
              {news.map((article) => (
                <TableRow key={article.id}>
                  <TableCell>
                    {article.featured_image ? (
                      <img
                        src={article.featured_image}
                        alt={article.title}
                        className="size-10 rounded-lg object-cover"
                      />
                    ) : (
                      <span className="flex size-10 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-500/10">
                        <Newspaper className="size-4 text-blue-500" />
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{truncate(article.title, 40)}</div>
                    <div className="text-xs text-muted-foreground" dir="ltr">
                      /{article.slug}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusBadgeClass(article.status)}>
                      {statusLabel(article.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {article.published_at ? formatDate(article.published_at) : '—'}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(article.created_at)}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <a
                        href={`../News/article.html?slug=${encodeURIComponent(article.slug)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="عرض"
                      >
                        <Button variant="ghost" size="icon-xs">
                          <Eye className="size-3.5" />
                        </Button>
                      </a>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => openEditModal(article)}
                        title="تعديل"
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => setDeleteTarget(article)}
                        title="حذف"
                      >
                        <Trash2 className="size-3.5 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          )}
        </Table>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingNews ? 'تعديل الخبر' : 'إضافة خبر'}
            </DialogTitle>
            <DialogDescription>
              {editingNews
                ? 'قم بتحديث تفاصيل الخبر أدناه.'
                : 'املأ التفاصيل لإضافة خبر جديد.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label>الصورة الرئيسية</Label>
              <div className="flex items-start gap-3">
                {imagePreview || form.featured_image ? (
                  <div className="relative inline-block">
                    <img
                      src={imagePreview ?? form.featured_image}
                      alt="معاينة"
                      className="h-24 w-24 rounded-xl border object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null)
                        setImagePreview(null)
                        handleFormChange('featured_image', '')
                      }}
                      className="absolute -right-1 -top-1 flex size-6 items-center justify-center rounded-full bg-red-500 text-white shadow"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                ) : (
                  <label className="flex h-24 w-24 shrink-0 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/30 text-muted-foreground hover:bg-muted/50 transition-colors">
                    <ImagePlus className="size-6" />
                    <span className="text-xs font-medium">رفع صورة</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/svg+xml,image/gif"
                      className="hidden"
                      onChange={handleImageSelect}
                    />
                  </label>
                )}
                <div className="min-w-0 flex-1 space-y-2">
                  <Input
                    value={form.featured_image}
                    onChange={(e) => handleFormChange('featured_image', e.target.value)}
                    placeholder="أو ألصق رابط الصورة https://..."
                    className="h-11 text-base"
                  />
                  <p className="text-xs text-muted-foreground">
                    يمكنك رفع صورة أو لصق رابط مباشر للصورة.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nw-title">العنوان *</Label>
              <Input
                id="nw-title"
                value={form.title}
                onChange={(e) => handleFormChange('title', e.target.value)}
                placeholder="عنوان الخبر"
                className="h-11 text-base"
              />
              {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="nw-slug">الرابط المختصر (slug) *</Label>
              <Input
                id="nw-slug"
                value={form.slug}
                onChange={(e) => handleFormChange('slug', e.target.value)}
                placeholder="عنوان-الخبر"
                dir="ltr"
                className="h-11 text-base text-left"
              />
              {errors.slug && <p className="text-xs text-red-500">{errors.slug}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="nw-excerpt">الملخص</Label>
              <Textarea
                id="nw-excerpt"
                value={form.excerpt}
                onChange={(e) => handleFormChange('excerpt', e.target.value)}
                placeholder="ملخص قصير يظهر على بطاقة الخبر..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nw-content">المحتوى</Label>
              <Textarea
                id="nw-content"
                value={form.content}
                onChange={(e) => handleFormChange('content', e.target.value)}
                placeholder="نص المقال. اترك سطراً فارغاً بين الفقرات."
                rows={10}
              />
              <p className="text-xs text-muted-foreground">
                يظهر المحتوى في صفحة المقال العامة، ويفصل بين الفقرات بسطر فارغ.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nw-status">الحالة</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) =>
                    handleFormChange('status', v)
                  }
                >
                  <SelectTrigger id="nw-status" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">مسودة</SelectItem>
                    <SelectItem value="published">منشور</SelectItem>
                    <SelectItem value="archived">مؤرشف</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nw-published">تاريخ النشر</Label>
                <Input
                  id="nw-published"
                  type="datetime-local"
                  value={form.published_at}
                  onChange={(e) => handleFormChange('published_at', e.target.value)}
                  className="h-11 text-base"
                />
                <p className="text-xs text-muted-foreground">
                  عند النشر دون تحديد تاريخ، يُستخدم وقت النشر الحالي.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nw-seo-title">عنوان SEO</Label>
              <Input
                id="nw-seo-title"
                value={form.seo_title}
                onChange={(e) => handleFormChange('seo_title', e.target.value)}
                placeholder="عنوان تحسين محركات البحث (اختياري)"
                className="h-11 text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nw-seo-desc">وصف SEO</Label>
              <Textarea
                id="nw-seo-desc"
                value={form.seo_description}
                onChange={(e) => handleFormChange('seo_description', e.target.value)}
                placeholder="وصف تحسين محركات البحث (اختياري)"
                rows={2}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setModalOpen(false)} className="text-base">
              إلغاء
            </Button>
            <Button onClick={handleSave} disabled={saving} className="text-base">
              {saving && <Loader2 className="size-4 animate-spin" />}
              {editingNews ? 'تحديث الخبر' : 'إضافة الخبر'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!deleteTarget}
        onOpenChange={(v) => {
          if (!v) setDeleteTarget(null)
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>حذف الخبر</DialogTitle>
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
