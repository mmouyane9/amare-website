import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Check,
  Eye,
  ExternalLink,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
  Trophy,
  X,
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
  createCompetitionRegistration,
  debugCompetitionAuth,
  deleteCompetitionRegistration,
  fetchCompetitionRegistrations,
  getCompetitionStats,
  updateCompetitionRegistration,
  updateCompetitionStatus,
  type CompetitionCreateInput,
  type CompetitionRegistration,
  type CompetitionStats,
} from '@/services/competition.service'

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

function fullName(reg: CompetitionRegistration): string {
  return [reg.first_name, reg.last_name].filter(Boolean).join(' ')
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const EMPTY_FORM: CompetitionFormState = {
  first_name: '',
  last_name: '',
  phone: '',
  city: '',
  payment_receipt_url: '',
  notes: '',
  status: 'pending',
}

function fieldErrors(input: CompetitionFormState): Record<string, string> {
  const errors: Record<string, string> = {}
  if (!input.first_name?.trim()) errors.first_name = 'الاسم الأول مطلوب'
  if (!input.last_name?.trim()) errors.last_name = 'الاسم الأخير مطلوب'
  if (!input.phone?.trim()) errors.phone = 'رقم الهاتف مطلوب'
  if (!input.city?.trim()) errors.city = 'المدينة مطلوبة'
  return errors
}

interface CompetitionFormState extends CompetitionCreateInput {
  status: string
}

const EDIT_FORM_STATUS_OPTIONS = [
  { value: 'pending', label: 'قيد المراجعة' },
  { value: 'approved', label: 'مقبول' },
  { value: 'rejected', label: 'مرفوض' },
]

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
          {Array.from({ length: 7 }).map((__, j) => (
            <TableCell key={j}>
              <span className="block h-4 w-16 animate-pulse rounded bg-muted" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  )
}

export default function CompetitionSection() {
  const [registrations, setRegistrations] = useState<CompetitionRegistration[]>([])
  const [stats, setStats] = useState<CompetitionStats>({
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
  const [editingRegistration, setEditingRegistration] = useState<CompetitionRegistration | null>(null)
  const [form, setForm] = useState<CompetitionFormState>(EMPTY_FORM)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [deleteTarget, setDeleteTarget] = useState<CompetitionRegistration | null>(null)
  const [deleting, setDeleting] = useState(false)

  const [viewTarget, setViewTarget] = useState<CompetitionRegistration | null>(null)

  const searchTimeout = useRef<ReturnType<typeof setTimeout>>(undefined)

  const loadData = useCallback(async (currentSearch: string, currentStatus: string) => {
    setLoading(true)
    try {
      const data = await fetchCompetitionRegistrations({
        search: currentSearch || undefined,
        status: currentStatus !== 'all' ? currentStatus : undefined,
      })
      setRegistrations(data)
    } catch (err) {
      console.error('loadData error:', err)
      toast.error('فشل تحميل بيانات المشاركين')
    } finally {
      setLoading(false)
    }
  }, [])

  const loadStats = useCallback(async () => {
    setStatsLoading(true)
    try {
      const data = await getCompetitionStats()
      setStats(data)
    } catch (err) {
      console.error('loadStats error:', err)
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

  useEffect(() => {
    debugCompetitionAuth()
  }, [])

  const handleSearchInput = (value: string) => {
    setSearchInput(value)
    if (searchTimeout.current) clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(() => {
      setSearch(value)
    }, 300)
  }

  const openCreateModal = () => {
    setEditingRegistration(null)
    setForm(EMPTY_FORM)
    setErrors({})
    setModalOpen(true)
  }

  const openEditModal = (reg: CompetitionRegistration) => {
    console.log('EDIT clicked, participant.id:', reg.id, 'name:', reg.first_name, reg.last_name)
    setEditingRegistration(reg)
    setForm({
      first_name: reg.first_name,
      last_name: reg.last_name,
      phone: reg.phone,
      city: reg.city,
      payment_receipt_url: reg.payment_receipt_url ?? '',
      notes: reg.notes ?? '',
      status: reg.status,
    })
    setErrors({})
    setModalOpen(true)
  }

  const handleFormChange = (field: keyof CompetitionFormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => {
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  const handleSave = async () => {
    console.log('SAVE clicked, editing:', !!editingRegistration, 'form:', form)
    const validationErrors = fieldErrors(form)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setSaving(true)
    try {
      if (editingRegistration) {
        await updateCompetitionRegistration(editingRegistration.id, {
          first_name: form.first_name,
          last_name: form.last_name,
          phone: form.phone,
          city: form.city,
          payment_receipt_url: form.payment_receipt_url || undefined,
          notes: form.notes || undefined,
          status: form.status,
        })
        toast.success('تم تحديث بيانات المشارك بنجاح')
      } else {
        const { status: _status, ...createPayload } = form
        await createCompetitionRegistration(createPayload)
        toast.success('تم إضافة المشارك بنجاح')
      }
      setModalOpen(false)
      await Promise.all([loadData(search, statusFilter), loadStats()])
    } catch (err) {
      console.error('handleSave error:', err)
      toast.error(err instanceof Error ? err.message : (editingRegistration ? 'فشل تحديث بيانات المشارك' : 'فشل إضافة المشارك'))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    console.log('DELETE clicked, participant.id:', deleteTarget?.id, 'name:', deleteTarget?.first_name, deleteTarget?.last_name)
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteCompetitionRegistration(deleteTarget.id)
      toast.success('تم حذف المشارك بنجاح')
      setDeleteTarget(null)
      await Promise.all([loadData(search, statusFilter), loadStats()])
    } catch (err) {
      console.error('handleDelete error:', err)
      toast.error(err instanceof Error ? err.message : 'فشل حذف المشارك')
    } finally {
      setDeleting(false)
    }
  }

  const handleStatusChange = async (reg: CompetitionRegistration, newStatus: string) => {
    console.log('STATUS change clicked, participant.id:', reg.id, 'newStatus:', newStatus)
    const previousRegistrations = [...registrations]
    setRegistrations((prev) =>
      prev.map((r) => (r.id === reg.id ? { ...r, status: newStatus } : r)),
    )
    try {
      await updateCompetitionStatus(reg.id, newStatus)
      toast.success(
        newStatus === 'approved' ? 'تم قبول المشارك' : 'تم رفض المشارك',
      )
      await loadStats()
    } catch (err) {
      setRegistrations(previousRegistrations)
      console.error('handleStatusChange error:', err)
      toast.error(err instanceof Error ? err.message : 'فشل تحديث الحالة')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            المشاركون في المسابقة
          </h2>
          <p className="text-sm text-muted-foreground">
            إدارة المشاركين في المسابقة الوطنية.
          </p>
        </div>
        <Button onClick={openCreateModal} className="gap-1.5">
          <Plus className="size-4" />
          إضافة مشارك
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {statsLoading ? (
          <>
            {['إجمالي المشاركين', 'قيد المراجعة', 'مقبولون', 'مرفوضون'].map((label) => (
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
            <StatCard label="إجمالي المشاركين" value={stats.total} accent="var(--color-blue-600)" />
            <StatCard label="قيد المراجعة" value={stats.pending} accent="#f97316" />
            <StatCard label="مقبولون" value={stats.approved} accent="#16a34a" />
            <StatCard label="مرفوضون" value={stats.rejected} accent="#dc2626" />
          </>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="ابحث بالاسم أو رقم الهاتف أو المدينة..."
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
              <TableHead>الاسم الكامل</TableHead>
              <TableHead>رقم الهاتف</TableHead>
              <TableHead>المدينة</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>تاريخ التسجيل</TableHead>
              <TableHead>وصل الأداء</TableHead>
              <TableHead className="w-[160px]">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          {loading ? (
            <TableSkeleton />
          ) : registrations.length === 0 ? (
            <TableBody>
              <TableRow>
                <TableCell colSpan={7}>
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <Trophy className="size-10 text-muted-foreground/40" />
                    <p className="mt-3 text-sm font-medium text-muted-foreground">
                      لا يوجد مشاركون.
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground/70">
                      {search || statusFilter !== 'all'
                        ? 'جرّب تعديل البحث أو التصفية.'
                        : 'أضف أول مشارك للبدء.'}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          ) : (
            <TableBody>
              {registrations.map((reg) => (
                <TableRow key={reg.id}>
                  <TableCell className="font-medium">
                    {fullName(reg)}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {reg.phone}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {reg.city}
                  </TableCell>
                  <TableCell>
                    <Badge className={cn(statusBadgeClass(reg.status))}>
                      {STATUS_LABEL[reg.status] ?? reg.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(reg.created_at)}
                  </TableCell>
                  <TableCell>
                    {reg.payment_receipt_url ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1 text-xs"
                        onClick={() => { window.open(reg.payment_receipt_url, '_blank') }}
                      >
                        <ExternalLink className="size-3" />
                        عرض الوصل
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => setViewTarget(reg)}
                        title="عرض"
                      >
                        <Eye className="size-3" />
                      </Button>
                      {reg.status === 'pending' && (
                        <>
                           <Button
                            variant="ghost"
                            size="icon-xs"
                            className="text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/50"
                            onClick={() => { console.log('APPROVE clicked', reg.id); handleStatusChange(reg, 'approved') }}
                            title="قبول"
                          >
                            <Check className="size-3" />
                          </Button>
                           <Button
                            variant="ghost"
                            size="icon-xs"
                            className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/50"
                            onClick={() => { console.log('REJECT clicked', reg.id); handleStatusChange(reg, 'rejected') }}
                            title="رفض"
                          >
                            <X className="size-3" />
                          </Button>
                        </>
                      )}
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => openEditModal(reg)}
                        title="تعديل"
                      >
                        <Pencil className="size-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => setDeleteTarget(reg)}
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
              {editingRegistration ? 'تعديل بيانات المشارك' : 'إضافة مشارك'}
            </DialogTitle>
            <DialogDescription>
              {editingRegistration
                ? 'قم بتحديث بيانات المشارك أدناه.'
                : 'املأ البيانات لإضافة مشارك جديد.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="c-first_name">الاسم الأول *</Label>
                <Input
                  id="c-first_name"
                  value={form.first_name}
                  onChange={(e) => handleFormChange('first_name', e.target.value)}
                  aria-invalid={!!errors.first_name}
                />
                {errors.first_name && (
                  <p className="mt-1 text-xs text-destructive">{errors.first_name}</p>
                )}
              </div>
              <div>
                <Label htmlFor="c-last_name">الاسم الأخير *</Label>
                <Input
                  id="c-last_name"
                  value={form.last_name}
                  onChange={(e) => handleFormChange('last_name', e.target.value)}
                  aria-invalid={!!errors.last_name}
                />
                {errors.last_name && (
                  <p className="mt-1 text-xs text-destructive">{errors.last_name}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="c-phone">رقم الهاتف *</Label>
                <Input
                  id="c-phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => handleFormChange('phone', e.target.value)}
                  aria-invalid={!!errors.phone}
                />
                {errors.phone && (
                  <p className="mt-1 text-xs text-destructive">{errors.phone}</p>
                )}
              </div>
              <div>
                <Label htmlFor="c-city">المدينة *</Label>
                <Input
                  id="c-city"
                  value={form.city}
                  onChange={(e) => handleFormChange('city', e.target.value)}
                  aria-invalid={!!errors.city}
                />
                {errors.city && (
                  <p className="mt-1 text-xs text-destructive">{errors.city}</p>
                )}
              </div>
            </div>
            {editingRegistration && (
              <div>
                <Label htmlFor="c-status">الحالة</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => handleFormChange('status', v)}
                >
                  <SelectTrigger id="c-status" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EDIT_FORM_STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div>
              <Label htmlFor="c-receipt">رابط وصل الأداء</Label>
              <Input
                id="c-receipt"
                value={form.payment_receipt_url ?? ''}
                onChange={(e) => handleFormChange('payment_receipt_url', e.target.value)}
                placeholder="https://..."
              />
            </div>
            <div>
              <Label htmlFor="c-notes">ملاحظات</Label>
              <Textarea
                id="c-notes"
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
              {editingRegistration ? 'تحديث' : 'حفظ'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>حذف المشارك</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من حذف{' '}
              <span className="font-medium text-foreground">
                {deleteTarget ? fullName(deleteTarget) : 'هذا المشارك'}
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

      <Dialog open={!!viewTarget} onOpenChange={(open) => { if (!open) setViewTarget(null) }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>تفاصيل المشارك</DialogTitle>
          </DialogHeader>
          {viewTarget && (
            <div className="grid gap-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-muted-foreground">الاسم الكامل</span>
                <span className="font-medium">{fullName(viewTarget)}</span>
                <span className="text-muted-foreground">رقم الهاتف</span>
                <span className="font-mono">{viewTarget.phone}</span>
                <span className="text-muted-foreground">المدينة</span>
                <span>{viewTarget.city}</span>
                <span className="text-muted-foreground">الحالة</span>
                <span>
                  <Badge className={cn(statusBadgeClass(viewTarget.status))}>
                    {STATUS_LABEL[viewTarget.status] ?? viewTarget.status}
                  </Badge>
                </span>
                <span className="text-muted-foreground">تاريخ التسجيل</span>
                <span>{formatDate(viewTarget.created_at)}</span>
                {viewTarget.notes && (
                  <>
                    <span className="text-muted-foreground">ملاحظات</span>
                    <span>{viewTarget.notes}</span>
                  </>
                )}
                {viewTarget.reviewed_at && (
                  <>
                    <span className="text-muted-foreground">تاريخ المراجعة</span>
                    <span>{formatDate(viewTarget.reviewed_at)}</span>
                  </>
                )}
              </div>
              {viewTarget.payment_receipt_url && (
                <Button
                  variant="outline"
                  className="gap-1.5"
                  onClick={() => window.open(viewTarget.payment_receipt_url, '_blank')}
                >
                  <ExternalLink className="size-4" />
                  عرض وصل الأداء
                </Button>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewTarget(null)}>
              إغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
