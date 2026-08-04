import type { RealtimeChannel } from '@supabase/supabase-js'
import { supabase, supabaseAnon } from '@/lib/supabase'

export interface Member {
  id: string
  member_number: string | null
  first_name: string | null
  last_name: string | null
  email: string | null
  phone: string | null
  address: string | null
  birth_date: string | null
  birth_place: string | null
  national_id: string | null
  status: string | null
  membership_date: string | null
  profile_photo_url: string | null
  national_id_front_url: string | null
  national_id_back_url: string | null
  declaration_accepted: boolean | null
  created_at: string
  updated_at: string
}

export interface MemberCreateInput {
  member_number: string
  first_name: string
  last_name: string
  email?: string
  phone?: string
  address?: string
  birth_date?: string
  birth_place?: string
  national_id?: string
  status: string
  membership_date?: string
}

export interface MemberUpdateInput extends Partial<MemberCreateInput> {}

export interface MembersListParams {
  search?: string
  status?: string
  page?: number
  pageSize?: number
}

export interface MembersListResult {
  members: Member[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export async function getMembers(
  params: MembersListParams = {},
): Promise<MembersListResult> {
  const { search, status, page = 1, pageSize = 10 } = params
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabaseAnon.from('members').select('*', { count: 'exact' })

  if (search) {
    query = query.or(
      `first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,member_number.ilike.%${search}%`,
    )
  }

  if (status && status !== 'all') {
    query = query.eq('status', status)
  }

  query = query.order('created_at', { ascending: false }).range(from, to)

  const { data, error, count } = await query

  if (error) throw new Error('Failed to load members')
  const total = count ?? 0

  return {
    members: data as Member[],
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  }
}

export async function createMember(
  input: MemberCreateInput,
): Promise<Member> {
  const { data, error } = await supabase
    .from('members')
    .insert(input)
    .select()
    .single()

  if (error) throw new Error('Failed to create member')
  return data as Member
}

export async function updateMember(
  id: string,
  input: MemberUpdateInput,
): Promise<Member> {
  const { data, error } = await supabase
    .from('members')
    .update(input)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error('Failed to update member')
  return data as Member
}

export async function deleteMember(id: string): Promise<void> {
  const { error } = await supabase.from('members').delete().eq('id', id)
  if (error) throw new Error('Failed to delete member')
}

export function subscribeToMembers(
  onChange: () => void,
): RealtimeChannel {
  return supabase
    .channel('members-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'members' },
      () => onChange(),
    )
    .subscribe()
}
