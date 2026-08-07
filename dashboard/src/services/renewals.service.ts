import { supabase } from '@/lib/supabase'

export interface RenewalRequest {
  id: string
  first_name: string
  last_name: string
  membership_number: string
  status: string
  notes: string | null
  created_at: string
  updated_at: string
}

export interface RenewalCreateInput {
  membership_number: string
  first_name: string
  last_name: string
  notes?: string
}

export interface RenewalUpdateInput {
  first_name?: string
  last_name?: string
  membership_number?: string
  notes?: string
  status?: string
}

export interface RenewalStats {
  total: number
  pending: number
  approved: number
  rejected: number
}

export async function fetchRenewalRequests(
  params: {
    search?: string
    status?: string
  } = {},
): Promise<RenewalRequest[]> {
  const { search, status } = params

  let query = supabase.from('membership_renewals').select('*')

  if (search) {
    query = query.or(
      `first_name.ilike.%${search}%,last_name.ilike.%${search}%,membership_number.ilike.%${search}%`,
    )
  }

  if (status && status !== 'all') {
    query = query.eq('status', status)
  }

  query = query.order('created_at', { ascending: false })

  const { data, error } = await query

  if (error) {
    console.error('fetchRenewalRequests error:', error)
    throw error
  }

  console.log('fetchRenewalRequests data:', data)
  return (data as RenewalRequest[]) ?? []
}

export async function getRenewalStats(): Promise<RenewalStats> {
  const { data, error } = await supabase
    .from('membership_renewals')
    .select('status')

  if (error) {
    console.error('getRenewalStats error:', error)
    throw error
  }

  console.log('getRenewalStats data:', data)

  const requests = data ?? []
  return {
    total: requests.length,
    pending: requests.filter((r) => r.status === 'pending').length,
    approved: requests.filter((r) => r.status === 'approved').length,
    rejected: requests.filter((r) => r.status === 'rejected').length,
  }
}

export async function createRenewalRequest(
  input: RenewalCreateInput,
): Promise<RenewalRequest> {
  const { data, error } = await supabase
    .from('membership_renewals')
    .insert({
      ...input,
      status: 'pending',
    })
    .select()
    .single()

  if (error) {
    console.error('createRenewalRequest error:', error)
    throw error
  }
  return data as RenewalRequest
}

export async function updateRenewalRequest(
  id: string,
  input: RenewalUpdateInput,
): Promise<RenewalRequest> {
  const { data, error } = await supabase
    .from('membership_renewals')
    .update(input)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('updateRenewalRequest error:', error)
    throw error
  }
  return data as RenewalRequest
}

export async function deleteRenewalRequest(id: string): Promise<void> {
  const { error } = await supabase
    .from('membership_renewals')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('deleteRenewalRequest error:', error)
    throw error
  }
}

export async function updateRenewalStatus(
  id: string,
  status: string,
): Promise<RenewalRequest> {
  const { data, error } = await supabase
    .from('membership_renewals')
    .update({ status })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('updateRenewalStatus error:', error)
    throw error
  }
  return data as RenewalRequest
}
