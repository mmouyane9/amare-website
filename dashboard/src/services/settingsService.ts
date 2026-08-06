import { supabase, supabaseAnon } from '@/lib/supabase'

export interface WebsiteSettings {
  id: string
  association_name: string | null
  short_name: string | null
  contact_email: string | null
  phone: string | null
  whatsapp: string | null
  address: string | null
  google_maps_url: string | null
  working_hours: string | null
  logo_url: string | null
  footer_logo_url: string | null
  favicon_url: string | null
  facebook: string | null
  instagram: string | null
  linkedin: string | null
  youtube: string | null
  tiktok: string | null
  twitter: string | null
  whatsapp_url: string | null
  telegram: string | null
  created_at: string | null
  updated_at: string | null
}

const SETTINGS_ID = '00000000-0000-0000-0000-000000000001'
const BRANDING_BUCKET = 'branding'

const DEFAULT_SETTINGS: WebsiteSettings = {
  id: SETTINGS_ID,
  association_name: null,
  short_name: null,
  contact_email: null,
  phone: null,
  whatsapp: null,
  address: null,
  google_maps_url: null,
  working_hours: null,
  logo_url: null,
  footer_logo_url: null,
  favicon_url: null,
  facebook: null,
  instagram: null,
  linkedin: null,
  youtube: null,
  tiktok: null,
  twitter: null,
  whatsapp_url: null,
  telegram: null,
  created_at: null,
  updated_at: null,
}

export async function getWebsiteSettings(): Promise<WebsiteSettings> {
  const { data, error } = await supabaseAnon
    .from('website_settings')
    .select('*')
    .eq('id', SETTINGS_ID)
    .maybeSingle()

  if (error) throw new Error('Failed to load website settings')
  return (data as WebsiteSettings) ?? DEFAULT_SETTINGS
}

export async function updateWebsiteSettings(
  patch: Partial<Omit<WebsiteSettings, 'id' | 'created_at' | 'updated_at'>>,
): Promise<WebsiteSettings> {
  const { data, error } = await supabase
    .from('website_settings')
    .update(patch)
    .eq('id', SETTINGS_ID)
    .select()
    .single()

  if (error) throw new Error('Failed to save website settings')
  return data as WebsiteSettings
}

export function subscribeToWebsiteSettings(
  callback: (settings: WebsiteSettings) => void,
): () => void {
  const channel = supabaseAnon
    .channel('website_settings_realtime')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'website_settings',
        filter: `id=eq.${SETTINGS_ID}`,
      },
      (payload) => {
        callback(payload.new as WebsiteSettings)
      },
    )
    .subscribe()

  return () => {
    supabaseAnon.removeChannel(channel)
  }
}

const ALLOWED_IMAGE_TYPES = ['image/png', 'image/svg+xml', 'image/jpeg', 'image/webp', 'image/x-icon', 'image/vnd.microsoft.icon']
const MAX_IMAGE_SIZE = 5 * 1024 * 1024

function validateImage(file: File): void {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error('Invalid file type. Allowed: PNG, SVG, JPG, WEBP, ICO')
  }
  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error('File too large. Maximum size is 5 MB')
  }
}

async function uploadToBranding(file: File, folder: string): Promise<string> {
  validateImage(file)
  const ext = file.name.split('.').pop() ?? 'png'
  const fileName = `${folder}/${Date.now()}.${ext}`

  const { error } = await supabase.storage
    .from(BRANDING_BUCKET)
    .upload(fileName, file, { upsert: true })

  if (error) throw new Error('Failed to upload image to storage')

  const { data: urlData } = supabase.storage
    .from(BRANDING_BUCKET)
    .getPublicUrl(fileName)

  return urlData.publicUrl
}

export async function deleteOldBrandingAsset(url: string | null): Promise<void> {
  if (!url) return
  try {
    const urlObj = new URL(url)
    const pathParts = urlObj.pathname.split('/')
    const bucketIndex = pathParts.findIndex((p) => p === BRANDING_BUCKET)
    if (bucketIndex === -1) return

    const filePath = pathParts.slice(bucketIndex + 1).join('/')
    if (!filePath) return

    await supabase.storage.from(BRANDING_BUCKET).remove([filePath])
  } catch {
    // Non-critical — just skip cleanup on failure
  }
}

export async function uploadLogo(
  file: File,
  currentUrl: string | null,
): Promise<string> {
  const url = await uploadToBranding(file, 'logo')
  if (currentUrl && currentUrl !== url) {
    await deleteOldBrandingAsset(currentUrl)
  }
  return url
}

export async function uploadFooterLogo(
  file: File,
  currentUrl: string | null,
): Promise<string> {
  const url = await uploadToBranding(file, 'footer')
  if (currentUrl && currentUrl !== url) {
    await deleteOldBrandingAsset(currentUrl)
  }
  return url
}

export async function uploadFavicon(
  file: File,
  currentUrl: string | null,
): Promise<string> {
  const url = await uploadToBranding(file, 'favicon')
  if (currentUrl && currentUrl !== url) {
    await deleteOldBrandingAsset(currentUrl)
  }
  return url
}

export async function updateSocialMedia(
  patch: Partial<{
    facebook: string | null
    instagram: string | null
    linkedin: string | null
    youtube: string | null
    tiktok: string | null
    twitter: string | null
    whatsapp_url: string | null
    telegram: string | null
  }>,
): Promise<WebsiteSettings> {
  return updateWebsiteSettings(patch)
}

export async function updateWebsiteBranding(
  patch: Partial<{
    logo_url: string | null
    footer_logo_url: string | null
    favicon_url: string | null
  }>,
): Promise<WebsiteSettings> {
  return updateWebsiteSettings(patch)
}
