import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Download,
  Image as ImageIcon,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
  Users,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  createMember,
  deleteMember,
  getMembers,
  subscribeToMembers,
  updateMember,
  updateMemberStatus,
  type Member,
  type MemberCreateInput,
} from '@/services/members.service'
import { generateMembershipPdfBlob, downloadPdf } from '@/lib/membershipPdf'

const PAGE_SIZE = 10

const STATUS_OPTIONS = [
  { value: 'all', label: 'جميع الحالات' },
  { value: 'active', label: 'نشط' },
  { value: 'inactive', label: 'غير نشط' },
]

const STATUS_LABEL: Record<string, string> = {
  active: 'نشط',
  inactive: 'غير نشط',
}

function statusBadgeClass(status: string | null): string {
  const s = status?.toLowerCase() ?? ''
  return s === 'active'
    ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100'
    : 'bg-muted text-muted-foreground hover:bg-muted'
}

function statusLabel(status: string | null): string {
  const s = status?.toLowerCase() ?? ''
  return STATUS_LABEL[s] ?? status ?? '—'
}

function fullName(member: Member): string {
  const parts = [member.first_name, member.last_name].filter(Boolean)
  return parts.length > 0 ? parts.join(' ') : '—'
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function validatePhone(phone: string): boolean {
  if (!phone) return true
  return /^[\d\s\-+()]{7,20}$/.test(phone)
}

function fieldErrors(input: MemberCreateInput): Record<string, string> {
  const errors: Record<string, string> = {}
  if (!input.member_number?.trim()) errors.member_number = 'رقم العضوية مطلوب'
  if (!input.first_name?.trim()) errors.first_name = 'الاسم الأول مطلوب'
  if (!input.last_name?.trim()) errors.last_name = 'الاسم الأخير مطلوب'
  if (!input.status?.trim()) errors.status = 'الحالة مطلوبة'
  if (input.email && !validateEmail(input.email)) errors.email = 'بريد إلكتروني غير صالح'
  if (input.phone && !validatePhone(input.phone)) errors.phone = 'رقم هاتف غير صالح'
  return errors
}

const EMPTY_FORM: MemberCreateInput = {
  member_number: '',
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  birth_date: '',
  birth_place: '',
  national_id: '',
  profession: '',
  status: 'active',
  membership_date: new Date().toISOString().split('T')[0],
}

function memberToForm(member: Member): MemberCreateInput {
  return {
    member_number: member.member_number ?? '',
    first_name: member.first_name ?? '',
    last_name: member.last_name ?? '',
    email: member.email ?? '',
    phone: member.phone ?? '',
    address: member.address ?? '',
    city: member.city ?? '',
    birth_date: member.birth_date ?? '',
    birth_place: member.birth_place ?? '',
    national_id: member.national_id ?? '',
    profession: member.profession ?? '',
    status: member.status ?? 'active',
    membership_date: member.membership_date?.split('T')[0] ?? '',
  }
}

function TableSkeleton() {
  return (
    <TableBody>
      {Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i}>
          {Array.from({ length: 9 }).map((__, j) => (
            <TableCell key={j}>
              <span className="block h-4 w-16 animate-pulse rounded bg-muted" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  )
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [modalOpen, setModalOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<Member | null>(null)
  const [form, setForm] = useState<MemberCreateInput>(EMPTY_FORM)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [generatingPdf, setGeneratingPdf] = useState<string | null>(null)

  const handleDownloadPdf = async (member: Member) => {
    setGeneratingPdf(member.id)
    try {
      const blob = await generateMembershipPdfBlob(member)
      downloadPdf(blob, member.member_number || member.id)
      toast.success('تم تحميل الوثيقة بنجاح')
    } catch (err) {
      console.error('PDF generation failed:', err)
      toast.error('فشل إنشاء وثيقة العضوية')
    } finally {
      setGeneratingPdf(null)
    }
  }

  const [deleteTarget, setDeleteTarget] = useState<Member | null>(null)
  const [deleting, setDeleting] = useState(false)

  const searchTimeout = useRef<ReturnType<typeof setTimeout>>(undefined)
  const [searchInput, setSearchInput] = useState('')

  const fetchMembers = useCallback(async (currentPage: number, currentSearch: string, currentStatus: string) => {
    setLoading(true)
    try {
      const result = await getMembers({
        search: currentSearch || undefined,
        status: currentStatus !== 'all' ? currentStatus : undefined,
        page: currentPage,
        pageSize: PAGE_SIZE,
      })
      setMembers(result.members)
      setTotal(result.total)
      setTotalPages(result.totalPages)
    } catch (err) {
      console.error('Failed to load members:', err)
      toast.error('فشل تحميل الأعضاء')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMembers(page, search, statusFilter)
  }, [page, search, statusFilter, fetchMembers])

  useEffect(() => {
    const channel = subscribeToMembers(() => {
      fetchMembers(page, search, statusFilter)
    })
    return () => {
      channel.unsubscribe()
    }
  }, [page, search, statusFilter, fetchMembers])

  const handleSearchInput = (value: string) => {
    setSearchInput(value)
    if (searchTimeout.current) clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(() => {
      setSearch(value)
      setPage(1)
    }, 300)
  }

  const handleStatusChange = (value: string) => {
    setStatusFilter(value)
    setPage(1)
  }

  const openCreateModal = () => {
    setEditingMember(null)
    setForm(EMPTY_FORM)
    setErrors({})
    setModalOpen(true)
  }

  const openEditModal = (member: Member) => {
    setEditingMember(member)
    setForm(memberToForm(member))
    setErrors({})
    setModalOpen(true)
  }

  const handleFormChange = (field: keyof MemberCreateInput, value: string) => {
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
      if (editingMember) {
        await updateMember(editingMember.id, form)
        toast.success('تم تحديث العضو بنجاح')
      } else {
        await createMember(form)
        toast.success('تم إضافة العضو بنجاح')
      }
      setModalOpen(false)
      await fetchMembers(page, search, statusFilter)
    } catch (err) {
      console.error(editingMember ? 'Failed to update member:' : 'Failed to create member:', err)
      toast.error(editingMember ? 'فشل تحديث العضو' : 'فشل إضافة العضو')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteMember(deleteTarget.id)
      toast.success('تم حذف العضو بنجاح')
      setDeleteTarget(null)
      await fetchMembers(page, search, statusFilter)
    } catch (err) {
      console.error('Failed to delete member:', err)
      toast.error('فشل حذف العضو')
    } finally {
      setDeleting(false)
    }
  }

  const handleStatusToggle = async (member: Member, newStatus: string) => {
    const previousMembers = [...members]
    setMembers((prev) =>
      prev.map((m) => (m.id === member.id ? { ...m, status: newStatus } : m)),
    )
    try {
      await updateMemberStatus(member.id, newStatus)
      toast.success('تم تحديث الحالة')
    } catch (err) {
      setMembers(previousMembers)
      console.error('Failed to update member status:', err)
      toast.error('فشل تحديث الحالة')
    }
  }

  const totalPagesValue = Math.max(1, totalPages)

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">الأعضاء</h2>
          <p className="text-sm text-muted-foreground">
            إدارة أعضاء الجمعية وبياناتهم.
          </p>
        </div>
        <Button onClick={openCreateModal} className="gap-1.5">
          <Plus className="size-4" />
          إضافة عضو
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="mb-4 grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-border/60 bg-card p-4">
          <p className="text-xs text-muted-foreground">إجمالي الأعضاء</p>
          <p className="text-2xl font-bold">{total}</p>
        </div>
        <div className="rounded-xl border border-border/60 bg-card p-4">
          <p className="text-xs text-muted-foreground">نشط</p>
          <p className="text-2xl font-bold text-emerald-600">
            {members.filter((m) => m.status === 'active').length}
          </p>
        </div>
        <div className="rounded-xl border border-border/60 bg-card p-4">
          <p className="text-xs text-muted-foreground">غير نشط</p>
          <p className="text-2xl font-bold text-muted-foreground">
            {members.filter((m) => m.status === 'inactive').length}
          </p>
        </div>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="ابحث برقم العضوية أو الاسم أو البريد الإلكتروني أو رقم الهاتف..."
            className="h-9 pr-9"
            value={searchInput}
            onChange={(e) => handleSearchInput(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={handleStatusChange}>
          <SelectTrigger className="h-9 w-full sm:w-40">
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
              <TableHead>البريد الإلكتروني</TableHead>
              <TableHead>رقم الهاتف</TableHead>
              <TableHead>العنوان</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>تاريخ الانضمام</TableHead>
              <TableHead className="w-[100px]">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          {loading ? (
            <TableSkeleton />
          ) : members.length === 0 ? (
            <TableBody>
              <TableRow>
                <TableCell colSpan={8}>
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <Users className="size-10 text-muted-foreground/40" />
                    <p className="mt-3 text-sm font-medium text-muted-foreground">
                      لا يوجد أعضاء.
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground/70">
                      {search || statusFilter !== 'all'
                        ? 'جرّب تعديل البحث أو التصفية.'
                        : 'أضف أول عضو للبدء.'}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          ) : (
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-mono text-xs">
                    {member.member_number ?? '—'}
                  </TableCell>
                  <TableCell className="font-medium">
                    {fullName(member)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {member.email ?? '—'}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {member.phone ?? '—'}
                  </TableCell>
                  <TableCell className="text-muted-foreground max-w-[200px] truncate">
                    {member.address ?? '—'}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="cursor-pointer">
                          <Badge className={statusBadgeClass(member.status)}>
                            {statusLabel(member.status)}
                          </Badge>
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        <DropdownMenuItem
                          onClick={() => handleStatusToggle(member, 'active')}
                        >
                          <Check
                            className={member.status === 'active' ? 'opacity-100' : 'opacity-0'}
                          />
                          <span className={member.status === 'active' ? 'font-medium' : ''}>
                            نشط
                          </span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleStatusToggle(member, 'inactive')}
                        >
                          <Check
                            className={member.status === 'inactive' ? 'opacity-100' : 'opacity-0'}
                          />
                          <span className={member.status === 'inactive' ? 'font-medium' : ''}>
                            غير نشط
                          </span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(member.membership_date)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => handleDownloadPdf(member)}
                        disabled={generatingPdf === member.id}
                        title="تحميل PDF"
                      >
                        {generatingPdf === member.id ? (
                          <Loader2 className="size-3 animate-spin" />
                        ) : (
                          <Download className="size-3" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => openEditModal(member)}
                        title="تعديل"
                      >
                        <Pencil className="size-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => setDeleteTarget(member)}
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
            عرض {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} من {total}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon-xs"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="size-3" />
            </Button>
            <span className="px-2 text-xs">
              {page} / {totalPagesValue}
            </span>
            <Button
              variant="outline"
              size="icon-xs"
              disabled={page >= totalPagesValue}
              onClick={() => setPage((p) => p + 1)}
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
              {editingMember ? 'تعديل العضو' : 'إضافة عضو'}
            </DialogTitle>
            <DialogDescription>
              {editingMember
                ? 'قم بتحديث بيانات العضو أدناه.'
                : 'املأ البيانات لإضافة عضو جديد.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid max-h-[60vh] grid-cols-2 gap-3 overflow-y-auto py-1">
            <div className="col-span-2 sm:col-span-1">
              <Label htmlFor="member_number">رقم العضوية *</Label>
              <Input
                id="member_number"
                value={form.member_number}
                onChange={(e) => handleFormChange('member_number', e.target.value)}
                aria-invalid={!!errors.member_number}
              />
              {errors.member_number && (
                <p className="mt-1 text-xs text-destructive">{errors.member_number}</p>
              )}
            </div>
            <div className="col-span-2 sm:col-span-1">
              <Label htmlFor="status">الحالة *</Label>
              <Select
                value={form.status}
                onValueChange={(v) => handleFormChange('status', v)}
              >
                <SelectTrigger id="status" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">نشط</SelectItem>
                  <SelectItem value="inactive">غير نشط</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="mt-1 text-xs text-destructive">{errors.status}</p>
              )}
            </div>
            <div className="col-span-2 sm:col-span-1">
              <Label htmlFor="first_name">الاسم الأول *</Label>
              <Input
                id="first_name"
                value={form.first_name}
                onChange={(e) => handleFormChange('first_name', e.target.value)}
                aria-invalid={!!errors.first_name}
              />
              {errors.first_name && (
                <p className="mt-1 text-xs text-destructive">{errors.first_name}</p>
              )}
            </div>
            <div className="col-span-2 sm:col-span-1">
              <Label htmlFor="last_name">الاسم الأخير *</Label>
              <Input
                id="last_name"
                value={form.last_name}
                onChange={(e) => handleFormChange('last_name', e.target.value)}
                aria-invalid={!!errors.last_name}
              />
              {errors.last_name && (
                <p className="mt-1 text-xs text-destructive">{errors.last_name}</p>
              )}
            </div>
            <div className="col-span-2 sm:col-span-1">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => handleFormChange('email', e.target.value)}
                aria-invalid={!!errors.email}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-destructive">{errors.email}</p>
              )}
            </div>
            <div className="col-span-2 sm:col-span-1">
              <Label htmlFor="phone">رقم الهاتف</Label>
              <Input
                id="phone"
                type="tel"
                value={form.phone}
                onChange={(e) => handleFormChange('phone', e.target.value)}
                aria-invalid={!!errors.phone}
              />
              {errors.phone && (
                <p className="mt-1 text-xs text-destructive">{errors.phone}</p>
              )}
            </div>
            <div className="col-span-2 sm:col-span-1">
              <Label htmlFor="national_id">رقم البطاقة الوطنية</Label>
              <Input
                id="national_id"
                value={form.national_id}
                onChange={(e) => handleFormChange('national_id', e.target.value)}
              />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <Label htmlFor="profession">المهنة</Label>
              <Input
                id="profession"
                value={form.profession ?? ''}
                onChange={(e) => handleFormChange('profession', e.target.value)}
              />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <Label htmlFor="city">المدينة</Label>
              <Input
                id="city"
                value={form.city ?? ''}
                onChange={(e) => handleFormChange('city', e.target.value)}
              />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <Label htmlFor="birth_date">تاريخ الميلاد</Label>
              <Input
                id="birth_date"
                type="date"
                value={form.birth_date}
                onChange={(e) => handleFormChange('birth_date', e.target.value)}
              />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <Label htmlFor="birth_place">مكان الميلاد</Label>
              <Input
                id="birth_place"
                value={form.birth_place}
                onChange={(e) => handleFormChange('birth_place', e.target.value)}
              />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <Label htmlFor="membership_date">تاريخ الانضمام</Label>
              <Input
                id="membership_date"
                type="date"
                value={form.membership_date}
                onChange={(e) => handleFormChange('membership_date', e.target.value)}
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="address">العنوان</Label>
              <Input
                id="address"
                value={form.address}
                onChange={(e) => handleFormChange('address', e.target.value)}
              />
            </div>
          </div>

          {editingMember && (editingMember.profile_photo_url || editingMember.national_id_front_url || editingMember.national_id_back_url) && (
            <div className="border-t pt-3 mt-2">
              <p className="mb-2 text-xs font-medium text-muted-foreground">المستندات</p>
              <div className="flex gap-3 flex-wrap">
                {editingMember.profile_photo_url && (
                  <a href={editingMember.profile_photo_url} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1">
                    <div className="h-16 w-16 overflow-hidden rounded-lg border">
                      <img src={editingMember.profile_photo_url} alt="الصورة الشخصية" className="size-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    </div>
                    <span className="text-[10px] text-muted-foreground">الصورة</span>
                  </a>
                )}
                {editingMember.national_id_front_url && (
                  <a href={editingMember.national_id_front_url} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1">
                    <div className="h-16 w-24 overflow-hidden rounded-lg border">
                      <img src={editingMember.national_id_front_url} alt="واجهة البطاقة" className="size-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    </div>
                    <span className="text-[10px] text-muted-foreground">البطاقة (أمام)</span>
                  </a>
                )}
                {editingMember.national_id_back_url && (
                  <a href={editingMember.national_id_back_url} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1">
                    <div className="h-16 w-24 overflow-hidden rounded-lg border">
                      <img src={editingMember.national_id_back_url} alt="ظهر البطاقة" className="size-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    </div>
                    <span className="text-[10px] text-muted-foreground">البطاقة (خلف)</span>
                  </a>
                )}
              </div>
            </div>
          )}

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
              {editingMember ? 'تحديث' : 'حفظ'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>حذف العضو</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من حذف{' '}
              <span className="font-medium text-foreground">
                {deleteTarget ? fullName(deleteTarget) : 'هذا العضو'}
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
