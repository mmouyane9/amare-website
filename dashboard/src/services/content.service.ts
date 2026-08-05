import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/services/auth.service'
import { HOME_PAGE_CONTENT } from '@/data/home-page-content'
import type {
  ContentPageRow,
  PageContent,
  PageSection,
  SectionType,
} from '@/types/content'

const TABLE = 'content_pages'

async function getUserId(): Promise<string | undefined> {
  const { data } = await getCurrentUser()
  return data?.user?.id
}

function parseContent(row: Record<string, unknown>): ContentPageRow {
  const content = row.content as Record<string, unknown> | null
  return {
    id: row.id as string,
    page_key: row.page_key as string,
    title: row.title as string,
    slug: row.slug as string,
    content: (content ?? { sections: [] }) as unknown as PageContent,
    seo_title: (row.seo_title ?? '') as string,
    seo_description: (row.seo_description ?? '') as string,
    seo_keywords: (row.seo_keywords ?? '') as string,
    og_image: (row.og_image ?? '') as string,
    status: (row.status ?? 'draft') as 'draft' | 'published',
    is_homepage: Boolean(row.is_homepage),
    sort_order: (row.sort_order ?? 0) as number,
    template: (row.template ?? 'default') as string,
    is_system: Boolean(row.is_system),
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
    updated_by: (row.updated_by ?? null) as string | null,
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function getPages(): Promise<ContentPageRow[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) throw new Error(error.message)
  return (data ?? []).map(parseContent)
}

export async function getPage(pageKey: string): Promise<ContentPageRow | null> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('page_key', pageKey)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw new Error(error.message)
  }
  return parseContent(data)
}

export async function initializePage(
  pageKey: string,
  title: string,
  slug: string,
  content?: PageContent,
): Promise<ContentPageRow> {
  const userId = await getUserId()
  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      page_key: pageKey,
      title,
      slug,
      status: 'draft',
      content: content ?? { sections: [] },
      updated_by: userId ?? null,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return parseContent(data)
}

export async function seedHomePage(): Promise<ContentPageRow> {
  const userId = await getUserId()

  const { data, error } = await supabase
    .from(TABLE)
    .upsert(
      {
        page_key: 'home',
        title: 'الرئيسية',
        slug: '/',
        content: HOME_PAGE_CONTENT,
        seo_title:
          'الجمعية المغربية لهواة البحث والاستكشاف | معًا نصنع أثرًا حقيقيًا',
        seo_description:
          'الجمعية المغربية لهواة البحث والاستكشاف — جمعية مغربية تعمل على التنمية الاجتماعية والتعليم والتمكين الاقتصادي، بأكثر من 500 مستفيد و12 عامًا من العمل الميداني.',
        seo_keywords: 'جمعية, تنمية, تطوع, المغرب, عمل خيري, تمكين',
        og_image: 'Amare%20files%20/logo.png',
        status: 'published',
        is_homepage: true,
        sort_order: 1,
        updated_by: userId ?? null,
      },
      { onConflict: 'page_key' },
    )
    .select()
    .single()

  if (error) throw new Error(error.message)
  return parseContent(data)
}

export async function saveDraft(
  pageKey: string,
  updates: {
    content?: PageContent
    seo_title?: string
    seo_description?: string
    seo_keywords?: string
    og_image?: string
    title?: string
    slug?: string
  },
): Promise<ContentPageRow> {
  const userId = await getUserId()
  const payload: Record<string, unknown> = {
    ...updates,
    status: 'draft',
    updated_by: userId ?? null,
  }

  const { data, error } = await supabase
    .from(TABLE)
    .update(payload)
    .eq('page_key', pageKey)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return parseContent(data)
}

export async function publishPage(pageKey: string): Promise<ContentPageRow> {
  const userId = await getUserId()
  const { data, error } = await supabase
    .from(TABLE)
    .update({ status: 'published', updated_by: userId ?? null })
    .eq('page_key', pageKey)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return parseContent(data)
}

// ---------------------------------------------------------------------------
// Section helpers (pure functions, no DB calls)
// ---------------------------------------------------------------------------

export function generateSectionId(): string {
  return `sec-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

export function generateButtonId(): string {
  return `btn-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`
}

export function generateStatId(): string {
  return `stat-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`
}

export function generateImageId(): string {
  return `img-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`
}

export function generateFaqItemId(): string {
  return `faq-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`
}

export function createSection(type: SectionType, order: number): PageSection {
  return {
    id: generateSectionId(),
    type,
    enabled: true,
    order,
    data: getDefaultData(type) as never,
  }
}

function getDefaultData(type: SectionType): Record<string, unknown> {
  switch (type) {
    case 'hero':
      return { heading: '', subheading: '', description: '', backgroundImage: '', buttons: [] }
    case 'heading':
      return { heading: '', subheading: '' }
    case 'text':
      return { heading: '', body: '' }
    case 'image':
      return { url: '', alt: '', caption: '' }
    case 'buttons':
      return { heading: '', buttons: [] }
    case 'statistics':
      return { heading: '', description: '', stats: [] }
    case 'gallery':
      return { heading: '', images: [] }
    case 'cta':
      return { heading: '', description: '', buttonLabel: '', buttonUrl: '', backgroundImage: '' }
    case 'faq':
      return { heading: '', items: [] }
    case 'video':
      return { url: '', thumbnail: '', heading: '' }
    case 'custom':
      return {}
  }
}

export function reorderSections(sections: PageSection[]): PageSection[] {
  return sections.map((section, index) => ({ ...section, order: index + 1 }))
}
