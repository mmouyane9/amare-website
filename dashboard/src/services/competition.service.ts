import { supabase } from '@/lib/supabase'

export async function debugCompetitionAuth(): Promise<void> {
  console.group('🔍 competition_registrations Auth Debug')

  const { data: userData, error: userError } = await supabase.auth.getUser()
  console.log('auth.getUser():', { user: userData.user, error: userError })
  console.log('auth.uid():', userData.user?.id ?? 'NULL')

  const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
  console.log('auth.getSession():', {
    session: sessionData.session ? 'present' : 'NULL',
    error: sessionError,
  })

  const uid = userData.user?.id
  if (uid) {
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', uid)
      .single()

    console.log('profiles lookup:', {
      profile: profileData,
      error: profileError,
    })
    console.log('profile.role:', profileData?.role ?? 'NOT FOUND')
  }

  const { data: rpcData, error: rpcError } = await supabase
    .rpc('is_admin')

  console.log('public.is_admin() RPC:', {
    result: rpcData,
    error: rpcError,
  })

  console.log('supabase client URL:', import.meta.env.VITE_SUPABASE_URL)

  console.groupEnd()
}

export interface CompetitionRegistration {
  id: string
  first_name: string
  last_name: string
  phone: string
  city: string
  payment_receipt_url: string
  status: string
  reviewed_at: string | null
  reviewed_by: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface CompetitionCreateInput {
  first_name: string
  last_name: string
  phone: string
  city: string
  payment_receipt_url?: string
  notes?: string
}

export interface CompetitionUpdateInput {
  first_name?: string
  last_name?: string
  phone?: string
  city?: string
  payment_receipt_url?: string
  notes?: string
  status?: string
}

export interface CompetitionStats {
  total: number
  pending: number
  approved: number
  rejected: number
}

export async function fetchCompetitionRegistrations(
  params: {
    search?: string
    status?: string
  } = {},
): Promise<CompetitionRegistration[]> {
  const { search, status } = params

  let query = supabase.from('competition_registrations').select('*')

  if (search) {
    query = query.or(
      `first_name.ilike.%${search}%,last_name.ilike.%${search}%,phone.ilike.%${search}%,city.ilike.%${search}%`,
    )
  }

  if (status && status !== 'all') {
    query = query.eq('status', status)
  }

  query = query.order('created_at', { ascending: false })

  const { data, error } = await query

  if (error) {
    console.error('fetchCompetitionRegistrations error:', error)
    throw error
  }

  console.log('fetchCompetitionRegistrations data:', data)
  return (data as CompetitionRegistration[]) ?? []
}

export async function getCompetitionStats(): Promise<CompetitionStats> {
  const { data, error } = await supabase
    .from('competition_registrations')
    .select('status')

  if (error) {
    console.error('getCompetitionStats error:', error)
    throw error
  }

  console.log('getCompetitionStats data:', data)

  const registrations = data ?? []
  return {
    total: registrations.length,
    pending: registrations.filter((r) => r.status === 'pending').length,
    approved: registrations.filter((r) => r.status === 'approved').length,
    rejected: registrations.filter((r) => r.status === 'rejected').length,
  }
}

export async function createCompetitionRegistration(
  input: CompetitionCreateInput,
): Promise<CompetitionRegistration> {
  const payload: Record<string, unknown> = {
    ...input,
    status: 'pending',
  }

  if (!payload.payment_receipt_url) {
    delete payload.payment_receipt_url
  }

  const { data, error } = await supabase
    .from('competition_registrations')
    .insert(payload)
    .select()
    .single()

  if (error) {
    console.error('createCompetitionRegistration error:', error)
    throw error
  }
  return data as CompetitionRegistration
}

export async function updateCompetitionRegistration(
  id: string,
  input: CompetitionUpdateInput,
): Promise<CompetitionRegistration> {
  const { data: userBefore } = await supabase.auth.getUser()
  console.log('updateCompetitionRegistration - auth.uid():', userBefore.user?.id ?? 'NULL')

  const { data, error } = await supabase
    .from('competition_registrations')
    .update(input)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('updateCompetitionRegistration error:', error)
    throw error
  }
  return data as CompetitionRegistration
}

export async function deleteCompetitionRegistration(id: string): Promise<void> {
  const { data: userBefore } = await supabase.auth.getUser()
  console.log('deleteCompetitionRegistration - auth.uid():', userBefore.user?.id ?? 'NULL')

  const { error } = await supabase
    .from('competition_registrations')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('deleteCompetitionRegistration error:', error)
    throw error
  }
}

export async function updateCompetitionStatus(
  id: string,
  status: string,
): Promise<CompetitionRegistration> {
  const { data: userBefore } = await supabase.auth.getUser()
  console.log('updateCompetitionStatus - auth.uid():', userBefore.user?.id ?? 'NULL')

  const payload: Record<string, unknown> = { status }

  if (status === 'approved' || status === 'rejected') {
    payload.reviewed_at = new Date().toISOString()
  }

  const { data, error } = await supabase
    .from('competition_registrations')
    .update(payload)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('updateCompetitionStatus error:', error)
    throw error
  }
  return data as CompetitionRegistration
}
