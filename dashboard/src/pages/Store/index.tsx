import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Eye,
  ImagePlus,
  Loader2,
  Package,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getStoreStats,
  uploadProductImage,
  deleteProductImage,
  subscribeToProducts,
  type ProductsQuery,
} from '@/services/store.service'
import type { Product, ProductCreateInput } from '@/types/store'

const PAGE_SIZE = 10

const EMPTY_FORM: ProductCreateInput = {
  name: '',
  slug: '',
  short_description: '',
  description: '',
  category: 'devices',
  brand: '',
  condition: 'new',
  sku: '',
  price: 0,
  stock: 99,
  featured: false,
  status: 'published',
  sort_order: 0,
}

function productToForm(p: Product): ProductCreateInput {
  return {
    name: p.name,
    slug: p.slug,
    short_description: p.short_description ?? '',
    description: p.description ?? '',
    category: p.category,
    brand: p.brand ?? '',
    condition: p.condition ?? 'new',
    sku: p.sku ?? '',
    price: p.price,
    stock: p.stock,
    featured: p.featured,
    status: p.status,
    sort_order: p.sort_order,
  }
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function formatPrice(n: number): string {
  return n.toLocaleString('fr-FR') + ' د.م'
}

function truncate(text: string | null, max = 40): string {
  if (!text) return '—'
  return text.length > max ? text.slice(0, max) + '…' : text
}

export default function StorePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [stats, setStats] = useState({ total: 0, active: 0, outOfStock: 0, featured: 0 })

  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [form, setForm] = useState<ProductCreateInput>(EMPTY_FORM)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null)
  const [deleting, setDeleting] = useState(false)

  const [mainImageFile, setMainImageFile] = useState<File | null>(null)
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null)
  const [galleryFiles, setGalleryFiles] = useState<File[]>([])
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([])
  const [existingGallery, setExistingGallery] = useState<string[]>([])

  const searchTimeout = useRef<ReturnType<typeof setTimeout>>(undefined)

  const fetchProducts = useCallback(async (currentPage: number, currentSearch: string) => {
    setLoading(true)
    try {
      const query: ProductsQuery = { page: currentPage, pageSize: PAGE_SIZE }
      if (currentSearch) query.search = currentSearch
      const result = await getProducts(query)
      setProducts(result.products)
      setTotal(result.total)
      setTotalPages(result.totalPages)
    } catch {
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchStats = useCallback(async () => {
    try {
      const s = await getStoreStats()
      setStats(s)
    } catch {
      /* silent */
    }
  }, [])

  useEffect(() => {
    fetchProducts(page, search)
    fetchStats()
  }, [page, search, fetchProducts, fetchStats])

  useEffect(() => {
    const channel = subscribeToProducts(() => {
      fetchProducts(page, search)
      fetchStats()
    })
    return () => { channel.unsubscribe() }
  }, [page, search, fetchProducts, fetchStats])

  const handleSearchChange = (value: string) => {
    setSearchInput(value)
    if (searchTimeout.current) clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(() => {
      setSearch(value)
      setPage(1)
    }, 350)
  }

  const openCreateModal = () => {
    setEditingProduct(null)
    setForm(EMPTY_FORM)
    setErrors({})
    setMainImageFile(null)
    setMainImagePreview(null)
    setGalleryFiles([])
    setGalleryPreviews([])
    setExistingGallery([])
    setModalOpen(true)
  }

  const openEditModal = (p: Product) => {
    setEditingProduct(p)
    setForm(productToForm(p))
    setErrors({})
    setMainImageFile(null)
    setMainImagePreview(p.image_url)
    setGalleryFiles([])
    setGalleryPreviews([])
    setExistingGallery(p.gallery ?? [])
    setModalOpen(true)
  }

  const handleFormChange = (field: keyof ProductCreateInput, value: string | number | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => { const n = { ...prev }; delete n[field]; return n })
    if (field === 'name') {
      const slug = value.toString().trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\u0600-\u06FF-]/g, '')
      setForm((prev) => ({ ...prev, slug }))
    }
  }

  const handleMainImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setMainImageFile(file)
    setMainImagePreview(URL.createObjectURL(file))
  }

  const handleGallerySelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    setGalleryFiles((prev) => [...prev, ...files])
    setGalleryPreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))])
  }

  const removeGalleryPreview = (idx: number) => {
    setGalleryFiles((prev) => prev.filter((_, i) => i !== idx))
    setGalleryPreviews((prev) => prev.filter((_, i) => i !== idx))
  }

  const removeExistingGalleryImage = (idx: number) => {
    setExistingGallery((prev) => prev.filter((_, i) => i !== idx))
  }

  const validateForm = (): boolean => {
    const errs: Record<string, string> = {}
    if (!form.name.trim()) errs.name = 'اسم المنتج مطلوب'
    if (!form.price || form.price <= 0) errs.price = 'السعر يجب أن يكون أكبر من 0'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) return
    setSaving(true)

    try {
      let imageUrl = editingProduct?.image_url ?? null
      let finalGallery = [...existingGallery]

      if (mainImageFile) {
        if (editingProduct?.image_url) {
          await deleteProductImage(editingProduct.image_url).catch(() => {})
        }
        imageUrl = await uploadProductImage(mainImageFile)
      }

      if (galleryFiles.length > 0) {
        const uploadedUrls = await Promise.all(
          galleryFiles.map((f) => uploadProductImage(f)),
        )
        finalGallery = [...finalGallery, ...uploadedUrls]
      }

      const payload = {
        ...form,
        image_url: imageUrl ?? undefined,
        gallery: finalGallery,
        status: 'published',
        stock: 99,
      }

      if (editingProduct) {
        await updateProduct(editingProduct.id, payload)
        toast.success('تم تحديث المنتج')
      } else {
        await createProduct({ ...form, image_url: imageUrl ?? undefined, gallery: finalGallery, status: 'published', stock: 99 })
        toast.success('تم إضافة المنتج')
      }

      setModalOpen(false)
      await fetchProducts(page, search)
      await fetchStats()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'فشل حفظ المنتج')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      if (deleteTarget.image_url) await deleteProductImage(deleteTarget.image_url).catch(() => {})
      if (deleteTarget.gallery?.length) {
        await Promise.all(deleteTarget.gallery.map((url) => deleteProductImage(url).catch(() => {})))
      }
      await deleteProduct(deleteTarget.id)
      toast.success('تم حذف المنتج')
      setDeleteTarget(null)
      await fetchProducts(page, search)
      await fetchStats()
    } catch {
      toast.error('فشل حذف المنتج')
    } finally {
      setDeleting(false)
    }
  }

  const totalPagesLocal = Math.max(1, totalPages)

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold tracking-tight">AMARE Store</h2>
        <p className="text-sm text-muted-foreground">
          إدارة المنتجات — متجر الجمعية المغربية لهواة البحث والاستكشاف
        </p>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              إجمالي المنتجات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <Package className="size-5" />
              </span>
              <span className="text-2xl font-bold">{stats.total}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              المنتجات المنشورة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Package className="size-5" />
              </span>
              <span className="text-2xl font-bold">{stats.active}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              المنتجات المميزة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Package className="size-5" />
              </span>
              <span className="text-2xl font-bold">{stats.featured}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="بحث باسم المنتج..."
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        <Button onClick={openCreateModal}>
          <Plus className="size-4" />
          إضافة منتج
        </Button>
      </div>

      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">الصورة</TableHead>
              <TableHead>اسم المنتج</TableHead>
              <TableHead>السعر</TableHead>
              <TableHead>تاريخ الإضافة</TableHead>
              <TableHead className="w-28">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          {loading ? (
            <TableBody>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 5 }).map((__, j) => (
                    <TableCell key={j}>
                      <span className="block h-4 w-16 animate-pulse rounded bg-muted" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          ) : products.length === 0 ? (
            <TableBody>
              <TableRow>
                <TableCell colSpan={5} className="py-12 text-center text-muted-foreground">
                  لا توجد منتجات بعد.
                </TableCell>
              </TableRow>
            </TableBody>
          ) : (
            <TableBody>
              {products.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    {p.image_url ? (
                      <img src={p.image_url} alt={p.name} className="size-10 rounded-lg object-cover" />
                    ) : (
                      <span className="flex size-10 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-500/10">
                        <Package className="size-4 text-blue-500" />
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{truncate(p.name, 40)}</div>
                  </TableCell>
                  <TableCell className="font-semibold">{formatPrice(p.price)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDate(p.created_at)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <a href={`/amare store/product.html?id=${p.id}`} target="_blank" rel="noopener">
                        <Button variant="ghost" size="icon-xs" title="عرض">
                          <Eye className="size-3.5" />
                        </Button>
                      </a>
                      <Button variant="ghost" size="icon-xs" onClick={() => openEditModal(p)} title="تعديل">
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon-xs" onClick={() => setDeleteTarget(p)} title="حذف">
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

      {totalPagesLocal > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
            السابق
          </Button>
          <span className="text-sm text-muted-foreground">
            صفحة {page} من {totalPagesLocal} ({total} منتج)
          </span>
          <Button variant="outline" size="sm" disabled={page >= totalPagesLocal} onClick={() => setPage((p) => Math.min(totalPagesLocal, p + 1))}>
            التالي
          </Button>
        </div>
      )}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'تعديل المنتج' : 'إضافة منتج'}</DialogTitle>
            <DialogDescription>
              {editingProduct ? 'تعديل تفاصيل المنتج.' : 'املأ التفاصيل لإضافة منتج جديد إلى المتجر.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label>صورة المنتج</Label>
              {mainImagePreview ? (
                <div className="relative inline-block">
                  <img src={mainImagePreview} alt="Preview" className="h-48 w-48 rounded-xl object-cover border" />
                  <button
                    type="button"
                    onClick={() => { setMainImageFile(null); setMainImagePreview(null) }}
                    className="absolute -right-1 -top-1 flex size-6 items-center justify-center rounded-full bg-red-500 text-white shadow"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              ) : (
                <label className="flex h-48 w-48 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/30 text-muted-foreground hover:bg-muted/50 transition-colors">
                  <ImagePlus className="size-8" />
                  <span className="text-sm font-medium">رفع صورة</span>
                  <span className="text-xs">PNG, JPG, WEBP</span>
                  <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleMainImageSelect} />
                </label>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="p-name">اسم المنتج</Label>
              <Input
                id="p-name"
                value={form.name}
                onChange={(e) => handleFormChange('name', e.target.value)}
                placeholder="بذلة ميدانية رسمية"
                className="h-11 text-base"
              />
              {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="p-price">السعر (بالدرهم)</Label>
              <Input
                id="p-price"
                type="number"
                min={0}
                step={0.01}
                value={form.price}
                onChange={(e) => handleFormChange('price', parseFloat(e.target.value) || 0)}
                placeholder="250"
                className="h-11 text-base"
              />
              {errors.price && <p className="text-xs text-red-500">{errors.price}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="p-short">وصف قصير</Label>
              <Textarea
                id="p-short"
                value={form.short_description}
                onChange={(e) => handleFormChange('short_description', e.target.value)}
                placeholder="ملخص قصير يظهر على بطاقة المنتج..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="p-desc">تفاصيل المنتج</Label>
              <Textarea
                id="p-desc"
                value={form.description}
                onChange={(e) => handleFormChange('description', e.target.value)}
                placeholder="وصف كامل للمنتج يشمل المواصفات والميزات والتفاصيل..."
                rows={8}
              />
            </div>

            <div className="space-y-2">
              <Label>صور إضافية (معرض)</Label>
              <div className="flex flex-wrap gap-2">
                {existingGallery.map((url, i) => (
                  <div key={`existing-${i}`} className="relative">
                    <img src={url} alt="" className="h-20 w-20 rounded-lg object-cover" />
                    <button
                      type="button"
                      onClick={() => removeExistingGalleryImage(i)}
                      className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-red-500 text-white"
                    >
                      <X className="size-2.5" />
                    </button>
                  </div>
                ))}
                {galleryPreviews.map((url, i) => (
                  <div key={`new-${i}`} className="relative">
                    <img src={url} alt="" className="h-20 w-20 rounded-lg object-cover" />
                    <button
                      type="button"
                      onClick={() => removeGalleryPreview(i)}
                      className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-red-500 text-white"
                    >
                      <X className="size-2.5" />
                    </button>
                  </div>
                ))}
                <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 text-muted-foreground hover:bg-muted/50">
                  <ImagePlus className="size-4" />
                  <span className="text-[10px]">إضافة</span>
                  <input type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={handleGallerySelect} />
                </label>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setModalOpen(false)} className="text-base">إلغاء</Button>
            <Button onClick={handleSave} disabled={saving} className="text-base">
              {saving && <Loader2 className="size-4 animate-spin" />}
              {editingProduct ? 'تحديث المنتج' : 'إضافة المنتج'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteTarget} onOpenChange={(v) => { if (!v) setDeleteTarget(null) }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>حذف المنتج</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من حذف &ldquo;{deleteTarget?.name}&rdquo;؟
              لا يمكن التراجع عن هذا الإجراء.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>إلغاء</Button>
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
