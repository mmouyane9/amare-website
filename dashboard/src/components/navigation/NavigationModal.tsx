import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
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
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import type {
  NavigationItemCreateInput,
  NavigationGroup,
  NavigationTreeNode,
} from '@/types/navigation'

const TYPE_OPTIONS = [
  { value: 'link', label: 'رابط' },
  { value: 'button', label: 'زر' },
  { value: 'header', label: 'عنوان' },
]

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (input: NavigationItemCreateInput) => Promise<void>
  saving: boolean
  editingItem: NavigationTreeNode | null
  allItems: NavigationTreeNode[]
  groups: NavigationGroup[]
  defaultParentId?: string | null
}

function flattenItems(items: NavigationTreeNode[], excludeId?: string | null): { id: string; label: string }[] {
  const result: { id: string; label: string }[] = []

  function walk(list: NavigationTreeNode[], depth: number) {
    for (const item of list) {
      if (item.id === excludeId) continue
      const prefix = item.children.length > 0 || depth > 0
        ? '\u00A0\u00A0'.repeat(Math.max(0, depth - 1)) + (item.children.length > 0 ? '└ ' : '\u00A0\u00A0\u00A0\u00A0')
        : ''
      result.push({ id: item.id, label: '\u00A0\u00A0'.repeat(depth) + prefix + item.title_ar })
      if (item.children.length > 0) {
        walk(item.children, depth + (item.children.length > 0 ? 1 : 0))
      }
    }
  }

  walk(items, 0)
  return result
}

export default function NavigationModal({
  open,
  onOpenChange,
  onSave,
  saving,
  editingItem,
  allItems,
  groups,
  defaultParentId,
}: Props) {
  const [titleAr, setTitleAr] = useState('')
  const [descriptionAr, setDescriptionAr] = useState('')
  const [url, setUrl] = useState('')
  const [type, setType] = useState<'link' | 'button' | 'header'>('link')
  const [groupId, setGroupId] = useState<string>('')
  const [parentId, setParentId] = useState<string>('')
  const [icon, setIcon] = useState('')
  const [targetBlank, setTargetBlank] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [sortOrder, setSortOrder] = useState(0)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const isEditing = !!editingItem
  const parentOptions = flattenItems(allItems, editingItem?.id)

  useEffect(() => {
    if (editingItem) {
      setTitleAr(editingItem.title_ar)
      setDescriptionAr(editingItem.description_ar ?? '')
      setUrl(editingItem.url ?? '')
      setType(editingItem.type)
      setGroupId(editingItem.group_id ?? '')
      setParentId(editingItem.parent_id ?? '')
      setIcon(editingItem.icon ?? '')
      setTargetBlank(editingItem.target_blank)
      setIsVisible(editingItem.is_visible)
      setSortOrder(editingItem.sort_order)
    } else {
      setTitleAr('')
      setDescriptionAr('')
      setUrl('')
      setType('link')
      setGroupId('')
      setParentId(defaultParentId ?? '')
      setIcon('')
      setTargetBlank(false)
      setIsVisible(true)
      setSortOrder(0)
    }
    setErrors({})
  }, [open, editingItem, defaultParentId])

  const handleSubmit = async () => {
    const validationErrors: Record<string, string> = {}
    if (!titleAr.trim()) validationErrors.title_ar = 'اسم الرابط مطلوب'

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    const input: NavigationItemCreateInput = {
      title_ar: titleAr.trim(),
      description_ar: descriptionAr.trim() || undefined,
      url: url.trim() || undefined,
      type,
      group_id: groupId && groupId !== 'none' ? groupId : undefined,
      parent_id: parentId && parentId !== 'none' ? parentId : undefined,
      icon: icon.trim() || undefined,
      target_blank: targetBlank,
      is_visible: isVisible,
      sort_order: sortOrder,
    }

    await onSave(input)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'تعديل الرابط' : 'إضافة رابط'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'قم بتحديث بيانات الرابط أدناه.'
              : 'املأ البيانات لإضافة رابط جديد إلى القائمة العلوية.'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid max-h-[60vh] grid-cols-2 gap-3 overflow-y-auto py-1">
          <div className="col-span-2">
            <Label htmlFor="nav-title-ar">اسم الرابط *</Label>
            <Input
              id="nav-title-ar"
              value={titleAr}
              onChange={(e) => {
                setTitleAr(e.target.value)
                setErrors((prev) => {
                  const next = { ...prev }
                  delete next.title_ar
                  return next
                })
              }}
              aria-invalid={!!errors.title_ar}
            />
            {errors.title_ar && (
              <p className="mt-1 text-xs text-destructive">{errors.title_ar}</p>
            )}
          </div>

          <div className="col-span-2">
            <Label htmlFor="nav-desc-ar">الوصف</Label>
            <Textarea
              id="nav-desc-ar"
              value={descriptionAr}
              onChange={(e) => setDescriptionAr(e.target.value)}
              placeholder="وصف قصير يظهر في القائمة المنسدلة..."
              rows={2}
            />
          </div>

          <div className="col-span-2 sm:col-span-1">
            <Label htmlFor="nav-url">الرابط</Label>
            <Input
              id="nav-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="/index.html"
            />
          </div>

          <div className="col-span-2 sm:col-span-1">
            <Label htmlFor="nav-type">النوع</Label>
            <Select value={type} onValueChange={(v) => setType(v as 'link' | 'button' | 'header')}>
              <SelectTrigger id="nav-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TYPE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="col-span-2 sm:col-span-1">
            <Label htmlFor="nav-group">المجموعة</Label>
            <Select value={groupId} onValueChange={setGroupId}>
              <SelectTrigger id="nav-group">
                <SelectValue placeholder="بدون مجموعة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">بدون مجموعة</SelectItem>
                {groups.map((g) => (
                  <SelectItem key={g.id} value={g.id}>
                    {g.name_ar}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="col-span-2 sm:col-span-1">
            <Label htmlFor="nav-parent">العنصر الأب</Label>
            <Select value={parentId} onValueChange={setParentId}>
              <SelectTrigger id="nav-parent">
                <SelectValue placeholder="رئيسي (بدون أب)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">رئيسي (بدون أب)</SelectItem>
                {parentOptions.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="col-span-2 sm:col-span-1">
            <Label htmlFor="nav-icon">الأيقونة</Label>
            <Input
              id="nav-icon"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              placeholder="Home, Users, Settings..."
            />
          </div>

          <div className="col-span-2 sm:col-span-1">
            <Label htmlFor="nav-sort">الترتيب</Label>
            <Input
              id="nav-sort"
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value) || 0)}
            />
          </div>

          <div className="col-span-2 flex items-center justify-between gap-4 sm:col-span-1">
            <Label htmlFor="nav-target-blank" className="cursor-pointer">
              يفتح في نافذة جديدة
            </Label>
            <Switch
              id="nav-target-blank"
              checked={targetBlank}
              onCheckedChange={setTargetBlank}
              size="sm"
            />
          </div>

          <div className="col-span-2 flex items-center justify-between gap-4 sm:col-span-1">
            <Label htmlFor="nav-visible" className="cursor-pointer">
              الحالة (ظاهر)
            </Label>
            <Switch
              id="nav-visible"
              checked={isVisible}
              onCheckedChange={setIsVisible}
              size="sm"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            إلغاء
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving && <Loader2 className="mr-1 size-3 animate-spin" />}
            {isEditing ? 'تحديث' : 'حفظ'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
