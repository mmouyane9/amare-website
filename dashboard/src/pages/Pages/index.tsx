import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  Eye,
  FileText,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  createPage,
  deletePage,
  duplicatePage,
  getPages,
  subscribeToPages,
  updatePage,
  type PageRow,
  type PageCreateInput,
  type PageUpdateInput,
} from '@/services/pages.service'
import { STATUS_LABEL, STATUS_OPTIONS, TEMPLATE_OPTIONS } from '@/types/content'

const PAGE_SIZE = 10

function statusBadgeClass(status: string): string {
  switch (status) {
    case 'published':
      return 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100'
    case 'draft':
      return 'bg-amber-100 text-amber-700 hover:bg-amber-100'
    case 'archived':
      return 'bg-muted text-muted-foreground hover:bg-muted'
    default:
      return 'bg-muted text-muted-foreground hover:bg-muted'
  }
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function slugToLabel(value: string): string {
  return value || '—'
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

const EMPTY_FORM: PageCreateInput = {
  title: '',
  slug: '',
  nav_title: '',
  template: 'default',
  status: 'draft',
}

export default function PagesPage() {
  const navigate = useNavigate()
  const [pages, setPages] = useState<PageRow[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [templateFilter, setTemplateFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [modalOpen, setModalOpen] = useState(false)
  const [editingPage, setEditingPage] = useState<PageRow | null>(null)
  const [form, setForm] = useState<PageCreateInput>(EMPTY_FORM)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const [deleteTarget, setDeleteTarget] = useState<PageRow | null>(null)
  const [deleting, setDeleting] = useState(false)

  const searchTimeout = useRef<ReturnType<typeof setTimeout>>(undefined)
  const [searchInput, setSearchInput] = useState('')

  const fetchPages = useCallback(
    async (p: number, s: string, status: string, template: string) => {
      setLoading(true)
      try {
        const result = await getPages({
          search: s || undefined,
          status: status !== 'all' ? status : undefined,
          template: template !== 'all' ? template : undefined,
          page: p,
          pageSize: PAGE_SIZE,
        })
        setPages(result.pages)
        setTotal(result.total)
        setTotalPages(result.totalPages)
      } catch (err) {
        console.error('Failed to load pages:', err)
        toast.error('فشل تحميل الصفحات')
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  useEffect(() => {
    fetchPages(currentPage, search, statusFilter, templateFilter)
  }, [currentPage, search, statusFilter, templateFilter, fetchPages])

  useEffect(() => {
    const channel = subscribeToPages(() => {
      fetchPages(currentPage, search, statusFilter, templateFilter)
    })
    return () => {
      channel.unsubscribe()
    }
  }, [currentPage, search, statusFilter, templateFilter, fetchPages])

  const handleSearchInput = (value: string) => {
    setSearchInput(value)
    if (searchTimeout.current) clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(() => {
      setSearch(value)
      setCurrentPage(1)
    }, 300)
  }

  const openCreateModal = () => {
    setEditingPage(null)
    setForm(EMPTY_FORM)
    setFormErrors({})
    setModalOpen(true)
  }

  const validateForm = (): Record<string, string> => {
    const errors: Record<string, string> = {}
    if (!form.title.trim()) errors.title = 'العنوان مطلوب'
    if (!form.slug.trim()) errors.slug = 'المسار مطلوب'
    if (form.slug && !/^[a-z0-9-/\u0600-\u06ff]+$/.test(form.slug))
      errors.slug = 'المسار يجب أن يحتوي على أحرف وأرقام وشرطات فقط'
    return errors
  }

  const handleSave = async () => {
    const errors = validateForm()
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    setSaving(true)
    try {
      if (editingPage) {
        const updates: PageUpdateInput = {
          title: form.title,
          slug: form.slug,
          nav_title: form.nav_title,
          template: form.template,
          status: form.status,
          sort_order: form.sort_order,
          is_featured: form.is_featured,
        }
        await updatePage(editingPage.id, updates)
        toast.success('تم تحديث الصفحة بنجاح')
      } else {
        await createPage(form)
        toast.success('تم إضافة الصفحة بنجاح')
      }
      setModalOpen(false)
      await fetchPages(currentPage, search, statusFilter, templateFilter)
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'فشل حفظ الصفحة'
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  const handleDuplicate = async (page: PageRow) => {
    try {
      await duplicatePage(page.id)
      toast.success('تم نسخ الصفحة بنجاح')
      await fetchPages(currentPage, search, statusFilter, templateFilter)
    } catch {
      toast.error('فشل نسخ الصفحة')
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deletePage(deleteTarget.id)
      toast.success('تم حذف الصفحة بنجاح')
      setDeleteTarget(null)
      await fetchPages(currentPage, search, statusFilter, templateFilter)
    } catch {
      toast.error('فشل حذف الصفحة')
    } finally {
      setDeleting(false)
    }
  }

  const totalPagesValue = Math.max(1, totalPages)

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">الصفحات</h2>
          <p className="text-sm text-muted-foreground">
            إدارة صفحات الموقع ومحتواها.
          </p>
        </div>
        <Button onClick={openCreateModal} className="gap-1.5">
          <Plus className="size-4" />
          إضافة صفحة
        </Button>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="ابحث بالعنوان أو المسار..."
            className="h-9 pr-9"
            value={searchInput}
            onChange={(e) => handleSearchInput(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1) }}>
          <SelectTrigger className="h-9 w-full sm:w-36">
            <SelectValue placeholder="الحالة" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={templateFilter} onValueChange={(v) => { setTemplateFilter(v); setCurrentPage(1) }}>
          <SelectTrigger className="h-9 w-full sm:w-40">
            <SelectValue placeholder="القالب" />
          </SelectTrigger>
          <SelectContent>
            {TEMPLATE_OPTIONS.map((opt) => (
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
              <TableHead>عنوان الصفحة</TableHead>
              <TableHead>المسار</TableHead>
              <TableHead>القالب</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>آخر تحديث</TableHead>
              <TableHead className="w-[140px]">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          {loading ? (
            <TableSkeleton />
          ) : pages.length === 0 ? (
            <TableBody>
              <TableRow>
                <TableCell colSpan={6}>
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <FileText className="size-10 text-muted-foreground/40" />
                    <p className="mt-3 text-sm font-medium text-muted-foreground">
                      لا توجد صفحات.
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground/70">
                      {search || statusFilter !== 'all' || templateFilter !== 'all'
                        ? 'جرّب تعديل البحث أو التصفية.'
                        : 'أضف أول صفحة للبدء.'}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          ) : (
            <TableBody>
              {pages.map((page) => (
                <TableRow key={page.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {page.is_featured && (
                        <span className="flex size-2 shrink-0 rounded-full bg-primary" />
                      )}
                      {page.is_homepage ? (
                        <span className="text-primary">🏠 {page.title}</span>
                      ) : (
                        page.nav_title || page.title
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground font-mono text-xs">
                    {slugToLabel(page.slug)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    <Badge variant="outline" className="font-normal">
                      {page.template}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusBadgeClass(page.status)}>
                      {STATUS_LABEL[page.status] ?? page.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {formatDate(page.updated_at)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => navigate(`/pages/${page.id}`)}
                        title="تحرير"
                      >
                        <Pencil className="size-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        title="معاينة"
                        onClick={() => window.open(page.slug, '_blank')}
                      >
                        <Eye className="size-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        title="نسخ"
                        onClick={() => handleDuplicate(page)}
                      >
                        <Copy className="size-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => setDeleteTarget(page)}
                        title="حذف"
                      >
                        <Trash2 className="size-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          )}
        </Table>
      </div>

      {totalPagesValue > 1 && !loading && (
        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <span>
            عرض {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, total)} من {total}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon-xs"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              <ChevronLeft className="size-3" />
            </Button>
            <span className="px-2 text-xs">
              {currentPage} / {totalPagesValue}
            </span>
            <Button
              variant="outline"
              size="icon-xs"
              disabled={currentPage >= totalPagesValue}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              <ChevronRight className="size-3" />
            </Button>
          </div>
        </div>
      )}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingPage ? 'تعديل الصفحة' : 'إضافة صفحة'}
            </DialogTitle>
            <DialogDescription>
              {editingPage
                ? 'قم بتحديث بيانات الصفحة أدناه.'
                : 'املأ البيانات لإضافة صفحة جديدة.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-1">
            <div className="col-span-2">
              <Label htmlFor="title">العنوان *</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => {
                  setForm((prev) => ({ ...prev, title: e.target.value }))
                  if (!editingPage && !form.slug) {
                    const slug = e.target.value
                      .toLowerCase()
                      .replace(/\s+/g, '-')
                      .replace(/[^a-z0-9\u0600-\u06ff-]/g, '')
                      .replace(/--+/g, '-')
                    setForm((prev) => ({ ...prev, slug: slug || prev.slug }))
                  }
                  setFormErrors((prev) => {
                    const next = { ...prev }
                    delete next.title
                    return next
                  })
                }}
                aria-invalid={!!formErrors.title}
              />
              {formErrors.title && (
                <p className="mt-1 text-xs text-destructive">{formErrors.title}</p>
              )}
            </div>
            <div className="col-span-2 sm:col-span-1">
              <Label htmlFor="slug">المسار *</Label>
              <Input
                id="slug"
                value={form.slug}
                onChange={(e) => {
                  setForm((prev) => ({ ...prev, slug: e.target.value }))
                  setFormErrors((prev) => {
                    const next = { ...prev }
                    delete next.slug
                    return next
                  })
                }}
                aria-invalid={!!formErrors.slug}
              />
              {formErrors.slug && (
                <p className="mt-1 text-xs text-destructive">{formErrors.slug}</p>
              )}
            </div>
            <div className="col-span-2 sm:col-span-1">
              <Label htmlFor="nav_title">عنوان القائمة</Label>
              <Input
                id="nav_title"
                value={form.nav_title ?? ''}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, nav_title: e.target.value }))
                }
              />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <Label htmlFor="template">القالب</Label>
              <Select
                value={form.template ?? 'default'}
                onValueChange={(v) =>
                  setForm((prev) => ({ ...prev, template: v }))
                }
              >
                <SelectTrigger id="template" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TEMPLATE_OPTIONS.filter((t) => t.value !== 'all').map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <Label htmlFor="status">الحالة</Label>
              <Select
                value={form.status ?? 'draft'}
                onValueChange={(v) =>
                  setForm((prev) => ({ ...prev, status: v }))
                }
              >
                <SelectTrigger id="status" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">مسودة</SelectItem>
                  <SelectItem value="published">منشور</SelectItem>
                  <SelectItem value="archived">مؤرشف</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setModalOpen(false)}
              disabled={saving}
            >
              إلغاء
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="mr-1 size-3 animate-spin" />}
              {editingPage ? 'تحديث' : 'حفظ'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>حذف الصفحة</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من حذف{' '}
              <span className="font-medium text-foreground">
                {deleteTarget?.title ?? 'هذه الصفحة'}
              </span>
              ؟ لا يمكن التراجع عن هذا الإجراء.
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
              {deleting && <Loader2 className="mr-1 size-3 animate-spin" />}
              حذف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
