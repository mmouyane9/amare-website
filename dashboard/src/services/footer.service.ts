import type { RealtimeChannel } from '@supabase/supabase-js'
import { supabase, supabaseAnon } from '@/lib/supabase'
import type {
  FooterItem,
  FooterItemCreateInput,
  FooterItemUpdateInput,
  FooterColumn,
  FooterColumnCreateInput,
  FooterTreeNode,
  FooterStats,
} from '@/types/footer'

// ============================================================================
// Columns
// ============================================================================

export async function getColumns(): Promise<FooterColumn[]> {
  const { data, error } = await supabaseAnon
    .from('footer_columns')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) throw error
  return (data as FooterColumn[]) ?? []
}

export async function createColumn(
  input: FooterColumnCreateInput,
): Promise<FooterColumn> {
  const { data, error } = await supabase
    .from('footer_columns')
    .insert(input)
    .select()
    .single()

  if (error) throw error
  return data as FooterColumn
}

export async function updateColumn(
  id: string,
  input: Partial<FooterColumnCreateInput>,
): Promise<FooterColumn> {
  const { data, error } = await supabase
    .from('footer_columns')
    .update(input)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as FooterColumn
}

export async function deleteColumn(id: string): Promise<void> {
  const { error } = await supabase
    .from('footer_columns')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// ============================================================================
// Items
// ============================================================================

export async function getItems(): Promise<FooterItem[]> {
  const { data, error } = await supabaseAnon
    .from('footer_items')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) throw error
  return (data as FooterItem[]) ?? []
}

export async function getItem(id: string): Promise<FooterItem> {
  const { data, error } = await supabaseAnon
    .from('footer_items')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as FooterItem
}

export async function createItem(
  input: FooterItemCreateInput,
): Promise<FooterItem> {
  const payload = {
    column_id: input.column_id ?? null,
    parent_id: input.parent_id ?? null,
    title_ar: input.label_ar,
    label_ar: input.label_ar,
    label_fr: input.label_fr ?? null,
    url: input.url ?? null,
    value: input.value ?? null,
    link_type: input.link_type ?? 'url',
    icon: input.icon ?? null,
    sort_order: input.sort_order ?? 0,
    is_visible: input.is_visible ?? true,
    open_in_new_tab: input.open_in_new_tab ?? false,
  }

  const { data, error } = await supabase
    .from('footer_items')
    .insert(payload)
    .select()
    .single()

  if (error) throw error
  return data as FooterItem
}

export async function updateItem(
  id: string,
  input: FooterItemUpdateInput,
): Promise<FooterItem> {
  const { data, error } = await supabase
    .from('footer_items')
    .update(input)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as FooterItem
}

export async function deleteItem(id: string): Promise<void> {
  const { error } = await supabase
    .from('footer_items')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function toggleVisibility(
  id: string,
  is_visible: boolean,
): Promise<FooterItem> {
  const { data, error } = await supabase
    .from('footer_items')
    .update({ is_visible })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as FooterItem
}

export async function reorderItem(
  id: string,
  sort_order: number,
): Promise<void> {
  const { error } = await supabase
    .from('footer_items')
    .update({ sort_order })
    .eq('id', id)

  if (error) throw error
}

export async function reparentItem(
  id: string,
  parent_id: string | null,
  column_id?: string | null,
): Promise<void> {
  const update: Record<string, unknown> = { parent_id }
  if (column_id !== undefined) update.column_id = column_id
  const { error } = await supabase
    .from('footer_items')
    .update(update)
    .eq('id', id)

  if (error) throw error
}

export async function moveItemUp(id: string): Promise<void> {
  const item = await getItem(id)
  const items = await getItems()
  const siblings = items
    .filter(
      (i) =>
        i.parent_id === item.parent_id &&
        i.column_id === item.column_id,
    )
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
    .filter(
      (i) =>
        i.parent_id === item.parent_id &&
        i.column_id === item.column_id,
    )
    .sort((a, b) => a.sort_order - b.sort_order)

  const idx = siblings.findIndex((i) => i.id === id)
  if (idx < 0 || idx >= siblings.length - 1) return
  const next = siblings[idx + 1]
  await reorderItem(id, next.sort_order)
  await reorderItem(next.id, item.sort_order)
}

export async function moveItemToColumn(
  id: string,
  column_id: string,
): Promise<void> {
  const { error } = await supabase
    .from('footer_items')
    .update({ column_id })
    .eq('id', id)

  if (error) throw error
}

// ============================================================================
// Tree builder
// ============================================================================

export function buildTree(items: FooterItem[]): FooterTreeNode[] {
  const map = new Map<string, FooterTreeNode>()
  const roots: FooterTreeNode[] = []

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

export async function getStats(): Promise<FooterStats> {
  const [items, columns] = await Promise.all([getItems(), getColumns()])
  const totalItems = items.length
  const visibleItems = items.filter((i) => i.is_visible).length
  const hiddenItems = totalItems - visibleItems
  return { totalItems, visibleItems, hiddenItems, columnCount: columns.length }
}

// ============================================================================
// Realtime
// ============================================================================

export function subscribeToFooter(
  onChange: () => void,
): RealtimeChannel {
  return supabase
    .channel('footer-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'footer_items' },
      () => onChange(),
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'footer_columns' },
      () => onChange(),
    )
    .subscribe()
}
