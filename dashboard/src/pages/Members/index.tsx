import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
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
  createMember,
  deleteMember,
  getMembers,
  subscribeToMembers,
  updateMember,
  type Member,
  type MemberCreateInput,
} from '@/services/members.service'

const PAGE_SIZE = 10

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'pending', label: 'Pending' },
  { value: 'expired', label: 'Expired' },
]

const STATUS_BADGE_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  active: 'default',
  inactive: 'secondary',
  pending: 'outline',
  expired: 'destructive',
}

function statusBadge(status: string | null) {
  const s = status?.toLowerCase() ?? ''
  return STATUS_BADGE_VARIANT[s] ?? 'secondary'
}

function fullName(member: Member): string {
  const parts = [member.first_name, member.last_name].filter(Boolean)
  return parts.length > 0 ? parts.join(' ') : '—'
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', {
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
  if (!input.member_number?.trim()) errors.member_number = 'Membership number is required'
  if (!input.first_name?.trim()) errors.first_name = 'First name is required'
  if (!input.last_name?.trim()) errors.last_name = 'Last name is required'
  if (!input.status?.trim()) errors.status = 'Status is required'
  if (input.email && !validateEmail(input.email)) errors.email = 'Invalid email address'
  if (input.phone && !validatePhone(input.phone)) errors.phone = 'Invalid phone number'
  return errors
}

const EMPTY_FORM: MemberCreateInput = {
  member_number: '',
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  address: '',
  birth_date: '',
  birth_place: '',
  national_id: '',
  status: 'pending',
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
    birth_date: member.birth_date ?? '',
    birth_place: member.birth_place ?? '',
    national_id: member.national_id ?? '',
    status: member.status ?? 'pending',
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
    } catch {
      toast.error('Failed to load members')
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
        toast.success('Member updated successfully')
      } else {
        await createMember(form)
        toast.success('Member created successfully')
      }
      setModalOpen(false)
      await fetchMembers(page, search, statusFilter)
    } catch {
      toast.error(editingMember ? 'Failed to update member' : 'Failed to create member')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteMember(deleteTarget.id)
      toast.success('Member deleted successfully')
      setDeleteTarget(null)
      await fetchMembers(page, search, statusFilter)
    } catch {
      toast.error('Failed to delete member')
    } finally {
      setDeleting(false)
    }
  }

  const totalPagesValue = Math.max(1, totalPages)

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Members</h2>
          <p className="text-sm text-muted-foreground">
            Manage association members and their profiles.
          </p>
        </div>
        <Button onClick={openCreateModal} className="gap-1.5">
          <Plus className="size-4" />
          Add Member
        </Button>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by name, email, or membership number..."
            className="h-9 pl-9"
            value={searchInput}
            onChange={(e) => handleSearchInput(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={handleStatusChange}>
          <SelectTrigger className="h-9 w-full sm:w-40">
            <SelectValue placeholder="Filter by status" />
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
              <TableHead>Membership #</TableHead>
              <TableHead>Full Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Join Date</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
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
                      No members found.
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground/70">
                      {search || statusFilter !== 'all'
                        ? 'Try adjusting your search or filter.'
                        : 'Add your first member to get started.'}
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
                    <Badge variant={statusBadge(member.status)}>
                      {member.status ?? 'unknown'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(member.membership_date)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => openEditModal(member)}
                        title="Edit"
                      >
                        <Pencil className="size-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => setDeleteTarget(member)}
                        title="Delete"
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
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total}
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
              {editingMember ? 'Edit Member' : 'Add Member'}
            </DialogTitle>
            <DialogDescription>
              {editingMember
                ? 'Update the member details below.'
                : 'Fill in the details to add a new member.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid max-h-[60vh] grid-cols-2 gap-3 overflow-y-auto py-1">
            <div className="col-span-2 sm:col-span-1">
              <Label htmlFor="member_number">Membership Number *</Label>
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
              <Label htmlFor="status">Status *</Label>
              <Select
                value={form.status}
                onValueChange={(v) => handleFormChange('status', v)}
              >
                <SelectTrigger id="status" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="mt-1 text-xs text-destructive">{errors.status}</p>
              )}
            </div>
            <div className="col-span-2 sm:col-span-1">
              <Label htmlFor="first_name">First Name *</Label>
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
              <Label htmlFor="last_name">Last Name *</Label>
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
              <Label htmlFor="email">Email</Label>
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
              <Label htmlFor="phone">Phone</Label>
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
              <Label htmlFor="national_id">National ID</Label>
              <Input
                id="national_id"
                value={form.national_id}
                onChange={(e) => handleFormChange('national_id', e.target.value)}
              />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <Label htmlFor="birth_date">Birth Date</Label>
              <Input
                id="birth_date"
                type="date"
                value={form.birth_date}
                onChange={(e) => handleFormChange('birth_date', e.target.value)}
              />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <Label htmlFor="birth_place">Birth Place</Label>
              <Input
                id="birth_place"
                value={form.birth_place}
                onChange={(e) => handleFormChange('birth_place', e.target.value)}
              />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <Label htmlFor="membership_date">Join Date</Label>
              <Input
                id="membership_date"
                type="date"
                value={form.membership_date}
                onChange={(e) => handleFormChange('membership_date', e.target.value)}
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={form.address}
                onChange={(e) => handleFormChange('address', e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setModalOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="mr-1 size-3 animate-spin" />}
              {editingMember ? 'Update' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Member</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{' '}
              <span className="font-medium text-foreground">
                {deleteTarget ? fullName(deleteTarget) : 'this member'}
              </span>
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting && <Loader2 className="mr-1 size-3 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
