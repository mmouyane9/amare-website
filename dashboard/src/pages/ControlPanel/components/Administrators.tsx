import { useCallback, useEffect, useState } from 'react'
import { Loader2, Pencil, Trash2, UserPlus } from 'lucide-react'
import { toast } from 'sonner'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
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
import {
  createAdmin,
  deleteAdmin,
  listAdmins,
  updateAdmin,
  type AdminProfile,
} from '@/services/settings.service'

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?'
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function roleBadge(role: string | null): 'default' | 'secondary' | 'outline' {
  if (role === 'super_admin') return 'default'
  if (role === 'admin') return 'secondary'
  return 'outline'
}

function roleLabel(role: string | null): string {
  if (role === 'super_admin') return 'مدير عام'
  if (role === 'admin') return 'مشرف'
  return role ?? 'غير معروف'
}

interface AdminDraft {
  full_name: string
  email: string
  password: string
  role: string
}

const emptyDraft: AdminDraft = {
  full_name: '',
  email: '',
  password: '',
  role: 'super_admin',
}

export function Administrators() {
  const [admins, setAdmins] = useState<AdminProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<AdminProfile | null>(null)
  const [draft, setDraft] = useState<AdminDraft>(emptyDraft)
  const [saving, setSaving] = useState(false)
  const [removeTarget, setRemoveTarget] = useState<AdminProfile | null>(null)
  const [removing, setRemoving] = useState(false)

  const loadAdmins = useCallback(async () => {
    try {
      const data = await listAdmins()
      setAdmins(data)
    } catch {
      toast.error('فشل تحميل المسؤولين')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAdmins()
  }, [loadAdmins])

  const openAdd = () => {
    setEditing(null)
    setDraft(emptyDraft)
    setDialogOpen(true)
  }

  const openEdit = (admin: AdminProfile) => {
    setEditing(admin)
    setDraft({
      full_name: admin.full_name ?? '',
      email: admin.email ?? '',
      password: '',
      role: admin.role ?? 'super_admin',
    })
    setDialogOpen(true)
  }

  const handleSubmit = async () => {
    if (!draft.full_name.trim()) return
    if (!draft.email.trim()) return

    setSaving(true)
    try {
      if (editing) {
        await updateAdmin(editing.id, {
          full_name: draft.full_name,
          email: draft.email,
          role: draft.role,
        })
        toast.success('تم تحديث المسؤول')
      } else {
        if (!draft.password) {
          toast.error('كلمة المرور مطلوبة للمسؤولين الجدد')
          setSaving(false)
          return
        }
        await createAdmin(
          draft.email,
          draft.password,
          draft.full_name,
          draft.role,
        )
        toast.success('تم إنشاء المسؤول بنجاح')
      }
      setDialogOpen(false)
      await loadAdmins()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'فشل إنشاء المسؤول')
    } finally {
      setSaving(false)
    }
  }

  const handleRemove = async () => {
    if (!removeTarget) return
    setRemoving(true)
    try {
      await deleteAdmin(removeTarget.id)
      toast.success('تم حذف المسؤول بنجاح')
      setRemoveTarget(null)
      await loadAdmins()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'فشل حذف المسؤول')
    } finally {
      setRemoving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle>المسؤولون</CardTitle>
            <CardDescription>
              الأشخاص الذين لديهم صلاحية الوصول إلى لوحة الإدارة.
            </CardDescription>
          </div>
          <Button type="button" onClick={openAdd}>
            <UserPlus className="size-4" />
            إضافة مسؤول
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : admins.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm font-medium text-muted-foreground">
              لا يوجد مسؤولون.
            </p>
            <p className="mt-1 text-xs text-muted-foreground/70">
              أضف أول مسؤول للبدء.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>المسؤول</TableHead>
                <TableHead>الدور</TableHead>
                <TableHead className="hidden md:table-cell">تاريخ الإضافة</TableHead>
                <TableHead className="text-right">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {admins.map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                          {initials(admin.full_name ?? admin.email ?? '?')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex min-w-0 flex-col">
                        <span className="truncate text-sm font-medium text-foreground">
                          {admin.full_name ?? '—'}
                        </span>
                        <span className="truncate text-xs text-muted-foreground">
                          {admin.email ?? '—'}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={roleBadge(admin.role)}>
                      {roleLabel(admin.role)}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground md:table-cell">
                    {formatDate(admin.created_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        className="text-muted-foreground"
                        onClick={() => openEdit(admin)}
                        aria-label={`تعديل ${admin.full_name}`}
                      >
                        <Pencil className="size-3" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => setRemoveTarget(admin)}
                        aria-label={`حذف ${admin.full_name}`}
                      >
                        <Trash2 className="size-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing ? 'تعديل المسؤول' : 'إضافة مسؤول'}
            </DialogTitle>
            <DialogDescription>
              {editing
                ? 'تحديث تفاصيل هذا المسؤول.'
                : 'إنشاء حساب مسؤول جديد.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="admin-fullname">الاسم الكامل</Label>
              <Input
                id="admin-fullname"
                value={draft.full_name}
                onChange={(e) =>
                  setDraft({ ...draft, full_name: e.target.value })
                }
                placeholder="Sarah El Amrani"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="admin-email">البريد الإلكتروني</Label>
              <Input
                id="admin-email"
                type="email"
                value={draft.email}
                onChange={(e) =>
                  setDraft({ ...draft, email: e.target.value })
                }
                placeholder="name@amare.ma"
              />
            </div>
            {!editing && (
              <div className="space-y-1.5">
                <Label htmlFor="admin-password">كلمة المرور</Label>
                <Input
                  id="admin-password"
                  type="password"
                  value={draft.password}
                  onChange={(e) =>
                    setDraft({ ...draft, password: e.target.value })
                  }
                  placeholder="••••••••"
                />
              </div>
            )}
            <div className="space-y-1.5">
              <Label>الدور</Label>
              <Select
                value={draft.role}
                onValueChange={(value) =>
                  setDraft({ ...draft, role: value })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="اختر الدور" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="super_admin">مدير عام</SelectItem>
                  <SelectItem value="admin">مشرف</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDialogOpen(false)}
            >
              إلغاء
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={
                saving ||
                !draft.full_name.trim() ||
                !draft.email.trim()
              }
            >
              {saving && <Loader2 className="size-4 animate-spin" />}
              {editing ? 'حفظ التغييرات' : 'إنشاء مسؤول'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={removeTarget !== null}
        onOpenChange={(open) => !open && setRemoveTarget(null)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>حذف المسؤول؟</DialogTitle>
            <DialogDescription>
              {removeTarget?.full_name ?? removeTarget?.email} سيفقد صلاحية
              الوصول إلى لوحة الإدارة. لا يمكن التراجع عن هذا الإجراء.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setRemoveTarget(null)}
            >
              إلغاء
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleRemove}
              disabled={removing}
            >
              {removing && <Loader2 className="size-4 animate-spin" />}
              حذف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
