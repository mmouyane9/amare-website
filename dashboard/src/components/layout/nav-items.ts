import {
  Bell,
  Building2,
  FilePenLine,
  FileText,
  LayoutDashboard,
  Menu,
  Newspaper,
  PanelBottom,
  Settings,
  Store,
  Trophy,
  UserPlus,
  Users,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  label: string
  path: string
  icon: LucideIcon
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'لوحة التحكم', path: '/dashboard', icon: LayoutDashboard },
  { label: 'الأعضاء', path: '/members', icon: Users },
  { label: 'طلبات الانخراط الجديدة', path: '/membership-requests', icon: UserPlus },
  { label: 'الأخبار', path: '/news', icon: Newspaper },
  { label: 'المستجدات', path: '/updates', icon: Bell },
  { label: 'المشاركون في المسابقة', path: '/competition', icon: Trophy },
  { label: 'الفروع', path: '/branches', icon: Building2 },
  { label: 'متجر الجمعية', path: '/store', icon: Store },
  { label: 'محرر المحتوى', path: '/content-editor', icon: FilePenLine },
  { label: 'القائمة العلوية (Navbar)', path: '/navigation/navbar', icon: Menu },
  { label: 'القائمة السفلية (Footer)', path: '/navigation/footer', icon: PanelBottom },
  { label: 'الصفحات', path: '/pages', icon: FileText },
  { label: 'الإعدادات', path: '/settings', icon: Settings },
]
