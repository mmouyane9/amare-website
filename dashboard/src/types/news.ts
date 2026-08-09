export type NewsStatus = 'published' | 'draft' | 'archived'

export interface NewsArticle {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string | null
  featured_image: string | null
  status: string
  published_at: string | null
  seo_title: string | null
  seo_description: string | null
  author_id: string | null
  created_at: string
  updated_at: string
}

export interface NewsCreateInput {
  title: string
  slug: string
  excerpt: string
  content: string
  featured_image: string
  status: NewsStatus
  published_at: string
  seo_title: string
  seo_description: string
}

export interface NewsListParams {
  search?: string
  status?: string
}

export interface NewsListResult {
  news: NewsArticle[]
}

export const NEWS_STATUS_OPTIONS = [
  { value: 'draft', label: 'مسودة' },
  { value: 'published', label: 'منشور' },
  { value: 'archived', label: 'مؤرشف' },
] as const

export const NEWS_FILTER_OPTIONS = [
  { value: 'all', label: 'الكل' },
  { value: 'published', label: 'منشور' },
  { value: 'draft', label: 'مسودة' },
  { value: 'archived', label: 'مؤرشف' },
] as const

export const NEWS_STATUS_LABELS: Record<string, string> = {
  draft: 'مسودة',
  published: 'منشور',
  archived: 'مؤرشف',
}
