import { supabase, supabaseAnon } from '@/lib/supabase'

export interface AppSettings {
  id: string
  association_name: string | null
  email: string | null
  phone: string | null
  address: string | null
  logo_url: string | null
  favicon_url: string | null
  facebook_url: string | null
  instagram_url: string | null
  linkedin_url: string | null
  youtube_url: string | null
  tiktok_url: string | null
  whatsapp_url: string | null
}

const SETTINGS_ID = '00000000-0000-0000-0000-000000000001'

const DEFAULT_SETTINGS: AppSettings = {
  id: SETTINGS_ID,
  association_name: null,
  email: null,
  phone: null,
  address: null,
  logo_url: null,
  favicon_url: null,
  facebook_url: null,
  instagram_url: null,
  linkedin_url: null,
  youtube_url: null,
  tiktok_url: null,
  whatsapp_url: null,
}

export async function getSettings(): Promise<AppSettings> {
  const { data, error } = await supabaseAnon
    .from('settings')
    .select('*')
    .eq('id', SETTINGS_ID)
    .maybeSingle()

  if (error) throw new Error('Failed to load settings')
  return (data as AppSettings) ?? DEFAULT_SETTINGS
}

export async function saveSettings(
  patch: Partial<AppSettings>,
): Promise<AppSettings> {
  const merged = { ...DEFAULT_SETTINGS, ...patch, id: SETTINGS_ID }
  const { data, error } = await supabase
    .from('settings')
    .upsert(merged, { onConflict: 'id' })
    .select()
    .single()

  if (error) throw new Error('Failed to save settings')
  return data as AppSettings
}

export interface AdminProfile {
  id: string
  full_name: string | null
  email: string | null
  role: string | null
  created_at: string | null
  updated_at: string | null
}

export async function listAdmins(): Promise<AdminProfile[]> {
  const roles = ['super_admin', 'admin']
  let allData: AdminProfile[] = []

  for (const role of roles) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', role)
      .order('created_at', { ascending: false })

    if (error) throw new Error('Failed to load administrators')
    if (data) allData = allData.concat(data as AdminProfile[])
  }

  return allData
}

async function callAdminFunction<T>(
  action: string,
  payload: Record<string, unknown>,
): Promise<T> {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session?.access_token) {
    throw new Error('يجب تسجيل الدخول للوصول إلى هذه الخدمة')
  }

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-management`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ action, ...payload }),
    },
  )

  if (response.status === 401) {
    throw new Error('انتهت الجلسة، يرجى تسجيل الدخول مرة أخرى')
  }

  let body: { success?: boolean; message?: string; data?: T } = {}
  try {
    body = (await response.json()) as typeof body
  } catch {
    // ignore malformed responses
  }

  if (!response.ok || body.success === false) {
    throw new Error(body.message ?? 'فشلت العملية')
  }

  return body.data as T
}

export async function createAdmin(
  email: string,
  password: string,
  fullName: string,
  role: string,
): Promise<AdminProfile> {
  return callAdminFunction<AdminProfile>('create_admin', {
    email,
    password,
    full_name: fullName,
    role,
  })
}

export async function updateAdmin(
  id: string,
  patch: { full_name?: string; email?: string; role?: string },
): Promise<AdminProfile> {
  const { data, error } = await supabase
    .from('profiles')
    .update(patch)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error('Failed to update administrator')
  return data as AdminProfile
}

export async function deleteAdmin(id: string): Promise<void> {
  await callAdminFunction<null>('delete_admin', { id })
}

export async function uploadBrandingImage(
  file: File,
  bucket: string,
  folder: string,
): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'png'
  const fileName = `${folder}/${Date.now()}.${ext}`

  const { error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file, { upsert: true })

  if (error) throw new Error('Failed to upload image')

  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(fileName)

  return urlData.publicUrl
}
