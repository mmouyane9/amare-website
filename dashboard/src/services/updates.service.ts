import { supabase, supabaseAnon } from '@/lib/supabase'
import type { HeroUpdate, HeroUpdateCreateInput } from '@/types/updates'

const TABLE = 'hero_updates'
const BUCKET = 'hero-images'

export async function getHeroUpdates(): Promise<HeroUpdate[]> {
  const { data, error } = await supabaseAnon
    .from(TABLE)
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw new Error('Failed to load hero updates')
  return (data ?? []) as HeroUpdate[]
}

export async function createHeroUpdate(
  input: HeroUpdateCreateInput,
): Promise<HeroUpdate> {
  if (input.status === 'live') {
    await supabase
      .from(TABLE)
      .update({ status: 'draft' })
      .eq('status', 'live')
  }

  const { data, error } = await supabase
    .from(TABLE)
    .insert(input)
    .select()
    .single()

  if (error) throw new Error(error.message || 'Failed to create update')
  return data as HeroUpdate
}

export async function updateHeroUpdate(
  id: string,
  input: Partial<HeroUpdateCreateInput>,
): Promise<HeroUpdate> {
  if (input.status === 'live') {
    await supabase
      .from(TABLE)
      .update({ status: 'draft' })
      .eq('status', 'live')
      .neq('id', id)
  }

  const { data, error } = await supabase
    .from(TABLE)
    .update(input)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message || 'Failed to update update')
  return data as HeroUpdate
}

export async function deleteHeroUpdate(id: string): Promise<void> {
  const { data: record } = await supabase
    .from(TABLE)
    .select('image_url')
    .eq('id', id)
    .single()

  if (record?.image_url) {
    await deleteHeroImage(record.image_url)
  }

  const { error } = await supabase.from(TABLE).delete().eq('id', id)
  if (error) throw new Error(error.message || 'Failed to delete update')
}

export async function uploadHeroImage(file: File): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
  const filePath = `hero/${fileName}`

  const { error } = await supabase.storage.from(BUCKET).upload(filePath, file, {
    cacheControl: '3600',
    upsert: false,
  })

  if (error) throw new Error(error.message || 'Failed to upload image')

  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(filePath)
  return urlData.publicUrl
}

export async function deleteHeroImage(url: string): Promise<void> {
  const bucketPrefix = `${BUCKET}/`
  const idx = url.indexOf(bucketPrefix)
  if (idx === -1) return
  const filePath = url.slice(idx + bucketPrefix.length)
  await supabase.storage.from(BUCKET).remove([filePath])
}

export function subscribeToHeroUpdates(onChange: () => void) {
  return supabase
    .channel('hero-updates-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: TABLE },
      () => onChange(),
    )
    .subscribe()
}
