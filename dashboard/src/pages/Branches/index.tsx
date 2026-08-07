import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Building2,
  ChevronDown,
  ChevronLeft,
  Ellipsis,
  Loader2,
  MapPin,
  Pencil,
  Plus,
  Search,
  Trash2,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ImagePlus } from 'lucide-react'
import {
  EMPTY_REGION_FORM,
  MOCK_REGIONS,
  regionToForm,
  type Region,
  type RegionFormData,
} from '@/data/branches'

export default function BranchesPage() {
  const navigate = useNavigate()
  const [regions] = useState<Region[]>(MOCK_REGIONS)
  const [expandedRegions, setExpandedRegions] = useState<Set<string>>(new Set(['1']))
  const [searchQuery, setSearchQuery] = useState('')

  const [regionModalOpen, setRegionModalOpen] = useState(false)
  const [editingRegion, setEditingRegion] = useState<Region | null>(null)
  const [regionForm, setRegionForm] = useState<RegionFormData>(EMPTY_REGION_FORM)
  const [regionSaving, setRegionSaving] = useState(false)

  const [deleteRegionTarget, setDeleteRegionTarget] = useState<Region | null>(null)
  const [deletingRegion, setDeletingRegion] = useState(false)

  const filteredRegions = regions.filter((r) =>
    r.name.includes(searchQuery),
  )

  const toggleRegion = (id: string) => {
    setExpandedRegions((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleRegionFormChange = (field: keyof RegionFormData, value: string) => {
    setRegionForm((prev) => {
      const next = { ...prev, [field]: value }
      if (field === 'name') {
        next.slug = value
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9\u0600-\u06FF-]/g, '')
      }
      return next
    })
  }

  const openRegionCreate = () => {
    setEditingRegion(null)
    setRegionForm(EMPTY_REGION_FORM)
    setRegionModalOpen(true)
  }

  const openRegionEdit = (region: Region) => {
    setEditingRegion(region)
    setRegionForm(regionToForm(region))
    setRegionModalOpen(true)
  }

  const handleRegionSave = () => {
    setRegionSaving(true)
    setTimeout(() => {
      setRegionSaving(false)
      setRegionModalOpen(false)
    }, 500)
  }

  const handleRegionDelete = () => {
    setDeletingRegion(true)
    setTimeout(() => {
      setDeletingRegion(false)
      setDeleteRegionTarget(null)
    }, 500)
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">الفروع الجهوية</h2>
          <p className="text-sm text-muted-foreground">
            إدارة الجهات والمدن التابعة لها.
          </p>
        </div>
        <Button onClick={openRegionCreate} className="gap-1.5">
          <Plus className="size-4" />
          + إضافة جهة
        </Button>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="w-full shrink-0 lg:w-[280px]">
          <div className="space-y-3">
            <div className="relative">
              <Search className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="ابحث عن جهة..."
                className="h-9 pr-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Button
              variant="outline"
              className="h-9 w-full justify-start gap-1.5"
              onClick={openRegionCreate}
            >
              <Plus className="size-4" />
              + إضافة جهة
            </Button>
          </div>

          <div className="mt-3 rounded-xl border border-border/60 bg-card">
            {filteredRegions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Building2 className="size-8 text-muted-foreground/40" />
                <p className="mt-2 text-sm font-medium text-muted-foreground">
                  لا توجد جهات.
                </p>
                <p className="mt-1 text-xs text-muted-foreground/70">
                  أضف أول جهة للبدء.
                </p>
              </div>
            ) : (
              <div className="px-1 py-1">
                {filteredRegions.map((region) => {
                  const isExpanded = expandedRegions.has(region.id)

                  return (
                    <div key={region.id}>
                      <div className="group flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-right text-sm transition-colors hover:bg-muted/50">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              className="opacity-0 group-hover:opacity-100"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Ellipsis className="size-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" className="w-32">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation()
                                openRegionEdit(region)
                              }}
                            >
                              <Pencil className="size-3.5" />
                              تعديل
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={(e) => {
                                e.stopPropagation()
                                setDeleteRegionTarget(region)
                              }}
                            >
                              <Trash2 className="size-3.5" />
                              حذف
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <button
                          type="button"
                          className="min-w-0 flex-1 truncate text-right font-medium"
                          onClick={() => navigate(`/branches/${region.id}`)}
                        >
                          {region.name}
                        </button>
                        <Building2 className="size-4 shrink-0 text-muted-foreground" />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleRegion(region.id)
                          }}
                          className="flex size-5 shrink-0 items-center justify-center rounded text-muted-foreground hover:text-foreground"
                        >
                          {isExpanded ? (
                            <ChevronDown className="size-3.5" />
                          ) : (
                            <ChevronLeft className="size-3.5" />
                          )}
                        </button>
                      </div>

                      {isExpanded && region.cities.length > 0 && (
                        <div className="mr-5">
                          {region.cities.map((city) => (
                            <button
                              key={city.id}
                              type="button"
                              onClick={() => navigate(`/branches/${region.id}`)}
                              className="flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-right text-sm text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
                            >
                              <span className="min-w-0 flex-1 truncate">
                                {city.name}
                              </span>
                              <MapPin className="size-3.5 shrink-0" />
                            </button>
                          ))}
                        </div>
                      )}

                      {isExpanded && region.cities.length === 0 && (
                        <div className="mr-5 px-2 py-1.5 text-xs text-muted-foreground/60">
                          لا توجد مدن بعد
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col items-center justify-center py-24 text-center">
          <Building2 className="size-12 text-muted-foreground/30" />
          <p className="mt-4 text-sm font-medium text-muted-foreground">
            اختر جهة لعرض التفاصيل.
          </p>
          <p className="mt-1 text-xs text-muted-foreground/70">
            اختر جهة من اللوحة الجانبية لإدارتها.
          </p>
        </div>
      </div>

      <Dialog open={regionModalOpen} onOpenChange={setRegionModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingRegion ? 'تعديل الجهة' : 'إضافة جهة جديدة'}
            </DialogTitle>
            <DialogDescription>
              {editingRegion
                ? 'قم بتحديث تفاصيل الجهة أدناه.'
                : 'أدخل التفاصيل لإضافة جهة جديدة.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="region-name">اسم الجهة</Label>
              <Input
                id="region-name"
                value={regionForm.name}
                onChange={(e) => handleRegionFormChange('name', e.target.value)}
                placeholder="أدخل اسم الجهة"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="region-slug">الرابط</Label>
              <Input
                id="region-slug"
                value={regionForm.slug}
                onChange={(e) => handleRegionFormChange('slug', e.target.value)}
                placeholder="رابط-الجهة"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="region-desc">الوصف</Label>
              <Textarea
                id="region-desc"
                value={regionForm.description}
                onChange={(e) =>
                  handleRegionFormChange('description', e.target.value)
                }
                placeholder="وصف مختصر عن الجهة..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>صورة الغلاف</Label>
              <label className="flex h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/30 text-muted-foreground transition-colors hover:bg-muted/50">
                <ImagePlus className="size-6" />
                <span className="text-sm font-medium">رفع صورة</span>
                <span className="text-xs">PNG, JPG, WEBP</span>
                <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" />
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRegionModalOpen(false)}
              disabled={regionSaving}
            >
              إلغاء
            </Button>
            <Button onClick={handleRegionSave} disabled={regionSaving}>
              {regionSaving && <Loader2 className="ml-1 size-3 animate-spin" />}
              حفظ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!deleteRegionTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteRegionTarget(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>حذف الجهة</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من حذف{' '}
              <span className="font-medium text-foreground">
                {deleteRegionTarget?.name ?? 'هذه الجهة'}
              </span>
              ؟ لا يمكن التراجع عن هذا الإجراء.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteRegionTarget(null)}
              disabled={deletingRegion}
            >
              إلغاء
            </Button>
            <Button
              variant="destructive"
              onClick={handleRegionDelete}
              disabled={deletingRegion}
            >
              {deletingRegion && (
                <Loader2 className="ml-1 size-3 animate-spin" />
              )}
              حذف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
