import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/services/auth.service'
import { HOME_PAGE_SECTIONS } from '@/data/home-page-content'
import { ABOUT_PAGE_SECTIONS } from '@/data/about-page-content'
import { ACTIVITIES_PAGE_SECTIONS } from '@/data/activities-page-content'
import type {
  PageRow,
  PageSection,
  SectionRow,
  SectionType,
} from '@/types/content'
import {
  defaultSectionData,
} from '@/types/content'

const PAGES_TABLE = 'pages'
const SECTIONS_TABLE = 'page_sections'

async function getUserId(): Promise<string | undefined> {
  const { data } = await getCurrentUser()
  return data?.user?.id
}

function parsePage(row: Record<string, unknown>): PageRow {
  return {
    id: row.id as string,
    title: row.title as string,
    slug: row.slug as string,
    template: (row.template ?? 'default') as string,
    status: (row.status ?? 'draft') as PageRow['status'],
    seo_title: (row.seo_title ?? '') as string,
    seo_description: (row.seo_description ?? '') as string,
    seo_keywords: (row.seo_keywords ?? '') as string,
    og_image: (row.og_image ?? '') as string,
    og_title: (row.og_title ?? '') as string,
    og_description: (row.og_description ?? '') as string,
    canonical_url: (row.canonical_url ?? '') as string,
    nav_title: (row.nav_title ?? '') as string,
    is_featured: Boolean(row.is_featured),
    sort_order: (row.sort_order ?? 0) as number,
    is_homepage: Boolean(row.is_homepage),
    created_by: (row.created_by ?? null) as string | null,
    updated_by: (row.updated_by ?? null) as string | null,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  }
}

function parseSection(row: Record<string, unknown>): SectionRow {
  return {
    id: row.id as string,
    page_id: row.page_id as string,
    section_type: row.section_type as string,
    section_key: (row.section_key ?? null) as string | null,
    title: (row.title ?? null) as string | null,
    description: (row.description ?? null) as string | null,
    content: (row.content as Record<string, unknown>) ?? {},
    settings: (row.settings as Record<string, unknown>) ?? {},
    styles: (row.styles as Record<string, unknown>) ?? {},
    visible: Boolean(row.visible),
    sort_order: (row.sort_order ?? 0) as number,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  }
}

// ---------------------------------------------------------------------------
// Pages
// ---------------------------------------------------------------------------

export async function getPages(): Promise<PageRow[]> {
  const { data, error } = await supabase
    .from(PAGES_TABLE)
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('[CMS Service] getPages error:', error)
    throw new Error(error.message)
  }
  console.log('[CMS Service] getPages:', (data ?? []).length, 'rows')
  return (data ?? []).map(parsePage)
}

export async function getPage(slug: string): Promise<PageRow | null> {
  const { data, error } = await supabase
    .from(PAGES_TABLE)
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw new Error(error.message)
  }
  return parsePage(data)
}

export async function initializePage(
  slug: string,
  title: string,
): Promise<PageRow> {
  const userId = await getUserId()
  console.log('[CMS Service] initializePage:', { slug, title, userId })
  const { data, error } = await supabase
    .from(PAGES_TABLE)
    .insert({
      title,
      slug,
      status: 'draft',
      created_by: userId ?? null,
      updated_by: userId ?? null,
    })
    .select()
    .single()

  if (error) {
    console.error('[CMS Service] initializePage error:', error)
    throw new Error(error.message)
  }
  console.log('[CMS Service] initializePage: created page id =', data.id)
  return parsePage(data)
}

export async function seedHomePage(): Promise<PageRow> {
  const userId = await getUserId()
  console.log('[CMS Service] seedHomePage')

  const { data, error } = await supabase
    .from(PAGES_TABLE)
    .upsert(
      {
        title: 'الرئيسية',
        slug: '/',
        status: 'published',
        is_homepage: true,
        sort_order: 1,
        seo_title: 'الجمعية المغربية لهواة البحث والاستكشاف | معًا نصنع أثرًا حقيقيًا',
        seo_description: 'الجمعية المغربية لهواة البحث والاستكشاف — جمعية مغربية تعمل على التنمية الاجتماعية والتعليم والتمكين الاقتصادي، بأكثر من 500 مستفيد و12 عامًا من العمل الميداني.',
        seo_keywords: 'جمعية, تنمية, تطوع, المغرب, عمل خيري, تمكين',
        og_image: 'Amare%20files%20/logo.png',
        created_by: userId ?? null,
        updated_by: userId ?? null,
      },
      { onConflict: 'slug' },
    )
    .select()
    .single()

  if (error) throw new Error(error.message)
  const page = parsePage(data)

  await saveSections(page.id, HOME_PAGE_SECTIONS as unknown as PageSection[])

  return page
}

export async function seedAboutPage(): Promise<PageRow> {
  const userId = await getUserId()

  const { data, error } = await supabase
    .from(PAGES_TABLE)
    .upsert(
      {
        title: 'من نحن',
        slug: '/about',
        status: 'published',
        sort_order: 2,
        seo_title: 'من نحن | الجمعية المغربية لهواة البحث والاستكشاف',
        seo_description: 'تعرف على الجمعية المغربية لهواة البحث والاستكشاف — رؤيتها الوطنية، رسالتها، قيمها، مكتبها المركزي، وخارطة توسعها في مختلف جهات المملكة.',
        seo_keywords: 'جمعية, رؤية وطنية, رسالة, قيم, مكتب مركزي, خارطة توسع, استكشاف, بحث علمي, تراث, بيئة, المغرب',
        og_image: 'Amare%20files%20/logo.png',
        created_by: userId ?? null,
        updated_by: userId ?? null,
      },
      { onConflict: 'slug' },
    )
    .select()
    .single()

  if (error) throw new Error(error.message)
  const page = parsePage(data)

  await saveSections(page.id, ABOUT_PAGE_SECTIONS as unknown as PageSection[])

  return page
}

export async function seedActivitiesPage(): Promise<PageRow> {
  const userId = await getUserId()

  const { data, error } = await supabase
    .from(PAGES_TABLE)
    .upsert(
      {
        title: 'أنشطتنا',
        slug: '/activities',
        status: 'published',
        sort_order: 3,
        seo_title: 'أنشطتنا | الجمعية المغربية لهواة البحث والاستكشاف',
        seo_description: 'أنشطة الجمعية المغربية لهواة البحث والاستكشاف — خرجات، مسابقات، تكوينات، معارض، لقاءات، وحملات بيئية.',
        seo_keywords: 'أنشطة, خرجات, مسابقات, تكوينات, معارض, لقاءات, حملات بيئية, استكشاف, جمعية, المغرب',
        og_image: 'Amare%20files%20/logo.png',
        created_by: userId ?? null,
        updated_by: userId ?? null,
      },
      { onConflict: 'slug' },
    )
    .select()
    .single()

  if (error) throw new Error(error.message)
  const page = parsePage(data)

  await saveSections(page.id, ACTIVITIES_PAGE_SECTIONS as unknown as PageSection[])

  return page
}

export async function saveDraft(
  slug: string,
  updates: {
    title?: string
    newSlug?: string
    seo_title?: string
    seo_description?: string
    seo_keywords?: string
    og_image?: string
    sections?: PageSection[]
  },
): Promise<PageRow> {
  const userId = await getUserId()
  const payload: Record<string, unknown> = { updated_by: userId ?? null }

  if (updates.title !== undefined) payload.title = updates.title
  if (updates.newSlug !== undefined) payload.slug = updates.newSlug
  if (updates.seo_title !== undefined) payload.seo_title = updates.seo_title
  if (updates.seo_description !== undefined) payload.seo_description = updates.seo_description
  if (updates.seo_keywords !== undefined) payload.seo_keywords = updates.seo_keywords
  if (updates.og_image !== undefined) payload.og_image = updates.og_image

  const { data, error } = await supabase
    .from(PAGES_TABLE)
    .update(payload)
    .eq('slug', slug)
    .select()
    .single()

  if (error) throw new Error(error.message)
  const page = parsePage(data)

  if (updates.sections !== undefined) {
    await saveSections(page.id, updates.sections)
  }

  return page
}

export async function publishPage(slug: string): Promise<PageRow> {
  const userId = await getUserId()
  const { data, error } = await supabase
    .from(PAGES_TABLE)
    .update({ status: 'published', updated_by: userId ?? null })
    .eq('slug', slug)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return parsePage(data)
}

// ---------------------------------------------------------------------------
// Sections
// ---------------------------------------------------------------------------

export async function getSections(pageId: string): Promise<SectionRow[]> {
  const { data, error } = await supabase
    .from(SECTIONS_TABLE)
    .select('*')
    .eq('page_id', pageId)
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('[CMS Service] getSections error:', error, 'page_id:', pageId)
    throw new Error(error.message)
  }
  const count = (data ?? []).length
  console.log('[CMS Service] getSections: page_id =', pageId, '→', count, 'rows')
  if (count === 0) {
    console.warn(
      '[CMS Service] getSections returned zero rows. Possible causes:\n' +
      '  1. RLS filtering — check page_sections.visible = TRUE and pages.status = \'published\'\n' +
      '  2. profiles table — ensure auth.uid() has a role (super_admin/admin/editor)\n' +
      '  3. Supabase project/keys — verify VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY',
      { pageId },
    )
  }
  return (data ?? []).map(parseSection)
}

export async function saveSections(pageId: string, sections: PageSection[]): Promise<void> {
  console.log('[CMS Service] saveSections: preserving metadata for page_id =', pageId)

  const { data: existingRows } = await supabase
    .from(SECTIONS_TABLE)
    .select('id, section_key, title, description')
    .eq('page_id', pageId)

  const metaById: Record<string, { section_key: string | null; title: string | null; description: string | null }> = {}
  if (existingRows) {
    for (const row of existingRows) {
      metaById[row.id] = {
        section_key: (row as Record<string, unknown>).section_key as string | null,
        title: (row as Record<string, unknown>).title as string | null,
        description: (row as Record<string, unknown>).description as string | null,
      }
    }
  }

  const { error: deleteErr } = await supabase.from(SECTIONS_TABLE).delete().eq('page_id', pageId)
  if (deleteErr) {
    console.error('[CMS Service] saveSections delete error:', deleteErr)
    throw new Error(deleteErr.message)
  }

  if (sections.length === 0) {
    console.log('[CMS Service] saveSections: no sections to insert')
    return
  }

  const rows = sections.map((section, index) => {
    const raw = section.data as Record<string, unknown>
    const settings: Record<string, unknown> = {}
    const content: Record<string, unknown> = {}
    const styles: Record<string, unknown> = {}

    for (const [key, value] of Object.entries(raw)) {
      if (key === '_styles') {
        Object.assign(styles, (value as Record<string, unknown>) ?? {})
      } else if (key.startsWith('_') && key !== '_renderer') {
        settings[key] = value
      } else {
        content[key] = value
      }
    }

    const existing = metaById[section.id]
    return {
      id: section.id,
      page_id: pageId,
      section_type: section.type,
      section_key: existing?.section_key ?? null,
      title: existing?.title ?? null,
      description: existing?.description ?? null,
      visible: section.enabled,
      sort_order: index + 1,
      content,
      settings,
      styles,
    }
  })

  const { error } = await supabase.from(SECTIONS_TABLE).insert(rows)
  if (error) {
    console.error('[CMS Service] saveSections insert error:', error, 'inserting', rows.length, 'rows')
    throw new Error(error.message)
  }
  console.log('[CMS Service] saveSections: inserted', rows.length, 'rows for page_id =', pageId)
}

// ---------------------------------------------------------------------------
// Page Content — flat field system
// ---------------------------------------------------------------------------

export async function getPageContent(pageId: string): Promise<Array<{ content_key: string; value: string; label: string | null }>> {
  const { data, error } = await supabase
    .from('page_content')
    .select('content_key, value, label')
    .eq('page_id', pageId)
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('[CMS Service] getPageContent error:', error)
    throw new Error(error.message)
  }
  return (data ?? []) as Array<{ content_key: string; value: string; label: string | null }>
}

export async function savePageField(
  pageId: string,
  contentKey: string,
  value: string,
  label?: string,
): Promise<void> {
  const { error } = await supabase
    .from('page_content')
    .upsert({
      page_id: pageId,
      content_key: contentKey,
      content_type: 'text',
      label: label ?? contentKey,
      value,
    }, { onConflict: 'page_id, content_key' })

  if (error) {
    console.error('[CMS Service] savePageField error:', error)
    throw new Error(error.message)
  }
}

// ---------------------------------------------------------------------------
// Default sections
// ---------------------------------------------------------------------------

export async function createDefaultSectionsForPage(pageId: string): Promise<void> {
  const sections: PageSection[] = [
    {
      id: generateSectionId(),
      type: 'hero',
      enabled: true,
      order: 1,
      data: defaultSectionData('hero') as never,
    },
  ]

  await saveSections(pageId, sections)
}

export async function seedHomepageSections(pageId: string): Promise<void> {
  const sections = HOME_PAGE_SECTIONS.map((section) => ({
    ...section,
    id: generateSectionId(),
  }))

  await saveSections(pageId, sections as PageSection[])
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
    data: defaultSectionData(type) as never,
  }
}

export function reorderSections(sections: PageSection[]): PageSection[] {
  return sections.map((section, index) => ({ ...section, order: index + 1 }))
}
