import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Box,
  Eye,
  ImagePlus,
  Loader2,
  Package,
  PackageOpen,
  Pencil,
  Plus,
  Search,
  Star,
  Trash2,
  Upload,
  X,
  ClipboardList,
  ShoppingBag,
  Truck,
  CheckCircle,
  ChevronDown,
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getStoreStats,
  uploadProductImage,
  deleteProductImage,
  subscribeToProducts,
  getOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
  getOrderStats,
  subscribeToOrders,
  type ProductsQuery,
  type StoreOrder,
} from '@/services/store.service'
import type { Product, ProductCreateInput } from '@/types/store'
import {
  CATEGORY_OPTIONS,
  CATEGORY_LABELS,
  STATUS_OPTIONS,
  STATUS_LABELS,
  CONDITION_OPTIONS,
} from '@/types/store'

const PAGE_SIZE = 10

const CATEGORY_FILTER_OPTIONS = [
  { value: 'all', label: 'جميع الفئات' },
  ...CATEGORY_OPTIONS.map((c) => ({ value: c.value, label: c.label })),
]

const STATUS_FILTER_OPTIONS = [
  { value: 'all', label: 'جميع الحالات' },
  ...STATUS_OPTIONS.map((s) => ({ value: s.value, label: s.label })),
]

const STATUS_BADGE_CLASS: Record<string, string> = {
  published: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
  draft: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
  archived: 'bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-400',
  hidden: 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400',
}

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
  stock: 0,
  featured: false,
  status: 'draft',
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

function truncate(text: string | null, max = 60): string {
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
  const [catFilter, setCatFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

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
  const [uploading, setUploading] = useState(false)

  const searchTimeout = useRef<ReturnType<typeof setTimeout>>(undefined)

  const fetchProducts = useCallback(async (currentPage: number, currentSearch: string, currentCat: string, currentStatus: string) => {
    setLoading(true)
    try {
      const query: ProductsQuery = { page: currentPage, pageSize: PAGE_SIZE }
      if (currentSearch) query.search = currentSearch
      if (currentCat !== 'all') query.category = currentCat
      if (currentStatus !== 'all') query.status = currentStatus
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
    fetchProducts(page, search, catFilter, statusFilter)
    fetchStats()
  }, [page, search, catFilter, statusFilter, fetchProducts, fetchStats])

  useEffect(() => {
    const channel = subscribeToProducts(() => {
      fetchProducts(page, search, catFilter, statusFilter)
      fetchStats()
    })
    return () => { channel.unsubscribe() }
  }, [page, search, catFilter, statusFilter, fetchProducts, fetchStats])

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
      setForm((prev) => ({
        ...prev,
        slug: value.toString().trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\u0600-\u06FF-]/g, ''),
      }))
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
    if (!form.name.trim()) errs.name = 'Product name is required'
    if (!form.slug.trim()) errs.slug = 'Slug is required'
    if (!form.price || form.price <= 0) errs.price = 'Price must be greater than 0'
    if (!form.category) errs.category = 'Category is required'
    if (!form.status) errs.status = 'Status is required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) return
    setSaving(true)
    setUploading(true)

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
        image_url: imageUrl,
        gallery: finalGallery,
      }

      if (editingProduct) {
        await updateProduct(editingProduct.id, payload)
        toast.success('Product updated')
      } else {
        await createProduct({ ...form, image_url: imageUrl, gallery: finalGallery })
        toast.success('Product created')
      }

      setModalOpen(false)
      await fetchProducts(page, search, catFilter, statusFilter)
      await fetchStats()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save product')
    } finally {
      setSaving(false)
      setUploading(false)
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
      toast.success('Product deleted')
      setDeleteTarget(null)
      await fetchProducts(page, search, catFilter, statusFilter)
      await fetchStats()
    } catch {
      toast.error('Failed to delete product')
    } finally {
      setDeleting(false)
    }
  }

  const totalPagesLocal = Math.max(1, totalPages)

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold tracking-tight">AMARE Store</h2>
        <p className="text-sm text-muted-foreground">
          Manage products, inventory, and the association storefront.
        </p>
      </div>

      {/* Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Products
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
              Active Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <PackageOpen className="size-5" />
              </span>
              <span className="text-2xl font-bold">{stats.active}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Out of Stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10 text-red-600 dark:text-red-400">
                <Box className="size-5" />
              </span>
              <span className="text-2xl font-bold">{stats.outOfStock}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Featured Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Star className="size-5" />
              </span>
              <span className="text-2xl font-bold">{stats.featured}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or SKU..."
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={catFilter} onValueChange={(v) => { setCatFilter(v); setPage(1) }}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORY_FILTER_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1) }}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_FILTER_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button onClick={openCreateModal}>
          <Plus className="size-4" />
          Add Product
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-28">Actions</TableHead>
            </TableRow>
          </TableHeader>
          {loading ? (
            <TableBody>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 8 }).map((__, j) => (
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
                <TableCell colSpan={8} className="py-12 text-center text-muted-foreground">
                  No products found.
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
                    <div className="text-xs text-muted-foreground">{p.sku || '—'}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{CATEGORY_LABELS[p.category] ?? p.category}</Badge>
                  </TableCell>
                  <TableCell className="font-semibold">{formatPrice(p.price)}</TableCell>
                  <TableCell>
                    <span className={p.stock === 0 ? 'text-red-600' : ''}>{p.stock}</span>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE_CLASS[p.status] ?? ''}`}>
                      {STATUS_LABELS[p.status] ?? p.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDate(p.created_at)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <a href={`/amare store/product.html?id=${p.id}`} target="_blank" rel="noopener">
                        <Button variant="ghost" size="icon-xs" title="View">
                          <Eye className="size-3.5" />
                        </Button>
                      </a>
                      <Button variant="ghost" size="icon-xs" onClick={() => openEditModal(p)} title="Edit">
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon-xs" onClick={() => setDeleteTarget(p)} title="Delete">
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

      {/* Pagination */}
      {totalPagesLocal > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPagesLocal} ({total} products)
          </span>
          <Button variant="outline" size="sm" disabled={page >= totalPagesLocal} onClick={() => setPage((p) => Math.min(totalPagesLocal, p + 1))}>
            Next
          </Button>
        </div>
      )}

      {/* Create / Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Edit Product' : 'Add Product'}</DialogTitle>
            <DialogDescription>
              {editingProduct ? 'Update product details and images.' : 'Fill in the details to create a new product.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="p-name">Product Name *</Label>
                <Input
                  id="p-name"
                  value={form.name}
                  onChange={(e) => handleFormChange('name', e.target.value)}
                  placeholder="بذلة ميدانية رسمية"
                />
                {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="p-slug">Slug *</Label>
                <Input
                  id="p-slug"
                  value={form.slug}
                  onChange={(e) => handleFormChange('slug', e.target.value)}
                  placeholder="field-uniform"
                />
                {errors.slug && <p className="text-xs text-red-500">{errors.slug}</p>}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Category *</Label>
                <Select value={form.category} onValueChange={(v) => handleFormChange('category', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORY_OPTIONS.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status *</Label>
                <Select value={form.status} onValueChange={(v) => handleFormChange('status', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((s) => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Condition</Label>
                <Select value={form.condition} onValueChange={(v) => handleFormChange('condition', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CONDITION_OPTIONS.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="p-short">Short Description</Label>
              <Textarea
                id="p-short"
                value={form.short_description}
                onChange={(e) => handleFormChange('short_description', e.target.value)}
                placeholder="Brief summary shown on product cards..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="p-desc">Full Description</Label>
              <Textarea
                id="p-desc"
                value={form.description}
                onChange={(e) => handleFormChange('description', e.target.value)}
                placeholder="Detailed product description..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="p-price">Price (MAD) *</Label>
                <Input
                  id="p-price"
                  type="number"
                  min={0}
                  step={0.01}
                  value={form.price}
                  onChange={(e) => handleFormChange('price', parseFloat(e.target.value) || 0)}
                />
                {errors.price && <p className="text-xs text-red-500">{errors.price}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="p-stock">Stock</Label>
                <Input
                  id="p-stock"
                  type="number"
                  min={0}
                  value={form.stock}
                  onChange={(e) => handleFormChange('stock', parseInt(e.target.value, 10) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="p-sku">SKU</Label>
                <Input
                  id="p-sku"
                  value={form.sku}
                  onChange={(e) => handleFormChange('sku', e.target.value)}
                  placeholder="AMR-UNI-001"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="p-brand">Brand</Label>
                <Input
                  id="p-brand"
                  value={form.brand}
                  onChange={(e) => handleFormChange('brand', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="p-sort">Sort Order</Label>
                <Input
                  id="p-sort"
                  type="number"
                  min={0}
                  value={form.sort_order}
                  onChange={(e) => handleFormChange('sort_order', parseInt(e.target.value, 10) || 0)}
                />
              </div>
              <div className="flex items-end gap-6 pb-2">
                <div className="flex items-center gap-2">
                  <Switch
                    id="p-featured"
                    checked={form.featured}
                    onCheckedChange={(v) => handleFormChange('featured', v)}
                  />
                  <Label htmlFor="p-featured">Featured</Label>
                </div>
              </div>
            </div>

            {/* Main Image */}
            <div className="space-y-2">
              <Label>Main Image</Label>
              {mainImagePreview ? (
                <div className="relative inline-block">
                  <img src={mainImagePreview} alt="Preview" className="h-32 w-32 rounded-lg object-cover" />
                  <button
                    type="button"
                    onClick={() => { setMainImageFile(null); setMainImagePreview(null) }}
                    className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-red-500 text-white"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ) : (
                <label className="flex h-32 w-32 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 text-muted-foreground hover:bg-muted/50">
                  <ImagePlus className="size-6" />
                  <span className="mt-1 text-xs">Upload</span>
                  <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleMainImageSelect} />
                </label>
              )}
            </div>

            {/* Gallery */}
            <div className="space-y-2">
              <Label>Gallery Images</Label>
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
                  <Upload className="size-4" />
                  <span className="text-[10px]">Add</span>
                  <input type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={handleGallerySelect} />
                </label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="size-4 animate-spin" />}
              {editingProduct ? 'Update Product' : 'Create Product'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={(v) => { if (!v) setDeleteTarget(null) }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &ldquo;{deleteTarget?.name}&rdquo;?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting && <Loader2 className="size-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===== Orders Section ===== */}
      <Tabs defaultValue="products" className="mt-8">
        <TabsList>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="mt-0">
          {/* The full products management UI is rendered above */}
        </TabsContent>

        <TabsContent value="orders" className="mt-0">
          <OrdersPanel />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function OrdersPanel() {
  const [orders, setOrders] = useState<StoreOrder[]>([])
  const [orderTotal, setOrderTotal] = useState(0)
  const [orderPages, setOrderPages] = useState(1)
  const [orderPage, setOrderPage] = useState(1)
  const [orderLoading, setOrderLoading] = useState(true)
  const [orderStats, setOrderStatsState] = useState({ total: 0, pending: 0, processing: 0, delivered: 0 })
  const [selectedOrder, setSelectedOrder] = useState<StoreOrder | null>(null)
  const [orderItems, setOrderItems] = useState<import('@/services/store.service').OrderItem[]>([])
  const [detailOpen, setDetailOpen] = useState(false)
  const [orderDeleteTarget, setOrderDeleteTarget] = useState<StoreOrder | null>(null)
  const [orderDeleting, setOrderDeleting] = useState(false)
  const [statusUpdating, setStatusUpdating] = useState(false)

  const fetchOrders = useCallback(async (p: number) => {
    setOrderLoading(true)
    try {
      const result = await getOrders(p, 10)
      setOrders(result.orders)
      setOrderTotal(result.total)
      setOrderPages(result.totalPages)
    } catch { toast.error('Failed to load orders') }
    finally { setOrderLoading(false) }
  }, [])

  const fetchOrderStats = useCallback(async () => {
    try { setOrderStatsState(await getOrderStats()) } catch {}
  }, [])

  useEffect(() => { fetchOrders(orderPage); fetchOrderStats() }, [orderPage, fetchOrders, fetchOrderStats])

  useEffect(() => {
    const ch = subscribeToOrders(() => { fetchOrders(orderPage); fetchOrderStats() })
    return () => { ch.unsubscribe() }
  }, [orderPage, fetchOrders, fetchOrderStats])

  const handleViewOrder = async (order: StoreOrder) => {
    setSelectedOrder(order)
    setDetailOpen(true)
    try {
      const result = await getOrderById(order.id)
      setOrderItems(result.items)
    } catch { setOrderItems([]) }
  }

  const handleStatusChange = async (id: string, status: string) => {
    setStatusUpdating(true)
    try {
      await updateOrderStatus(id, status)
      toast.success('Order status updated')
      await fetchOrders(orderPage)
      await fetchOrderStats()
    } catch { toast.error('Failed to update status') }
    finally { setStatusUpdating(false) }
  }

  const handleOrderDelete = async () => {
    if (!orderDeleteTarget) return
    setOrderDeleting(true)
    try {
      await deleteOrder(orderDeleteTarget.id)
      toast.success('Order deleted')
      setOrderDeleteTarget(null)
      await fetchOrders(orderPage)
      await fetchOrderStats()
    } catch { toast.error('Failed to delete order') }
    finally { setOrderDeleting(false) }
  }

  const STATUS_CLASS: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    confirmed: 'bg-blue-100 text-blue-700',
    processing: 'bg-purple-100 text-purple-700',
    shipped: 'bg-cyan-100 text-cyan-700',
    delivered: 'bg-emerald-100 text-emerald-700',
    cancelled: 'bg-red-100 text-red-700',
  }

  const STATUS_LABEL: Record<string, string> = {
    pending: 'قيد الانتظار',
    confirmed: 'تم التأكيد',
    processing: 'قيد المعالجة',
    shipped: 'تم الشحن',
    delivered: 'تم التوصيل',
    cancelled: 'ملغي',
  }

  const PAYMENT_LABEL: Record<string, string> = {
    cod: 'الدفع عند الاستلام',
    bank_transfer: 'تحويل بنكي',
  }

  return (
    <div>
      {/* Order Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600"><ClipboardList className="size-5" /></span>
              <span className="text-2xl font-bold">{orderStats.total}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600"><ShoppingBag className="size-5" /></span>
              <span className="text-2xl font-bold">{orderStats.pending}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Processing</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600"><Truck className="size-5" /></span>
              <span className="text-2xl font-bold">{orderStats.processing}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Delivered</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600"><CheckCircle className="size-5" /></span>
              <span className="text-2xl font-bold">{orderStats.delivered}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table */}
      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-44">Actions</TableHead>
            </TableRow>
          </TableHeader>
          {orderLoading ? (
            <TableBody>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 7 }).map((__, j) => (
                    <TableCell key={j}><span className="block h-4 w-16 animate-pulse rounded bg-muted" /></TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          ) : orders.length === 0 ? (
            <TableBody>
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">No orders yet.</TableCell>
              </TableRow>
            </TableBody>
          ) : (
            <TableBody>
              {orders.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-mono font-semibold text-sm">{o.order_number}</TableCell>
                  <TableCell>
                    <div className="font-medium">{o.customer_name}</div>
                    <div className="text-xs text-muted-foreground">{o.customer_phone}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{PAYMENT_LABEL[o.payment_method] ?? o.payment_method}</div>
                    {o.payment_proof_url && (
                      <a href={o.payment_proof_url} target="_blank" rel="noopener" className="text-xs text-blue-600 underline">View receipt</a>
                    )}
                  </TableCell>
                  <TableCell className="font-semibold">{o.grand_total.toLocaleString('fr-FR')} MAD</TableCell>
                  <TableCell>
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_CLASS[o.status] ?? ''}`}>
                      {STATUS_LABEL[o.status] ?? o.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{new Date(o.created_at).toLocaleDateString('fr-FR')}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon-xs" onClick={() => handleViewOrder(o)} title="View"><Eye className="size-3.5" /></Button>
                      <select
                        value={o.status}
                        onChange={(e) => handleStatusChange(o.id, e.target.value)}
                        disabled={statusUpdating}
                        className="h-7 rounded border border-border bg-background px-1 text-xs"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      <Button variant="ghost" size="icon-xs" onClick={() => setOrderDeleteTarget(o)} title="Delete"><Trash2 className="size-3.5 text-red-500" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          )}
        </Table>
      </div>

      {orderPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={orderPage <= 1} onClick={() => setOrderPage((p) => Math.max(1, p - 1))}>Previous</Button>
          <span className="text-sm text-muted-foreground">Page {orderPage} of {orderPages}</span>
          <Button variant="outline" size="sm" disabled={orderPage >= orderPages} onClick={() => setOrderPage((p) => p + 1)}>Next</Button>
        </div>
      )}

      {/* Order Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-h-[80vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order {selectedOrder?.order_number}</DialogTitle>
            <DialogDescription>{selectedOrder?.customer_name} · {selectedOrder?.customer_phone}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><span className="text-muted-foreground">City:</span> {selectedOrder?.customer_city}</div>
              <div><span className="text-muted-foreground">Payment:</span> {selectedOrder ? PAYMENT_LABEL[selectedOrder.payment_method] : ''}</div>
              <div className="col-span-2"><span className="text-muted-foreground">Address:</span> {selectedOrder?.customer_address}</div>
              {selectedOrder?.order_notes && <div className="col-span-2"><span className="text-muted-foreground">Notes:</span> {selectedOrder.order_notes}</div>}
            </div>
            <div className="rounded-lg border p-3 space-y-2">
              <p className="text-sm font-semibold">Items ({orderItems.length})</p>
              {orderItems.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>{item.product_name} × {item.quantity}</span>
                  <span className="font-semibold">{item.subtotal.toLocaleString('fr-FR')} MAD</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-3">
              <span>Total</span>
              <span>{selectedOrder?.grand_total.toLocaleString('fr-FR')} MAD</span>
            </div>
            {selectedOrder?.payment_proof_url && (
              <div>
                <p className="text-sm font-medium mb-2">Bank Receipt</p>
                <a href={selectedOrder.payment_proof_url} target="_blank" rel="noopener">
                  <img src={selectedOrder.payment_proof_url} alt="Receipt" className="max-h-48 rounded-lg border" />
                </a>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Order Delete Confirmation */}
      <Dialog open={!!orderDeleteTarget} onOpenChange={(v) => { if (!v) setOrderDeleteTarget(null) }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Order</DialogTitle>
            <DialogDescription>
              Delete order {orderDeleteTarget?.order_number}? This is irreversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOrderDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleOrderDelete} disabled={orderDeleting}>
              {orderDeleting && <Loader2 className="size-4 animate-spin" />} Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
