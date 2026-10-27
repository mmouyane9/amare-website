export type MuseumMediaType = 'image' | 'video'

export interface MuseumItem {
  id: string
  title: string
  description: string | null
  media_type: MuseumMediaType | string
  media_url: string
  thumbnail_url: string | null
  category: string | null
  is_published: boolean
  display_order: number
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface MuseumItemInput {
  title: string
  description: string
  media_type: MuseumMediaType
  media_url: string
  thumbnail_url: string
  category: string
  is_published: boolean
  display_order: number
}

export const MUSEUM_MEDIA_LABELS: Record<string, string> = {
  image: 'صورة',
  video: 'فيديو',
}

export const MUSEUM_STATUS_LABELS: Record<string, string> = {
  published: 'منشور',
  draft: 'غير منشور',
}

export const MUSEUM_IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp,image/gif,image/avif'
export const MUSEUM_VIDEO_ACCEPT = 'video/mp4,video/webm,video/ogg'

export const MUSEUM_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
]

export const MUSEUM_VIDEO_MIME_TYPES = [
  'video/mp4',
  'video/webm',
  'video/ogg',
]

// Keep these in sync with the storage bucket limits in
// dashboard/supabase/migrations/00038_create_museum_items.sql.
export const MUSEUM_MAX_IMAGE_BYTES = 20 * 1024 * 1024 // 20 MB
export const MUSEUM_MAX_VIDEO_BYTES = 100 * 1024 * 1024 // 100 MB

export function formatFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${Math.round(bytes / (1024 * 1024))} MB`
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`
  return `${bytes} B`
}
