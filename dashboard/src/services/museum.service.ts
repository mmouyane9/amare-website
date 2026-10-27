import type { RealtimeChannel } from '@supabase/supabase-js'

import { supabase } from '@/lib/supabase'
import {
  MUSEUM_IMAGE_MIME_TYPES,
  MUSEUM_MAX_IMAGE_BYTES,
  MUSEUM_MAX_VIDEO_BYTES,
  MUSEUM_VIDEO_MIME_TYPES,
  formatFileSize,
  type MuseumItem,
  type MuseumItemInput,
  type MuseumMediaType,
} from '@/types/museum'

const TABLE = 'museum_items'
// Dedicated bucket created by 00038_create_museum_items.sql. It is public for
// reads and writable only by super_admin/admin through RLS.
const MEDIA_BUCKET = 'museum-media'
const MEDIA_PREFIX = 'museum/'

function cleanUrl(value: string, fieldLabel: string): string {
  const url = value.trim()
  if (!url) return ''

  if (url.startsWith('/')) return url

  try {
    const parsed = new URL(url)
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.toString()
    }
  } catch {
    // fall through to the friendly error below
  }

  throw new Error(`${fieldLabel} غير صالح. استخدم رابطًا يبدأ بـ https://`)
}

function toPayload(input: MuseumItemInput) {
  const mediaUrl = cleanUrl(input.media_url, 'رابط الوسائط')
  if (!mediaUrl) throw new Error('رابط الوسائط مطلوب')

  const thumbnailUrl = cleanUrl(input.thumbnail_url, 'رابط الصورة المصغرة')

  return {
    title: input.title.trim(),
    description: input.description.trim() || null,
    media_type: input.media_type,
    media_url: mediaUrl,
    thumbnail_url: thumbnailUrl || null,
    category: input.category.trim() || null,
    is_published: input.is_published,
    display_order: Number.isFinite(input.display_order)
      ? Math.max(0, Math.trunc(input.display_order))
      : 0,
  }
}

/** Dashboard collection query — RLS returns archived/draft items to admins. */
export async function getMuseumItems(): Promise<MuseumItem[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as MuseumItem[]
}

export async function createMuseumItem(
  input: MuseumItemInput,
): Promise<MuseumItem> {
  const { data, error } = await supabase
    .from(TABLE)
    .insert(toPayload(input))
    .select()
    .single()

  if (error) throw error
  return data as MuseumItem
}

export async function updateMuseumItem(
  id: string,
  input: MuseumItemInput,
): Promise<MuseumItem> {
  const { data, error } = await supabase
    .from(TABLE)
    .update(toPayload(input))
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as MuseumItem
}

export async function setMuseumPublished(
  id: string,
  isPublished: boolean,
): Promise<MuseumItem> {
  const { data, error } = await supabase
    .from(TABLE)
    .update({ is_published: isPublished })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as MuseumItem
}

/** Swap an item with its previous/next sibling and persist normalized order. */
export async function moveMuseumItem(
  id: string,
  direction: 'up' | 'down',
): Promise<void> {
  const items = await getMuseumItems()
  const index = items.findIndex((item) => item.id === id)
  if (index < 0) return

  const swapWith = direction === 'up' ? index - 1 : index + 1
  if (swapWith < 0 || swapWith >= items.length) return

  const ordered = [...items]
  ;[ordered[index], ordered[swapWith]] = [ordered[swapWith], ordered[index]]

  // Normalize display_order (1-based) only for rows that actually changed.
  const updates = ordered
    .map((item, position) => ({ item, nextOrder: position + 1 }))
    .filter(({ item, nextOrder }) => item.display_order !== nextOrder)
    .map(({ item, nextOrder }) =>
      supabase
        .from(TABLE)
        .update({ display_order: nextOrder })
        .eq('id', item.id),
    )

  if (!updates.length) return

  const results = await Promise.all(updates)
  const failure = results.find((result) => result.error)
  if (failure?.error) throw failure.error
}

/** Delete a record first, then remove only media that is no longer referenced. */
export async function deleteMuseumItem(id: string): Promise<void> {
  const { data: record, error: readError } = await supabase
    .from(TABLE)
    .select('media_url, thumbnail_url')
    .eq('id', id)
    .maybeSingle()

  if (readError) throw readError

  const { error } = await supabase.from(TABLE).delete().eq('id', id)
  if (error) throw error

  if (record) {
    await removeUnreferencedMuseumMedia([
      record.media_url,
      record.thumbnail_url,
    ]).catch((err) => {
      console.warn('[Museum] Media cleanup skipped:', err)
    })
  }
}

export function validateMuseumFile(
  file: File,
  kind: MuseumMediaType,
): string | null {
  const allowed =
    kind === 'video' ? MUSEUM_VIDEO_MIME_TYPES : MUSEUM_IMAGE_MIME_TYPES
  const maxBytes =
    kind === 'video' ? MUSEUM_MAX_VIDEO_BYTES : MUSEUM_MAX_IMAGE_BYTES

  if (file.type && !allowed.includes(file.type)) {
    return kind === 'video'
      ? 'صيغة الفيديو غير مدعومة. الصيغ المقبولة: MP4 وWebM وOgg.'
      : 'صيغة الصورة غير مدعومة. الصيغ المقبولة: JPG وPNG وWebP وGIF وAVIF.'
  }

  if (file.size > maxBytes) {
    return `حجم الملف يتجاوز الحد المسموح (${formatFileSize(maxBytes)}).`
  }

  return null
}

function fileExtension(file: File): string {
  const dotIndex = file.name.lastIndexOf('.')
  const fromName =
    dotIndex > -1 ? file.name.slice(dotIndex + 1).toLowerCase() : ''
  if (fromName && fromName.length <= 5) return fromName
  if (file.type === 'image/jpeg') return 'jpg'
  if (file.type === 'image/png') return 'png'
  if (file.type === 'image/webp') return 'webp'
  if (file.type === 'image/gif') return 'gif'
  if (file.type === 'image/avif') return 'avif'
  if (file.type === 'video/mp4') return 'mp4'
  if (file.type === 'video/webm') return 'webm'
  if (file.type === 'video/ogg') return 'ogg'
  return 'bin'
}

/**
 * Upload museum media to the dedicated public bucket under a unique path.
 * The database stores the resulting public URL, matching the existing
 * news/pages service convention.
 */
export async function uploadMuseumMedia(
  file: File,
  kind: MuseumMediaType,
): Promise<string> {
  const validationError = validateMuseumFile(file, kind)
  if (validationError) throw new Error(validationError)

  const path = `${MEDIA_PREFIX}${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}.${fileExtension(file)}`

  const { error } = await supabase.storage
    .from(MEDIA_BUCKET)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || undefined,
    })

  if (error) throw error

  const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path)
  return data.publicUrl
}

function toStoragePath(url: string | null): string | null {
  if (!url) return null
  const marker = `/storage/v1/object/public/${MEDIA_BUCKET}/`
  const markerIndex = url.indexOf(marker)
  if (markerIndex === -1) return null

  const rawPath = url.slice(markerIndex + marker.length).split('?')[0]
  if (!rawPath) return null

  try {
    return decodeURIComponent(rawPath)
  } catch {
    return rawPath
  }
}

async function isMediaStillReferenced(url: string): Promise<boolean> {
  const { count, error } = await supabase
    .from(TABLE)
    .select('id', { count: 'exact', head: true })
    .or(`media_url.eq.${url},thumbnail_url.eq.${url}`)

  // If the check fails, keep the object: never delete on uncertainty.
  if (error) throw error
  return (count ?? 0) > 0
}

/**
 * Remove only files that live in our own bucket AND are not referenced by any
 * remaining museum row. External URLs and in-flight references are ignored.
 */
export async function removeUnreferencedMuseumMedia(
  urls: Array<string | null | undefined>,
): Promise<void> {
  const uniqueUrls = Array.from(
    new Set(urls.filter((url): url is string => !!url)),
  )

  for (const url of uniqueUrls) {
    const path = toStoragePath(url)
    if (!path) continue

    const referenced = await isMediaStillReferenced(url)
    if (referenced) continue

    await supabase.storage.from(MEDIA_BUCKET).remove([path])
  }
}

export function subscribeToMuseum(onChange: () => void): RealtimeChannel {
  return supabase
    .channel('museum-items-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: TABLE },
      () => onChange(),
    )
    .subscribe()
}
