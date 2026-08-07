export interface NavigationGroup {
  id: string
  name_ar: string
  name_en: string | null
  sort_order: number
  is_visible: boolean
  created_at: string
  updated_at: string
}

export interface NavigationItem {
  id: string
  group_id: string | null
  parent_id: string | null
  title_ar: string
  title_en: string | null
  description_ar: string | null
  description_en: string | null
  url: string | null
  icon: string | null
  type: 'link' | 'button' | 'header'
  target_blank: boolean
  sort_order: number
  is_visible: boolean
  created_at: string
  updated_at: string
}

export interface NavigationTreeNode extends NavigationItem {
  children: NavigationTreeNode[]
  depth: number
}

export interface NavigationItemCreateInput {
  group_id?: string | null
  parent_id?: string | null
  title_ar: string
  title_en?: string
  description_ar?: string
  description_en?: string
  url?: string
  icon?: string
  type?: 'link' | 'button' | 'header'
  target_blank?: boolean
  sort_order?: number
  is_visible?: boolean
}

export interface NavigationItemUpdateInput extends Partial<NavigationItemCreateInput> {}

export interface NavigationGroupCreateInput {
  name_ar: string
  name_en?: string
  sort_order?: number
  is_visible?: boolean
}

export interface NavigationGroupUpdateInput extends Partial<NavigationGroupCreateInput> {}

export interface NavigationStats {
  totalItems: number
  visibleItems: number
  hiddenItems: number
  dropdownCount: number
}
