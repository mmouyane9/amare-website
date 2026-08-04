export type AdminRole = 'super-admin' | 'admin' | 'editor'

export interface GeneralSettings {
  websiteName: string
  logo: string
  favicon: string
  contactEmail: string
  phone: string
  address: string
}

export interface SocialLinks {
  facebook: string
  instagram: string
  youtube: string
  linkedin: string
}

export interface AdminUser {
  id: string
  name: string
  email: string
  role: AdminRole
  status: 'active' | 'invited' | 'suspended'
  lastLogin: string
}

export interface RolePermission {
  key: string
  label: string
}

export interface RoleDefinition {
  id: AdminRole
  label: string
  description: string
  permissions: string[]
}

export interface LoginEntry {
  id: string
  email: string
  device: string
  location: string
  status: 'success' | 'failed'
  time: string
}

export interface MediaItem {
  id: string
  name: string
  url: string
  size: string
  type: string
  uploadedAt: string
}

export interface ActivityLog {
  id: string
  actor: string
  action: string
  target: string
  time: string
}

export interface BackupRecord {
  id: string
  name: string
  size: string
  createdAt: string
}
