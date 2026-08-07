import {
  Globe,
  Palette,
  Settings,
  Users,
  type LucideIcon,
} from 'lucide-react'

export interface ControlSection {
  id: string
  label: string
  description: string
  icon: LucideIcon
}

export const CONTROL_SECTIONS: ControlSection[] = [
  {
    id: 'general',
    label: 'عام',
    description: 'اسم الجمعية والبريد الإلكتروني والهاتف والعنوان',
    icon: Settings,
  },
  {
    id: 'administrators',
    label: 'المسؤولون',
    description: 'إدارة صلاحيات الوصول',
    icon: Users,
  },
  {
    id: 'branding',
    label: 'العلامة التجارية',
    description: 'الشعار والأيقونة',
    icon: Palette,
  },
  {
    id: 'social',
    label: 'وسائل التواصل',
    description: 'روابط حسابات وسائل التواصل الاجتماعي',
    icon: Globe,
  },
]
