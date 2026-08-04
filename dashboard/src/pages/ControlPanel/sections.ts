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
    label: 'General',
    description: 'Association name, email, phone and address',
    icon: Settings,
  },
  {
    id: 'administrators',
    label: 'Administrators',
    description: 'Manage admin access',
    icon: Users,
  },
  {
    id: 'branding',
    label: 'Branding',
    description: 'Logo and favicon',
    icon: Palette,
  },
  {
    id: 'social',
    label: 'Social Media',
    description: 'Social media profile links',
    icon: Globe,
  },
]
