import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Check,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
  RefreshCw,
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
import { Label } from '@/components/ui/label'
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
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import {
  createRenewalRequest,
  deleteRenewalRequest,
  fetchRenewalRequests,
  getRenewalStats,
  updateRenewalRequest,
  updateRenewalStatus,
  type RenewalCreateInput,
  type RenewalRequest,
  type RenewalStats,
} from '@/services/renewals.service'

const STATUS_OPTIONS = [
  { value: 'all', label: 'الجميع' },
  { value: 'pending', label: 'قيد المراجعة' },
  { value: 'approved', label: 'مقبول' },
  { value: 'rejected', label: 'مرفوض' },
]

const STATUS_LABEL: Record<string, string> = {
  pending: 'قيد المراجعة',
  approved: 'مقبول',
  rejected: 'مرفوض',
}

function statusBadgeClass(status: string): string {
  switch (status) {
    case 'pending':
      return 'bg-orange-100 text-orange-700 hover:bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400'
    case 'approved':
      return 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400'
    case 'rejected':
      return 'bg-red-100 text-red-700 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400'
    default:
      return 'bg-muted text-muted-foreground hover:bg-muted'
  }
}

function fullName(request: RenewalRequest): string {
  return [request.first_name, request.last_name].filter(Boolean).join(' ')
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const EMPTY_FORM: RenewalCreateInput = {
  membership_number: '',
  first_name: '',
  last_name: '',
  notes: '',
}

function fieldErrors(input: RenewalCreateInput): Record<string, string> {
  const errors: Record<string, string> = {}
  if (!input.membership_number?.trim()) errors.membership_number = 'رقم العضوية مطلوب'
  if (!input.first_name?.trim()) errors.first_name = 'الاسم الأول مطلوب'
  if (!input.last_name?.trim()) errors.last_name = 'الاسم الأخير مطلوب'
  return errors
}

interface StatCardProps {
  label: string
  value: number
  accent: string
}

function StatCard({ label, value, accent }: StatCardProps) {
  return (
    <Card className="flex-1">
      <CardContent className="flex flex-col items-center gap-1 py-4">
        <span className="text-2xl font-bold tracking-tight" style={{ color: accent }}>
          {value.toLocaleString()}
        </span>
        <span className="text-xs text-muted-foreground">{label}</span>
      </CardContent>
    </Card>
  )
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

export default function RenewalSection() {
  const [requests, setRequests] = useState<RenewalRequest[]>([])
  const [stats, setStats] = useState<RenewalStats>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  })
  const [loading, setLoading] = useState(true)
  const [statsLoading, setStatsLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const [modalOpen, setModalOpen] = useState(false)
  const [editingRequest, setEditingRequest] = useState<RenewalRequest | null>(null)
  const [form, setForm] = useState<RenewalCreateInput>(EMPTY_FORM)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [deleteTarget, setDeleteTarget] = useState<RenewalRequest | null>(null)
  const [deleting, setDeleting] = useState(false)

  const searchTimeout = useRef<ReturnType<typeof setTimeout>>(undefined)

  const loadData = useCallback(async (currentSearch: string, currentStatus: string) => {
    setLoading(true)
    try {
      const data = await fetchRenewalRequests({
        search: currentSearch || undefined,
        status: currentStatus !== 'all' ? currentStatus : undefined,
      })
      setRequests(data)
    } catch {
      toast.error('فشل تحميل طلبات التجديد')
    } finally {
      setLoading(false)
    }
  }, [])

  const loadStats = useCallback(async () => {
    setStatsLoading(true)
    try {
      const data = await getRenewalStats()
      setStats(data)
    } catch {
      toast.error('فشل تحميل الإحصائيات')
    } finally {
      setStatsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData(search, statusFilter)
  }, [search, statusFilter, loadData])

  useEffect(() => {
    loadStats()
  }, [loadStats])

  const handleSearchInput = (value: string) => {
    setSearchInput(value)
    if (searchTimeout.current) clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(() => {
      setSearch(value)
    }, 300)
  }

  const openCreateModal = () => {
    setEditingRequest(null)
    setForm(EMPTY_FORM)
    setErrors({})
    setModalOpen(true)
  }

  const openEditModal = (request: RenewalRequest) => {
    setEditingRequest(request)
    setForm({
      membership_number: request.membership_number,
      first_name: request.first_name,
      last_name: request.last_name,
      notes: request.notes ?? '',
    })
    setErrors({})
    setModalOpen(true)
  }

  const handleFormChange = (field: keyof RenewalCreateInput, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => {
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  const handleSave = async () => {
    const validationErrors = fieldErrors(form)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setSaving(true)
    try {
      if (editingRequest) {
        await updateRenewalRequest(editingRequest.id, {
          first_name: form.first_name,
          last_name: form.last_name,
          membership_number: form.membership_number,
          notes: form.notes || undefined,
        })
        toast.success('تم تحديث الطلب بنجاح')
      } else {
        await createRenewalRequest(form)
        toast.success('تم إضافة الطلب بنجاح')
      }
      setModalOpen(false)
      await Promise.all([loadData(search, statusFilter), loadStats()])
    } catch {
      toast.error(editingRequest ? 'فشل تحديث الطلب' : 'فشل إضافة الطلب')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteRenewalRequest(deleteTarget.id)
      toast.success('تم حذف الطلب بنجاح')
      setDeleteTarget(null)
      await Promise.all([loadData(search, statusFilter), loadStats()])
    } catch {
      toast.error('فشل حذف الطلب')
    } finally {
      setDeleting(false)
    }
  }

  const handleStatusChange = async (request: RenewalRequest, newStatus: string) => {
    const previousRequests = [...requests]
    setRequests((prev) =>
      prev.map((r) => (r.id === request.id ? { ...r, status: newStatus } : r)),
    )
    try {
      await updateRenewalStatus(request.id, newStatus)
      toast.success(
        newStatus === 'approved' ? 'تم قبول الطلب' : 'تم رفض الطلب',
      )
      await loadStats()
    } catch {
      setRequests(previousRequests)
      toast.error('فشل تحديث الحالة')
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            طلبات الانخراط الجديدة
          </h2>
          <p className="text-sm text-muted-foreground">
            إدارة طلبات تجديد العضوية.
          </p>
        </div>
        <Button onClick={openCreateModal} className="gap-1.5">
          <Plus className="size-4" />
          إضافة طلب تجديد
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {statsLoading ? (
          <>
            {['إجمالي الطلبات', 'قيد المراجعة', 'مقبولة', 'مرفوضة'].map((label) => (
              <Card key={label} className="flex-1">
                <CardContent className="flex flex-col items-center gap-1 py-4">
                  <span className="block h-7 w-10 animate-pulse rounded bg-muted" />
                  <span className="block h-3 w-16 animate-pulse rounded bg-muted" />
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
          <>
            <StatCard label="إجمالي الطلبات" value={stats.total} accent="var(--color-blue-600)" />
            <StatCard label="قيد المراجعة" value={stats.pending} accent="#f97316" />
            <StatCard label="مقبولة" value={stats.approved} accent="#16a34a" />
            <StatCard label="مرفوضة" value={stats.rejected} accent="#dc2626" />
          </>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="ابحث برقم العضوية أو الاسم..."
            className="h-9 pr-9"
            value={searchInput}
            onChange={(e) => handleSearchInput(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-9 w-full sm:w-44">
            <SelectValue placeholder="تصفية حسب الحالة" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((opt) => (
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
              <TableHead>رقم العضوية</TableHead>
              <TableHead>الاسم الكامل</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>تاريخ الطلب</TableHead>
              <TableHead>ملاحظات</TableHead>
              <TableHead className="w-[140px]">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          {loading ? (
            <TableSkeleton />
          ) : requests.length === 0 ? (
            <TableBody>
              <TableRow>
                <TableCell colSpan={6}>
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <RefreshCw className="size-10 text-muted-foreground/40" />
                    <p className="mt-3 text-sm font-medium text-muted-foreground">
                      لا توجد طلبات تجديد.
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground/70">
                      {search || statusFilter !== 'all'
                        ? 'جرّب تعديل البحث أو التصفية.'
                        : 'أضف أول طلب تجديد للبدء.'}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          ) : (
            <TableBody>
              {requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-mono text-xs">
                    {request.membership_number}
                  </TableCell>
                  <TableCell className="font-medium">
                    {fullName(request)}
                  </TableCell>
                  <TableCell>
                    <Badge className={cn(statusBadgeClass(request.status))}>
                      {STATUS_LABEL[request.status] ?? request.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(request.created_at)}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate text-muted-foreground">
                    {request.notes ?? '—'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {request.status === 'pending' && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            className="text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/50"
                            onClick={() => handleStatusChange(request, 'approved')}
                            title="قبول"
                          >
                            <Check className="size-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/50"
                            onClick={() => handleStatusChange(request, 'rejected')}
                            title="رفض"
                          >
                            <X className="size-3" />
                          </Button>
                        </>
                      )}
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => openEditModal(request)}
                        title="تعديل"
                      >
                        <Pencil className="size-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => setDeleteTarget(request)}
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

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingRequest ? 'تعديل طلب التجديد' : 'إضافة طلب تجديد'}
            </DialogTitle>
            <DialogDescription>
              {editingRequest
                ? 'قم بتحديث بيانات طلب التجديد أدناه.'
                : 'املأ البيانات لإضافة طلب تجديد جديد.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <div>
              <Label htmlFor="rn-membership_number">رقم العضوية *</Label>
              <Input
                id="rn-membership_number"
                value={form.membership_number}
                onChange={(e) => handleFormChange('membership_number', e.target.value)}
                aria-invalid={!!errors.membership_number}
              />
              {errors.membership_number && (
                <p className="mt-1 text-xs text-destructive">{errors.membership_number}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="rn-first_name">الاسم الأول *</Label>
                <Input
                  id="rn-first_name"
                  value={form.first_name}
                  onChange={(e) => handleFormChange('first_name', e.target.value)}
                  aria-invalid={!!errors.first_name}
                />
                {errors.first_name && (
                  <p className="mt-1 text-xs text-destructive">{errors.first_name}</p>
                )}
              </div>
              <div>
                <Label htmlFor="rn-last_name">الاسم الأخير *</Label>
                <Input
                  id="rn-last_name"
                  value={form.last_name}
                  onChange={(e) => handleFormChange('last_name', e.target.value)}
                  aria-invalid={!!errors.last_name}
                />
                {errors.last_name && (
                  <p className="mt-1 text-xs text-destructive">{errors.last_name}</p>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="rn-notes">ملاحظات</Label>
              <Textarea
                id="rn-notes"
                value={form.notes ?? ''}
                onChange={(e) => handleFormChange('notes', e.target.value)}
                rows={3}
              />
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
              {editingRequest ? 'تحديث' : 'حفظ'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>حذف طلب التجديد</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من حذف طلب{' '}
              <span className="font-medium text-foreground">
                {deleteTarget ? fullName(deleteTarget) : 'هذا الطلب'}
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
    </section>
  )
}
