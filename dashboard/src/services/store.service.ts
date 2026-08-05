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

// ============================================================
// Orders
// ============================================================

export interface StoreOrder {
  id: string
  order_number: string
  created_at: string
  updated_at: string
  customer_name: string
  customer_phone: string
  customer_email: string | null
  customer_city: string
  customer_address: string
  order_notes: string | null
  payment_method: string
  payment_proof_url: string | null
  subtotal: number
  shipping: number
  discount: number
  grand_total: number
  status: string
  items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string | null
  product_name: string
  product_price: number
  quantity: number
  subtotal: number
  created_at: string
}

export async function getOrders(page = 1, pageSize = 10): Promise<{ orders: StoreOrder[]; total: number; totalPages: number }> {
  const from = (page - 1) * pageSize
  const { data, error, count } = await supabaseAnon
    .from('orders')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, from + pageSize - 1)

  if (error) throw new Error('Failed to load orders')
  return {
    orders: (data ?? []) as StoreOrder[],
    total: count ?? 0,
    totalPages: Math.max(1, Math.ceil((count ?? 0) / pageSize)),
  }
}

export async function getOrderById(id: string): Promise<{ order: StoreOrder; items: OrderItem[] }> {
  const [{ data: order, error: orderError }, { data: items, error: itemsError }] = await Promise.all([
    supabaseAnon.from('orders').select('*').eq('id', id).single(),
    supabaseAnon.from('order_items').select('*').eq('order_id', id).order('created_at', { ascending: true }),
  ])
  if (orderError) throw new Error('Order not found')
  if (itemsError) throw new Error('Failed to load order items')
  return { order: order as StoreOrder, items: (items ?? []) as OrderItem[] }
}

export async function updateOrderStatus(id: string, status: string): Promise<void> {
  const { error } = await supabase.from('orders').update({ status }).eq('id', id)
  if (error) throw new Error(error.message || 'Failed to update order')
}

export async function deleteOrder(id: string): Promise<void> {
  const { error } = await supabase.from('orders').delete().eq('id', id)
  if (error) throw new Error(error.message || 'Failed to delete order')
}

export async function getOrderStats() {
  const [totalResult, pendingResult, processingResult, deliveredResult] = await Promise.all([
    supabaseAnon.from('orders').select('*', { count: 'exact', head: true }),
    supabaseAnon.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabaseAnon.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'processing'),
    supabaseAnon.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'delivered'),
  ])

  return {
    total: totalResult.count ?? 0,
    pending: pendingResult.count ?? 0,
    processing: processingResult.count ?? 0,
    delivered: deliveredResult.count ?? 0,
  }
}

export function subscribeToOrders(onChange: () => void) {
  return supabase
    .channel('store-orders-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'orders' },
      () => onChange(),
    )
    .subscribe()
}
