import type { RealtimeChannel } from '@supabase/supabase-js'
import { supabase, supabaseAnon } from '@/lib/supabase'
import type {
  PageRow,
  PageContentRow,
  PageImageRow,
  PageVersionRow,
  PageSnapshot,
  SectionRow,
} from '@/types/content'

export type { PageRow, PageContentRow, PageImageRow, PageVersionRow, PageSnapshot, SectionRow }

export interface PagesListParams {
  search?: string
  status?: string
  template?: string
  page?: number
  pageSize?: number
}

export interface PagesListResult {
  pages: PageRow[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface PageCreateInput {
  title: string
  slug: string
  nav_title?: string
  template?: string
  status?: string
  sort_order?: number
  is_featured?: boolean
}

export interface PageUpdateInput {
  title?: string
  slug?: string
  nav_title?: string
  template?: string
  status?: string
  sort_order?: number
  is_featured?: boolean
  is_homepage?: boolean
  seo_title?: string
  seo_description?: string
  seo_keywords?: string
  og_title?: string
  og_description?: string
  og_image?: string
  canonical_url?: string
}

export interface PageContentInput {
  content_key: string
  content_type: 'text' | 'richtext' | 'markdown' | 'html' | 'json'
  label?: string
  value?: string
  json_value?: Record<string, unknown>
  sort_order?: number
}

export interface PageImageInput {
  image_key: string
  label?: string
  url?: string
  alt_text?: string
  sort_order?: number
}

// ---------------------------------------------------------------------------
// Pages CRUD
// ---------------------------------------------------------------------------

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

export async function getPages(
  params: PagesListParams = {},
): Promise<PagesListResult> {
  const { search, status, template, page = 1, pageSize = 20 } = params
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabaseAnon.from('pages').select('*', { count: 'exact' })

  if (search) {
    query = query.or(
      `title.ilike.%${search}%,slug.ilike.%${search}%,nav_title.ilike.%${search}%`,
    )
  }

  if (status && status !== 'all') {
    query = query.eq('status', status)
  }

  if (template && template !== 'all') {
    query = query.eq('template', template)
  }

  query = query.order('sort_order', { ascending: true }).range(from, to)

  const { data, error, count } = await query

  if (error) throw error
  const total = count ?? 0

  return {
    pages: (data ?? []).map(parsePage),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  }
}

export async function getPage(id: string): Promise<PageRow | null> {
  const { data, error } = await supabase
    .from('pages')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return parsePage(data)
}

export async function getPageBySlug(slug: string): Promise<PageRow | null> {
  const { data, error } = await supabase
    .from('pages')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return parsePage(data)
}

export async function createPage(input: PageCreateInput): Promise<PageRow> {
  const { data, error } = await supabase
    .from('pages')
    .insert({
      ...input,
      status: input.status ?? 'draft',
      template: input.template ?? 'default',
    })
    .select()
    .single()

  if (error) throw error
  return parsePage(data)
}

export async function updatePage(id: string, input: PageUpdateInput): Promise<PageRow> {
  const { data, error } = await supabase
    .from('pages')
    .update(input)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return parsePage(data)
}

export async function deletePage(id: string): Promise<void> {
  const { error } = await supabase.from('pages').delete().eq('id', id)
  if (error) throw error
}

export async function duplicatePage(id: string): Promise<PageRow> {
  const original = await getPage(id)
  if (!original) throw new Error('الصفحة غير موجودة')

  const { data, error } = await supabase
    .from('pages')
    .insert({
      title: `${original.title} (نسخة)`,
      slug: `${original.slug}-copy-${Date.now()}`,
      template: original.template,
      status: 'draft',
      nav_title: original.nav_title ? `${original.nav_title} (نسخة)` : '',
      sort_order: (await getMaxSortOrder()) + 1,
    })
    .select()
    .single()

  if (error) throw error

  return parsePage(data)
}

async function getMaxSortOrder(): Promise<number> {
  const { data } = await supabase
    .from('pages')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
    .single()

  return (data?.sort_order ?? 0) as number
}

// ---------------------------------------------------------------------------
// Page Content
// ---------------------------------------------------------------------------

function parseContent(row: Record<string, unknown>): PageContentRow {
  return {
    id: row.id as string,
    page_id: row.page_id as string,
    content_key: row.content_key as string,
    content_type: (row.content_type ?? 'text') as PageContentRow['content_type'],
    label: (row.label ?? null) as string | null,
    value: (row.value ?? null) as string | null,
    json_value: (row.json_value ?? null) as Record<string, unknown> | null,
    sort_order: (row.sort_order ?? 0) as number,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  }
}

export async function getPageContent(pageId: string): Promise<PageContentRow[]> {
  const { data, error } = await supabase
    .from('page_content')
    .select('*')
    .eq('page_id', pageId)
    .order('sort_order', { ascending: true })

  if (error) throw error
  return (data ?? []).map(parseContent)
}

export async function savePageContent(pageId: string, items: PageContentInput[]): Promise<void> {
  const { error: deleteErr } = await supabase
    .from('page_content')
    .delete()
    .eq('page_id', pageId)
  if (deleteErr) throw deleteErr

  if (items.length === 0) return

  const rows = items.map((item, index) => ({
    page_id: pageId,
    content_key: item.content_key,
    content_type: item.content_type,
    label: item.label ?? null,
    value: item.value ?? null,
    json_value: item.json_value ?? null,
    sort_order: item.sort_order ?? index + 1,
  }))

  const { error } = await supabase.from('page_content').insert(rows)
  if (error) throw error
}

// ---------------------------------------------------------------------------
// Page Images
// ---------------------------------------------------------------------------

function parseImage(row: Record<string, unknown>): PageImageRow {
  return {
    id: row.id as string,
    page_id: row.page_id as string,
    image_key: row.image_key as string,
    label: (row.label ?? null) as string | null,
    url: (row.url ?? null) as string | null,
    alt_text: (row.alt_text ?? null) as string | null,
    width: (row.width ?? null) as number | null,
    height: (row.height ?? null) as number | null,
    file_size: (row.file_size ?? null) as number | null,
    mime_type: (row.mime_type ?? null) as string | null,
    sort_order: (row.sort_order ?? 0) as number,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  }
}

export async function getPageImages(pageId: string): Promise<PageImageRow[]> {
  const { data, error } = await supabase
    .from('page_images')
    .select('*')
    .eq('page_id', pageId)
    .order('sort_order', { ascending: true })

  if (error) throw error
  return (data ?? []).map(parseImage)
}

export async function savePageImages(pageId: string, items: PageImageInput[]): Promise<void> {
  const { error: deleteErr } = await supabase
    .from('page_images')
    .delete()
    .eq('page_id', pageId)
  if (deleteErr) throw deleteErr

  if (items.length === 0) return

  const rows = items.map((item, index) => ({
    page_id: pageId,
    image_key: item.image_key,
    label: item.label ?? null,
    url: item.url ?? null,
    alt_text: item.alt_text ?? null,
    sort_order: item.sort_order ?? index + 1,
  }))

  const { error } = await supabase.from('page_images').insert(rows)
  if (error) throw error
}

export async function uploadPageImage(
  pageId: string,
  imageKey: string,
  file: File,
  label?: string,
): Promise<PageImageRow> {
  const filePath = `pages/${pageId}/${imageKey}-${Date.now()}-${file.name}`
  const { error: uploadErr } = await supabase.storage
    .from('cms-images')
    .upload(filePath, file, { upsert: true })

  if (uploadErr) throw uploadErr

  const { data: urlData } = supabase.storage
    .from('cms-images')
    .getPublicUrl(filePath)

  const { data, error } = await supabase
    .from('page_images')
    .upsert(
      {
        page_id: pageId,
        image_key: imageKey,
        url: urlData.publicUrl,
        label: label ?? null,
        alt_text: file.name,
        mime_type: file.type,
        file_size: file.size,
      },
      { onConflict: 'page_id,image_key' },
    )
    .select()
    .single()

  if (error) throw error
  return parseImage(data)
}

export async function deletePageImage(pageId: string, imageKey: string): Promise<void> {
  const { error } = await supabase
    .from('page_images')
    .delete()
    .eq('page_id', pageId)
    .eq('image_key', imageKey)

  if (error) throw error
}

// ---------------------------------------------------------------------------
// Page Sections
// ---------------------------------------------------------------------------

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

export async function getPageSections(pageId: string): Promise<SectionRow[]> {
  const { data, error } = await supabase
    .from('page_sections')
    .select('*')
    .eq('page_id', pageId)
    .order('sort_order', { ascending: true })

  if (error) throw error
  return (data ?? []).map(parseSection)
}

export async function addPageSection(
  pageId: string,
  sectionType: string,
  title?: string,
): Promise<SectionRow> {
  const { data: maxOrder } = await supabase
    .from('page_sections')
    .select('sort_order')
    .eq('page_id', pageId)
    .order('sort_order', { ascending: false })
    .limit(1)
    .single()

  const nextOrder = (maxOrder?.sort_order ?? 0) as number + 1

  const { data, error } = await supabase
    .from('page_sections')
    .insert({
      page_id: pageId,
      section_type: sectionType,
      section_key: `section-${Date.now()}`,
      title: title ?? sectionType,
      visible: true,
      sort_order: nextOrder,
    })
    .select()
    .single()

  if (error) throw error
  return parseSection(data)
}

export async function updatePageSection(
  sectionId: string,
  updates: {
    visible?: boolean
    title?: string
    content?: Record<string, unknown>
    settings?: Record<string, unknown>
    sort_order?: number
  },
): Promise<SectionRow> {
  const { data, error } = await supabase
    .from('page_sections')
    .update(updates)
    .eq('id', sectionId)
    .select()
    .single()

  if (error) throw error
  return parseSection(data)
}

export async function deletePageSection(sectionId: string): Promise<void> {
  const { error } = await supabase.from('page_sections').delete().eq('id', sectionId)
  if (error) throw error
}

export async function reorderPageSections(
  _pageId: string,
  sectionIds: string[],
): Promise<void> {
  const updates = sectionIds.map((id, index) => ({
    id,
    sort_order: index + 1,
  }))

  for (const update of updates) {
    await supabase
      .from('page_sections')
      .update({ sort_order: update.sort_order })
      .eq('id', update.id)
  }
}

// ---------------------------------------------------------------------------
// Page Versions
// ---------------------------------------------------------------------------

function parseVersion(row: Record<string, unknown>): PageVersionRow {
  return {
    id: row.id as string,
    page_id: row.page_id as string,
    version: row.version as number,
    snapshot: (row.snapshot ?? {}) as Record<string, unknown>,
    message: (row.message ?? null) as string | null,
    created_by: (row.created_by ?? null) as string | null,
    created_at: row.created_at as string,
  }
}

export async function getPageVersions(pageId: string): Promise<PageVersionRow[]> {
  const { data, error } = await supabase
    .from('page_versions')
    .select('*')
    .eq('page_id', pageId)
    .order('version', { ascending: false })

  if (error) throw error
  return (data ?? []).map(parseVersion)
}

export async function createPageVersion(
  pageId: string,
  message?: string,
): Promise<PageVersionRow> {
  const { data: pageData } = await supabase
    .from('pages')
    .select('*')
    .eq('id', pageId)
    .single()

  const { data: sectionsData } = await supabase
    .from('page_sections')
    .select('*')
    .eq('page_id', pageId)
    .order('sort_order', { ascending: true })

  const { data: contentData } = await supabase
    .from('page_content')
    .select('*')
    .eq('page_id', pageId)
    .order('sort_order', { ascending: true })

  const { data: imagesData } = await supabase
    .from('page_images')
    .select('*')
    .eq('page_id', pageId)
    .order('sort_order', { ascending: true })

  const { data: maxVersion } = await supabase
    .from('page_versions')
    .select('version')
    .eq('page_id', pageId)
    .order('version', { ascending: false })
    .limit(1)
    .single()

  const nextVersion = (maxVersion?.version ?? 0) + 1

  const snapshot = {
    page: pageData,
    sections: sectionsData ?? [],
    content: contentData ?? [],
    images: imagesData ?? [],
    snapshot_at: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from('page_versions')
    .insert({
      page_id: pageId,
      version: nextVersion,
      snapshot,
      message: message ?? `الإصدار ${nextVersion}`,
    })
    .select()
    .single()

  if (error) throw error
  return parseVersion(data)
}

export async function rollbackPage(pageId: string, versionId: string): Promise<void> {
  const { data: version, error } = await supabase
    .from('page_versions')
    .select('*')
    .eq('id', versionId)
    .single()

  if (error || !version) throw new Error('الإصدار غير موجود')

  const snap = version.snapshot as Record<string, unknown>
  const pageSnap = snap.page as Record<string, unknown>
  const sectionsSnap = snap.sections as Record<string, unknown>[]
  const contentSnap = snap.content as Record<string, unknown>[]
  const imagesSnap = snap.images as Record<string, unknown>[]

  const pageCols = [
    'title', 'slug', 'template', 'status', 'seo_title', 'seo_description',
    'seo_keywords', 'og_title', 'og_description', 'og_image', 'canonical_url',
    'nav_title', 'is_featured', 'sort_order', 'is_homepage',
  ]

  const pageUpdate: Record<string, unknown> = {}
  for (const col of pageCols) {
    if (col in pageSnap) pageUpdate[col] = pageSnap[col]
  }

  await supabase.from('pages').update(pageUpdate).eq('id', pageId)
  await supabase.from('page_sections').delete().eq('page_id', pageId)
  await supabase.from('page_content').delete().eq('page_id', pageId)
  await supabase.from('page_images').delete().eq('page_id', pageId)

  if (sectionsSnap?.length) {
    const secRows = sectionsSnap.map((s) => {
      const { ...rest } = s
      delete rest.id
      delete rest.created_at
      delete rest.updated_at
      return { ...rest as Record<string, unknown>, page_id: pageId }
    })
    await supabase.from('page_sections').insert(secRows)
  }

  if (contentSnap?.length) {
    const conRows = contentSnap.map((c) => {
      const { ...rest } = c
      delete rest.id
      delete rest.created_at
      delete rest.updated_at
      return { ...rest as Record<string, unknown>, page_id: pageId }
    })
    await supabase.from('page_content').insert(conRows)
  }

  if (imagesSnap?.length) {
    const imgRows = imagesSnap.map((i) => {
      const { ...rest } = i
      delete rest.id
      delete rest.created_at
      delete rest.updated_at
      return { ...rest as Record<string, unknown>, page_id: pageId }
    })
    await supabase.from('page_images').insert(imgRows)
  }
}

export async function getPageFullSnapshot(pageId: string): Promise<PageSnapshot> {
  const [page, sections, content, images] = await Promise.all([
    getPage(pageId),
    getPageSections(pageId),
    getPageContent(pageId),
    getPageImages(pageId),
  ])

  if (!page) throw new Error('الصفحة غير موجودة')

  return { page, sections, content, images }
}

// ---------------------------------------------------------------------------
// Realtime Subscription
// ---------------------------------------------------------------------------

export function subscribeToPages(onChange: () => void): RealtimeChannel {
  return supabase
    .channel('pages-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'pages' },
      () => onChange(),
    )
    .subscribe()
}
