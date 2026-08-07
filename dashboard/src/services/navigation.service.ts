import type { RealtimeChannel } from '@supabase/supabase-js'
import { supabase, supabaseAnon } from '@/lib/supabase'
import type {
  NavigationItem,
  NavigationItemCreateInput,
  NavigationItemUpdateInput,
  NavigationGroup,
  NavigationGroupCreateInput,
  NavigationGroupUpdateInput,
  NavigationTreeNode,
  NavigationStats,
} from '@/types/navigation'

// ============================================================================
// Items
// ============================================================================

export async function getItems(): Promise<NavigationItem[]> {
  const { data, error } = await supabaseAnon
    .from('navigation_items')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) throw error
  return (data as NavigationItem[]) ?? []
}

export async function getItem(id: string): Promise<NavigationItem> {
  const { data, error } = await supabaseAnon
    .from('navigation_items')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as NavigationItem
}

export async function createItem(input: NavigationItemCreateInput): Promise<NavigationItem> {
  const payload = {
    title_ar: input.title_ar,
    title_en: input.title_en ?? null,
    description_ar: input.description_ar ?? null,
    description_en: input.description_en ?? null,
    url: input.url ?? null,
    icon: input.icon ?? null,
    type: input.type ?? 'link',
    target_blank: input.target_blank ?? false,
    sort_order: input.sort_order ?? 0,
    is_visible: input.is_visible ?? true,
    group_id: input.group_id ?? null,
    parent_id: input.parent_id ?? null,
  }

  const { data, error } = await supabase
    .from('navigation_items')
    .insert(payload)
    .select()
    .single()

  if (error) throw error
  return data as NavigationItem
}

export async function updateItem(
  id: string,
  input: NavigationItemUpdateInput,
): Promise<NavigationItem> {
  const { data, error } = await supabase
    .from('navigation_items')
    .update(input)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as NavigationItem
}

export async function deleteItem(id: string): Promise<void> {
  const { error } = await supabase
    .from('navigation_items')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function toggleItemVisibility(
  id: string,
  is_visible: boolean,
): Promise<NavigationItem> {
  const { data, error } = await supabase
    .from('navigation_items')
    .update({ is_visible })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as NavigationItem
}

export async function reorderItem(
  id: string,
  sort_order: number,
): Promise<void> {
  const { error } = await supabase
    .from('navigation_items')
    .update({ sort_order })
    .eq('id', id)

  if (error) throw error
}

export async function reparentItem(
  id: string,
  parent_id: string | null,
): Promise<void> {
  const { error } = await supabase
    .from('navigation_items')
    .update({ parent_id })
    .eq('id', id)

  if (error) throw error
}

export async function moveItemUp(id: string): Promise<void> {
  const item = await getItem(id)
  const items = await getItems()

  const siblings = items
    .filter((i) => i.parent_id === item.parent_id)
    .sort((a, b) => a.sort_order - b.sort_order)

  const idx = siblings.findIndex((i) => i.id === id)
  if (idx <= 0) return

  const prev = siblings[idx - 1]
  await reorderItem(id, prev.sort_order)
  await reorderItem(prev.id, item.sort_order)
}

export async function moveItemDown(id: string): Promise<void> {
  const item = await getItem(id)
  const items = await getItems()

  const siblings = items
    .filter((i) => i.parent_id === item.parent_id)
    .sort((a, b) => a.sort_order - b.sort_order)

  const idx = siblings.findIndex((i) => i.id === id)
  if (idx < 0 || idx >= siblings.length - 1) return

  const next = siblings[idx + 1]
  await reorderItem(id, next.sort_order)
  await reorderItem(next.id, item.sort_order)
}

export async function getChildren(parentId: string): Promise<NavigationItem[]> {
  const { data, error } = await supabaseAnon
    .from('navigation_items')
    .select('*')
    .eq('parent_id', parentId)
    .order('sort_order', { ascending: true })

  if (error) throw error
  return (data as NavigationItem[]) ?? []
}

// ============================================================================
// Groups
// ============================================================================

export async function getGroups(): Promise<NavigationGroup[]> {
  const { data, error } = await supabaseAnon
    .from('navigation_groups')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) throw error
  return (data as NavigationGroup[]) ?? []
}

export async function createGroup(
  input: NavigationGroupCreateInput,
): Promise<NavigationGroup> {
  const { data, error } = await supabase
    .from('navigation_groups')
    .insert(input)
    .select()
    .single()

  if (error) throw error
  return data as NavigationGroup
}

export async function updateGroup(
  id: string,
  input: NavigationGroupUpdateInput,
): Promise<NavigationGroup> {
  const { data, error } = await supabase
    .from('navigation_groups')
    .update(input)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as NavigationGroup
}

export async function deleteGroup(id: string): Promise<void> {
  const { error } = await supabase
    .from('navigation_groups')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// ============================================================================
// Tree builder
// ============================================================================

export function buildTree(items: NavigationItem[]): NavigationTreeNode[] {
  const map = new Map<string, NavigationTreeNode>()
  const roots: NavigationTreeNode[] = []

  for (const item of items) {
    map.set(item.id, { ...item, children: [], depth: 0 })
  }

  for (const item of items) {
    const node = map.get(item.id)!
    if (item.parent_id && map.has(item.parent_id)) {
      const parent = map.get(item.parent_id)!
      node.depth = parent.depth + 1
      parent.children.push(node)
    } else {
      roots.push(node)
    }
  }

  return roots
}

// ============================================================================
// Stats
// ============================================================================

export async function getStats(): Promise<NavigationStats> {
  const items = await getItems()
  const totalItems = items.length
  const visibleItems = items.filter((i) => i.is_visible).length
  const hiddenItems = totalItems - visibleItems
  const dropdownCount = items.filter((i) => i.parent_id !== null).length

  return { totalItems, visibleItems, hiddenItems, dropdownCount }
}

// ============================================================================
// Realtime
// ============================================================================

export function subscribeToNavigation(
  onChange: () => void,
): RealtimeChannel {
  return supabase
    .channel('navigation-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'navigation_items' },
      () => onChange(),
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'navigation_groups' },
      () => onChange(),
    )
    .subscribe()
}
