export interface Product {
  id: string
  created_at: string
  updated_at: string
  name: string
  slug: string
  short_description: string | null
  description: string | null
  category: string
  brand: string | null
  condition: string | null
  sku: string | null
  price: number
  stock: number
  image_url: string | null
  gallery: string[] | null
  featured: boolean
  status: string
  sort_order: number
  created_by: string | null
  updated_by: string | null
}

export interface ProductCreateInput {
  name: string
  slug: string
  short_description: string
  description: string
  category: string
  brand: string
  condition: string
  sku: string
  price: number
  stock: number
  featured: boolean
  status: string
  sort_order: number
  image_url?: string | null
  gallery?: string[]
}

export const CATEGORY_OPTIONS = [
  { value: 'devices', label: 'الأجهزة' },
  { value: 'clothing', label: 'الملابس' },
  { value: 'uniforms', label: 'البذلات' },
  { value: 'accessories', label: 'الإكسسوارات' },
  { value: 'backpacks', label: 'الحقائب' },
  { value: 'camping', label: 'معدات التخييم' },
  { value: 'books', label: 'الكتب' },
  { value: 'gifts', label: 'الهدايا' },
] as const

export const STATUS_OPTIONS = [
  { value: 'draft', label: 'مسودة' },
  { value: 'published', label: 'منشور' },
  { value: 'archived', label: 'مؤرشفة' },
  { value: 'hidden', label: 'مخفي' },
] as const

export const CONDITION_OPTIONS = [
  { value: 'new', label: 'جديد' },
  { value: 'used', label: 'مستعمل' },
  { value: 'refurbished', label: 'مجدد' },
] as const

export const CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  CATEGORY_OPTIONS.map((c) => [c.value, c.label]),
)

export const STATUS_LABELS: Record<string, string> = Object.fromEntries(
  STATUS_OPTIONS.map((s) => [s.value, s.label]),
)
