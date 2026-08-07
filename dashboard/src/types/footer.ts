export interface FooterColumn {
  id: string
  title_ar: string
  title_en: string | null
  icon: string | null
  type: 'about' | 'links' | 'contact' | 'map'
  sort_order: number
  is_visible: boolean
  created_at: string
  updated_at: string
}

export interface FooterItem {
  id: string
  column_id: string | null
  parent_id: string | null
  title_ar: string
  title_en: string | null
  url: string | null
  value: string | null
  link_type: 'url' | 'tel' | 'mailto' | 'map' | 'none'
  icon: string | null
  sort_order: number
  is_visible: boolean
  open_in_new_tab: boolean
  created_at: string
  updated_at: string
}

export interface FooterTreeNode extends FooterItem {
  children: FooterTreeNode[]
  depth: number
}

export interface FooterItemCreateInput {
  column_id?: string | null
  parent_id?: string | null
  title_ar: string
  title_en?: string
  url?: string
  value?: string
  link_type?: 'url' | 'tel' | 'mailto' | 'map' | 'none'
  icon?: string
  sort_order?: number
  is_visible?: boolean
  open_in_new_tab?: boolean
}

export interface FooterItemUpdateInput extends Partial<FooterItemCreateInput> {}

export interface FooterColumnCreateInput {
  title_ar: string
  title_en?: string
  icon?: string
  type?: 'about' | 'links' | 'contact' | 'map'
  sort_order?: number
  is_visible?: boolean
}

export interface FooterStats {
  totalItems: number
  visibleItems: number
  hiddenItems: number
  columnCount: number
}
