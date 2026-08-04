import { supabaseAnon } from '@/lib/supabase'

export interface DashboardStats {
  totalMembers: number
  activeBranches: number
  publishedNews: number
  activeUpdates: number
  storeProducts: number
}

export interface ActivityLogEntry {
  id: string
  action: string | null
  description: string | null
  entity_type: string | null
  entity_id: string | null
  user_id: string | null
  metadata: Record<string, unknown> | null
  created_at: string
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const [
    membersResult,
    branchesResult,
    newsResult,
    updatesResult,
    productsResult,
  ] = await Promise.all([
    supabaseAnon.from('members').select('*', { count: 'exact', head: true }),
    supabaseAnon
      .from('branches')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active'),
    supabaseAnon
      .from('news')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'published'),
    supabaseAnon
      .from('updates')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'published'),
    supabaseAnon
      .from('store_products')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'published'),
  ])

  if (membersResult.error) throw new Error('Failed to load member statistics')
  if (branchesResult.error) throw new Error('Failed to load branch statistics')
  if (newsResult.error) throw new Error('Failed to load news statistics')
  if (updatesResult.error) throw new Error('Failed to load updates statistics')
  if (productsResult.error) throw new Error('Failed to load product statistics')

  return {
    totalMembers: membersResult.count ?? 0,
    activeBranches: branchesResult.count ?? 0,
    publishedNews: newsResult.count ?? 0,
    activeUpdates: updatesResult.count ?? 0,
    storeProducts: productsResult.count ?? 0,
  }
}

export async function getRecentActivity(
  limit = 10,
): Promise<ActivityLogEntry[]> {
  const { data, error } = await supabaseAnon
    .from('activity_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw new Error('Failed to load recent activity')
  return data ?? []
}
