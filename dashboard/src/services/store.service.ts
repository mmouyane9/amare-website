import { supabase, supabaseAnon } from '@/lib/supabase'
import type { Product, ProductCreateInput } from '@/types/store'

const TABLE = 'products'
const BUCKET = 'store-products'
const PAGE_SIZE = 12

export interface ProductsResult {
  products: Product[]
  total: number
  totalPages: number
}

export interface ProductsQuery {
  search?: string
  category?: string
  status?: string
  featured?: boolean
  page?: number
  pageSize?: number
}

/** Fetch paginated, filtered products for the dashboard */
export async function getProducts(query: ProductsQuery = {}): Promise<ProductsResult> {
  const { search, category, status, featured, page = 1, pageSize = PAGE_SIZE } = query

  let builder = supabaseAnon.from(TABLE).select('*', { count: 'exact' })

  if (search) builder = builder.or(`name.ilike.%${search}%,sku.ilike.%${search}%,category.ilike.%${search}%`)
  if (category && category !== 'all') builder = builder.eq('category', category)
  if (status && status !== 'all') builder = builder.eq('status', status)
  if (featured !== undefined) builder = builder.eq('featured', featured)

  builder = builder.order('sort_order', { ascending: true }).order('created_at', { ascending: false })

  const from = (page - 1) * pageSize
  builder = builder.range(from, from + pageSize - 1)

  const { data, error, count } = await builder

  if (error) throw new Error('Failed to load products')
  return {
    products: (data ?? []) as Product[],
    total: count ?? 0,
    totalPages: Math.max(1, Math.ceil((count ?? 0) / pageSize)),
  }
}

/** Fetch a single product by ID */
export async function getProductById(id: string): Promise<Product> {
  const { data, error } = await supabaseAnon.from(TABLE).select('*').eq('id', id).single()
  if (error) throw new Error('Product not found')
  return data as Product
}

/** Fetch featured published products for the storefront */
export async function getFeaturedProducts(limit = 6): Promise<Product[]> {
  const { data, error } = await supabaseAnon
    .from(TABLE)
    .select('*')
    .eq('status', 'published')
    .eq('featured', true)
    .order('sort_order', { ascending: true })
    .limit(limit)
  if (error) throw new Error('Failed to load featured products')
  return (data ?? []) as Product[]
}

/** Fetch published products filtered by category for the storefront */
export async function getPublishedProducts(category?: string): Promise<Product[]> {
  let builder = supabaseAnon
    .from(TABLE)
    .select('*')
    .eq('status', 'published')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })

  if (category) builder = builder.eq('category', category)

  const { data, error } = await builder
  if (error) throw new Error('Failed to load products')
  return (data ?? []) as Product[]
}

/** Create a product (admin only) */
export async function createProduct(input: ProductCreateInput & { image_url?: string | null; gallery?: string[] }): Promise<Product> {
  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      ...input,
      gallery: input.gallery ?? [],
      image_url: input.image_url ?? null,
    })
    .select()
    .single()
  if (error) throw new Error(error.message || 'Failed to create product')
  return data as Product
}

/** Update a product (admin only) */
export async function updateProduct(id: string, input: Partial<ProductCreateInput & { gallery: string[]; image_url: string }>): Promise<Product> {
  const { data, error } = await supabase
    .from(TABLE)
    .update(input)
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(error.message || 'Failed to update product')
  return data as Product
}

/** Delete a product (admin only) */
export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase.from(TABLE).delete().eq('id', id)
  if (error) throw new Error(error.message || 'Failed to delete product')
}

/** Upload a product image to storage */
export async function uploadProductImage(file: File): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
  const filePath = `products/${fileName}`

  const { error } = await supabase.storage.from(BUCKET).upload(filePath, file, {
    cacheControl: '3600',
    upsert: false,
  })

  if (error) throw new Error(error.message || 'Failed to upload image')

  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(filePath)
  return urlData.publicUrl
}

/** Delete an image from storage */
export async function deleteProductImage(url: string): Promise<void> {
  const bucketPrefix = `${BUCKET}/`
  const idx = url.indexOf(bucketPrefix)
  if (idx === -1) return
  const filePath = url.slice(idx + bucketPrefix.length)
  await supabase.storage.from(BUCKET).remove([filePath])
}

/** Get store stats for the dashboard */
export async function getStoreStats() {
  const [totalResult, publishedResult, outOfStockResult, featuredResult] = await Promise.all([
    supabaseAnon.from(TABLE).select('*', { count: 'exact', head: true }),
    supabaseAnon.from(TABLE).select('*', { count: 'exact', head: true }).eq('status', 'published'),
    supabaseAnon.from(TABLE).select('*', { count: 'exact', head: true }).eq('stock', 0).eq('status', 'published'),
    supabaseAnon.from(TABLE).select('*', { count: 'exact', head: true }).eq('featured', true).eq('status', 'published'),
  ])

  return {
    total: totalResult.count ?? 0,
    active: publishedResult.count ?? 0,
    outOfStock: outOfStockResult.count ?? 0,
    featured: featuredResult.count ?? 0,
  }
}

/** Subscribe to realtime changes on the products table */
export function subscribeToProducts(onChange: () => void) {
  return supabase
    .channel('store-products-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: TABLE },
      () => onChange(),
    )
    .subscribe()
}
