import { supabase } from '@/lib/supabase'
import type {
  NewsArticle,
  NewsCreateInput,
  NewsListParams,
  NewsListResult,
} from '@/types/news'

const TABLE = 'news'
// Reuse the established public media bucket used by the CMS (pages.service.ts).
const IMAGE_BUCKET = 'cms-images'
const IMAGE_PREFIX = 'news/'

/**
 * Fetch news for the dashboard. Reads use the authenticated client so that
 * RLS (dashboard SELECT policy) returns drafts and archived articles too —
 * the public anon policy only exposes `status = 'published'`.
 * Search matches the title; filtering is by status. The full result set is
 * sorted in JS by published_at DESC, falling back to created_at DESC when
 * published_at is null (drafts).
 */
export async function getNews(
  params: NewsListParams = {},
): Promise<NewsListResult> {
  const { search, status } = params

  let builder = supabase.from(TABLE).select('*')
  if (search) builder = builder.ilike('title', `%${search}%`)
  if (status && status !== 'all') builder = builder.eq('status', status)

  const { data, error } = await builder
  if (error) throw error

  const rows = (data ?? []) as NewsArticle[]
  rows.sort((a, b) => {
    const ta = new Date(a.published_at || a.created_at).getTime()
    const tb = new Date(b.published_at || b.created_at).getTime()
    return tb - ta
  })

  return { news: rows }
}

/** True when the slug is already used by another article. */
export async function isSlugTaken(
  slug: string,
  excludeId?: string,
): Promise<boolean> {
  let builder = supabase.from(TABLE).select('id').eq('slug', slug)
  if (excludeId) builder = builder.neq('id', excludeId)
  const { data, error } = await builder.maybeSingle()
  if (error) throw error
  return !!data
}

function publishedAtValue(input: NewsCreateInput): string | null {
  if (input.status === 'published') {
    return input.published_at || new Date().toISOString()
  }
  return input.published_at || null
}

/** Create a news article (authenticated client — respects INSERT RLS). */
export async function createNews(
  input: NewsCreateInput,
  authorId?: string | null,
): Promise<NewsArticle> {
  const payload = {
    title: input.title.trim(),
    slug: input.slug.trim(),
    excerpt: input.excerpt.trim() || null,
    content: input.content.trim() || null,
    featured_image: input.featured_image.trim() || null,
    status: input.status,
    published_at: publishedAtValue(input),
    seo_title: input.seo_title.trim() || null,
    seo_description: input.seo_description.trim() || null,
    author_id: authorId ?? null,
  }

  const { data, error } = await supabase
    .from(TABLE)
    .insert(payload)
    .select()
    .single()
  if (error) throw error
  return data as NewsArticle
}

/** Update the same row — never creates a duplicate. */
export async function updateNews(
  id: string,
  input: NewsCreateInput,
): Promise<NewsArticle> {
  const payload = {
    title: input.title.trim(),
    slug: input.slug.trim(),
    excerpt: input.excerpt.trim() || null,
    content: input.content.trim() || null,
    featured_image: input.featured_image.trim() || null,
    status: input.status,
    published_at: publishedAtValue(input),
    seo_title: input.seo_title.trim() || null,
    seo_description: input.seo_description.trim() || null,
  }

  const { data, error } = await supabase
    .from(TABLE)
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as NewsArticle
}

/** Delete an article; also removes its uploaded image when possible. */
export async function deleteNews(id: string): Promise<void> {
  const { data: record } = await supabase
    .from(TABLE)
    .select('featured_image')
    .eq('id', id)
    .single()

  if (record?.featured_image) {
    await deleteNewsImage(record.featured_image).catch(() => {})
  }

  const { error } = await supabase.from(TABLE).delete().eq('id', id)
  if (error) throw error
}

/** Upload an image to the shared public `cms-images` bucket (news/ path). */
export async function uploadNewsImage(file: File): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
  const filePath = `${IMAGE_PREFIX}${fileName}`

  const { error } = await supabase.storage
    .from(IMAGE_BUCKET)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    })
  if (error) throw error

  const { data: urlData } = supabase.storage
    .from(IMAGE_BUCKET)
    .getPublicUrl(filePath)
  return urlData.publicUrl
}

/** Remove an image from cms-images if the URL points into the news/ path. */
export async function deleteNewsImage(url: string): Promise<void> {
  const bucketPrefix = `/${IMAGE_BUCKET}/`
  const idx = url.indexOf(bucketPrefix)
  if (idx === -1) return
  const filePath = url.slice(idx + bucketPrefix.length)
  await supabase.storage.from(IMAGE_BUCKET).remove([filePath])
}

/** Realtime refetch, matching the existing Dashboard subscription pattern. */
export function subscribeToNews(onChange: () => void) {
  return supabase
    .channel('news-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: TABLE },
      () => onChange(),
    )
    .subscribe()
}
