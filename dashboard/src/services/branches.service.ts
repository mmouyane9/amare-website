import { supabase, supabaseAnon } from '@/lib/supabase'
import type { Region, City } from '@/data/branches'

const REGIONS_TABLE = 'regions'
const CITIES_TABLE = 'cities'

// ==========================================================================
// REGIONS
// ==========================================================================

export async function getRegions(): Promise<Region[]> {
  const { data, error } = await supabaseAnon
    .from(REGIONS_TABLE)
    .select('*')
    .order('display_order', { ascending: true })
  if (error) throw new Error(error.message)
  return (data ?? []) as Region[]
}

export async function getPublishedRegions(): Promise<Region[]> {
  const { data, error } = await supabaseAnon
    .from(REGIONS_TABLE)
    .select('*')
    .eq('published', true)
    .order('display_order', { ascending: true })
  if (error) throw new Error(error.message)
  return (data ?? []) as Region[]
}

export async function getRegionById(id: string): Promise<Region> {
  const { data, error } = await supabaseAnon
    .from(REGIONS_TABLE)
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw new Error(error.message)
  return data as Region
}

export async function getRegionBySlug(slug: string): Promise<Region> {
  const { data, error } = await supabaseAnon
    .from(REGIONS_TABLE)
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single()
  if (error) throw new Error(error.message)
  return data as Region
}

export async function createRegion(input: Partial<Region>): Promise<Region> {
  const { data, error } = await supabase
    .from(REGIONS_TABLE)
    .insert(input)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data as Region
}

export async function updateRegion(id: string, input: Partial<Region>): Promise<Region> {
  const { data, error } = await supabase
    .from(REGIONS_TABLE)
    .update(input)
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data as Region
}

export async function deleteRegion(id: string): Promise<void> {
  const { error } = await supabase.from(REGIONS_TABLE).delete().eq('id', id)
  if (error) throw new Error(error.message)
}

// ==========================================================================
// CITIES
// ==========================================================================

export async function getCitiesByRegion(regionId: string): Promise<City[]> {
  const { data, error } = await supabaseAnon
    .from(CITIES_TABLE)
    .select('*')
    .eq('region_id', regionId)
    .eq('published', true)
    .order('created_at', { ascending: true })
  if (error) throw new Error(error.message)
  return (data ?? []) as City[]
}

export async function getCityById(id: string): Promise<City> {
  const { data, error } = await supabaseAnon
    .from(CITIES_TABLE)
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw new Error(error.message)
  return data as City
}

export async function createCity(input: Partial<City>): Promise<City> {
  const { data, error } = await supabase
    .from(CITIES_TABLE)
    .insert(input)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data as City
}

export async function updateCity(id: string, input: Partial<City>): Promise<City> {
  const { data, error } = await supabase
    .from(CITIES_TABLE)
    .update(input)
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data as City
}

export async function deleteCity(id: string): Promise<void> {
  const { error } = await supabase.from(CITIES_TABLE).delete().eq('id', id)
  if (error) throw new Error(error.message)
}

// ==========================================================================
// BRANCH POSTS
// ==========================================================================

export async function getPostsByCity(cityId: string) {
  const { data, error } = await supabaseAnon
    .from('branch_posts')
    .select('*')
    .eq('city_id', cityId)
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []) as Array<{ id: string; city_id: string; title: string; content?: string; featured_image?: string; published?: boolean; created_at: string }>
}

export async function createPost(input: { city_id: string; title: string; content?: string; featured_image?: string }) {
  const { data, error } = await supabase
    .from('branch_posts')
    .insert({ ...input, published: true })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data
}

export async function updatePost(id: string, input: { title?: string; content?: string; featured_image?: string }) {
  const { data, error } = await supabase
    .from('branch_posts')
    .update(input)
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data
}

export async function deletePost(id: string): Promise<void> {
  const { error } = await supabase.from('branch_posts').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

// ==========================================================================
// POST IMAGES (Gallery)
// ==========================================================================

export async function getPostImages(postId: string) {
  const { data, error } = await supabaseAnon
    .from('branch_post_images')
    .select('*')
    .eq('post_id', postId)
    .order('sort_order', { ascending: true })
  if (error) throw new Error(error.message)
  return (data ?? []) as Array<{ id: string; post_id: string; image_url: string; sort_order?: number }>
}

export async function createPostImage(input: { post_id: string; image_url: string }) {
  const { data, error } = await supabase
    .from('branch_post_images')
    .insert(input)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data
}

export async function updatePostImage(id: string, input: { image_url?: string }) {
  const { data, error } = await supabase
    .from('branch_post_images')
    .update(input)
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data
}

export async function deletePostImage(id: string): Promise<void> {
  const { error } = await supabase.from('branch_post_images').delete().eq('id', id)
  if (error) throw new Error(error.message)
}
