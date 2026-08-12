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
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import type { FooterTreeNode, FooterItemCreateInput, FooterColumn } from '@/types/footer'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (input: FooterItemCreateInput) => Promise<void>
  saving: boolean
  editingItem: FooterTreeNode | null
  columns: FooterColumn[]
  defaultColumnId?: string | null
  defaultParentId?: string | null
}

const LINK_TYPE_OPTIONS = [
  { value: 'url', label: 'رابط عادي' },
  { value: 'tel', label: 'هاتف (tel:)' },
  { value: 'mailto', label: 'بريد (mailto:)' },
  { value: 'map', label: 'خريطة' },
  { value: 'none', label: 'بدون رابط' },
]

export default function FooterModal({
  open,
  onOpenChange,
  onSave,
  saving,
  editingItem,
  columns,
  defaultColumnId,
  defaultParentId,
}: Props) {
  const [labelAr, setLabelAr] = useState('')
  const [labelFr, setLabelFr] = useState('')
  const [url, setUrl] = useState('')
  const [value, setValue] = useState('')
  const [linkType, setLinkType] = useState<'url' | 'tel' | 'mailto' | 'map' | 'none'>('url')
  const [columnId, setColumnId] = useState<string>('')
  const [parentId, setParentId] = useState<string>('')
  const [sortOrder, setSortOrder] = useState(0)
  const [isVisible, setIsVisible] = useState(true)
  const [openInNewTab, setOpenInNewTab] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const isEditing = !!editingItem

  useEffect(() => {
    if (editingItem) {
      setLabelAr(editingItem.label_ar || editingItem.title_ar || '')
      setLabelFr(editingItem.label_fr ?? '')
      setUrl(editingItem.url ?? '')
      setValue(editingItem.value ?? '')
      setLinkType(editingItem.link_type)
      setColumnId(editingItem.column_id ?? '')
      setParentId(editingItem.parent_id ?? '')
      setSortOrder(editingItem.sort_order)
      setIsVisible(editingItem.is_visible)
      setOpenInNewTab(editingItem.open_in_new_tab)
    } else {
      setLabelAr('')
      setLabelFr('')
      setUrl('')
      setValue('')
      setLinkType('url')
      setColumnId(defaultColumnId ?? '')
      setParentId(defaultParentId ?? '')
      setSortOrder(0)
      setIsVisible(true)
      setOpenInNewTab(false)
    }
    setErrors({})
  }, [open, editingItem, defaultColumnId, defaultParentId])

  const handleSubmit = async () => {
    const validationErrors: Record<string, string> = {}
    if (!labelAr.trim()) validationErrors.label_ar = 'اسم الرابط بالعربية مطلوب'
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    const input: FooterItemCreateInput = {
      label_ar: labelAr.trim(),
      label_fr: labelFr.trim() || undefined,
      url: url.trim() || undefined,
      value: value.trim() || undefined,
      link_type: linkType,
      column_id: columnId || undefined,
      parent_id: parentId && parentId !== 'none' ? parentId : undefined,
      sort_order: sortOrder,
      is_visible: isVisible,
      open_in_new_tab: openInNewTab,
    }

    await onSave(input)
  }

  const selectedColumn = columns.find((c) => c.id === columnId)

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
              : 'املأ البيانات لإضافة رابط جديد إلى القائمة السفلية.'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid max-h-[60vh] grid-cols-2 gap-3 overflow-y-auto py-1">
          <div className="col-span-2 sm:col-span-1">
            <Label htmlFor="footer-label-ar">اسم الرابط بالعربية *</Label>
            <Input
              id="footer-label-ar"
              value={labelAr}
              onChange={(e) => {
                setLabelAr(e.target.value)
                setErrors((prev) => {
                  const next = { ...prev }
                  delete next.label_ar
                  return next
                })
              }}
              aria-invalid={!!errors.label_ar}
            />
            {errors.label_ar && (
              <p className="mt-1 text-xs text-destructive">{errors.label_ar}</p>
            )}
          </div>

          <div className="col-span-2 sm:col-span-1">
            <Label htmlFor="footer-label-fr">اسم الرابط بالفرنسية</Label>
            <Input
              id="footer-label-fr"
              value={labelFr}
              onChange={(e) => setLabelFr(e.target.value)}
              placeholder="Accueil"
            />
          </div>

          <div className="col-span-2 sm:col-span-1">
            <Label htmlFor="footer-column">العمود</Label>
            <Select value={columnId} onValueChange={setColumnId}>
              <SelectTrigger id="footer-column">
                <SelectValue placeholder="اختر العمود" />
              </SelectTrigger>
              <SelectContent>
                {columns.map((col) => (
                  <SelectItem key={col.id} value={col.id}>
                    {col.label_ar || col.title_ar}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="col-span-2 sm:col-span-1">
            <Label htmlFor="footer-link-type">نوع الرابط</Label>
            <Select value={linkType} onValueChange={(v) => setLinkType(v as typeof linkType)}>
              <SelectTrigger id="footer-link-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LINK_TYPE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="col-span-2 sm:col-span-1">
            <Label htmlFor="footer-url">
              {linkType === 'tel'
                ? 'رقم الهاتف (مثال: +212...)'
                : linkType === 'mailto'
                  ? 'البريد الإلكتروني'
                  : linkType === 'map'
                    ? 'رابط الخريطة'
                    : 'الرابط'}
            </Label>
            <Input
              id="footer-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={
                linkType === 'tel'
                  ? 'tel:+212684869996'
                  : linkType === 'mailto'
                    ? 'mailto:example@domain.com'
                    : linkType === 'map'
                      ? 'https://www.google.com/maps?...'
                      : '#home'
              }
            />
          </div>

          {selectedColumn?.type === 'contact' && (
            <div className="col-span-2 sm:col-span-1">
              <Label htmlFor="footer-value">القيمة المعروضة</Label>
              <Input
                id="footer-value"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="ص.ب 749 أيت ملول 86150"
              />
            </div>
          )}

          <div className="col-span-2 sm:col-span-1">
            <Label htmlFor="footer-sort">الترتيب</Label>
            <Input
              id="footer-sort"
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value) || 0)}
            />
          </div>

          <div className="col-span-2 flex items-center justify-between gap-4 sm:col-span-1">
            <Label htmlFor="footer-visible" className="cursor-pointer">
              الحالة (ظاهر)
            </Label>
            <Switch
              id="footer-visible"
              checked={isVisible}
              onCheckedChange={setIsVisible}
              size="sm"
            />
          </div>

          <div className="col-span-2 flex items-center justify-between gap-4 sm:col-span-1">
            <Label htmlFor="footer-new-tab" className="cursor-pointer">
              يفتح في نافذة جديدة
            </Label>
            <Switch
              id="footer-new-tab"
              checked={openInNewTab}
              onCheckedChange={setOpenInNewTab}
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
