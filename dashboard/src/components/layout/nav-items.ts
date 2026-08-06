import {
  Bell,
  Building2,
  FilePen,
  LayoutDashboard,
  Newspaper,
  Settings2,
  Store,
  Users,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  label: string
  path: string
  icon: LucideIcon
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Members', path: '/members', icon: Users },
  { label: 'News', path: '/news', icon: Newspaper },
  { label: 'Updates', path: '/updates', icon: Bell },
  { label: 'Branches', path: '/branches', icon: Building2 },
  { label: 'AMARE Store', path: '/store', icon: Store },
  { label: 'Content Editor', path: '/content-editor', icon: FilePen },
  { label: 'Control Panel', path: '/control-panel', icon: Settings2 },
]
