import type {
  ActivityLog,
  AdminUser,
  BackupRecord,
  GeneralSettings,
  LoginEntry,
  MediaItem,
  RoleDefinition,
  SocialLinks,
} from '@/types/settings'

export const seedGeneralSettings: GeneralSettings = {
  websiteName: 'AMARE',
  logo: '/images/logo.png',
  favicon: '/images/favicon.ico',
  contactEmail: 'contact@amare.ma',
  phone: '+212 5 22 00 00 00',
  address: '12 Avenue des FAR, Casablanca, Morocco',
}

export const seedSocialLinks: SocialLinks = {
  facebook: '',
  instagram: '',
  youtube: '',
  linkedin: '',
}

export const seedAdmins: AdminUser[] = [
  {
    id: 'admin-1',
    name: 'Sarah El Amrani',
    email: 'sarah@amare.ma',
    role: 'super-admin',
    status: 'active',
    lastLogin: '2026-08-01T09:24:00.000Z',
  },
  {
    id: 'admin-2',
    name: 'Youssef Benali',
    email: 'youssef@amare.ma',
    role: 'admin',
    status: 'active',
    lastLogin: '2026-07-31T18:10:00.000Z',
  },
  {
    id: 'admin-3',
    name: 'Fatima Zahra Idrissi',
    email: 'fatima@amare.ma',
    role: 'editor',
    status: 'active',
    lastLogin: '2026-07-30T11:02:00.000Z',
  },
  {
    id: 'admin-4',
    name: 'Mehdi Alaoui',
    email: 'mehdi@amare.ma',
    role: 'editor',
    status: 'invited',
    lastLogin: '—',
  },
]

export const rolePermissions: { key: string; label: string }[] = [
  { key: 'content.edit', label: 'Edit content' },
  { key: 'content.publish', label: 'Publish content' },
  { key: 'admins.manage', label: 'Manage administrators' },
  { key: 'roles.manage', label: 'Manage roles & permissions' },
  { key: 'settings.edit', label: 'Edit website settings' },
  { key: 'media.manage', label: 'Manage media library' },
  { key: 'system.backup', label: 'Backup & restore' },
  { key: 'security.view', label: 'View security logs' },
]

export const seedRoles: RoleDefinition[] = [
  {
    id: 'super-admin',
    label: 'Super Admin',
    description: 'Full access to every feature, including roles and system tools.',
    permissions: rolePermissions.map((permission) => permission.key),
  },
  {
    id: 'admin',
    label: 'Admin',
    description: 'Can manage content, media and administrators, but not roles.',
    permissions: [
      'content.edit',
      'content.publish',
      'admins.manage',
      'settings.edit',
      'media.manage',
    ],
  },
  {
    id: 'editor',
    label: 'Editor',
    description: 'Can create and edit content, with no publishing or system access.',
    permissions: ['content.edit'],
  },
]

export const seedLoginHistory: LoginEntry[] = [
  {
    id: 'login-1',
    email: 'sarah@amare.ma',
    device: 'Chrome · macOS',
    location: 'Casablanca, MA',
    status: 'success',
    time: '2026-08-01T09:24:00.000Z',
  },
  {
    id: 'login-2',
    email: 'youssef@amare.ma',
    device: 'Safari · iPhone',
    location: 'Rabat, MA',
    status: 'success',
    time: '2026-07-31T18:10:00.000Z',
  },
  {
    id: 'login-3',
    email: 'unknown@amare.ma',
    device: 'Edge · Windows',
    location: 'Paris, FR',
    status: 'failed',
    time: '2026-07-31T03:47:00.000Z',
  },
  {
    id: 'login-4',
    email: 'fatima@amare.ma',
    device: 'Firefox · Linux',
    location: 'Marrakech, MA',
    status: 'success',
    time: '2026-07-30T11:02:00.000Z',
  },
]

export const seedMedia: MediaItem[] = [
  {
    id: 'media-1',
    name: 'hero-banner.jpg',
    url: '/images/hero-banner.jpg',
    size: '2.4 MB',
    type: 'image/jpeg',
    uploadedAt: '2026-07-12T10:00:00.000Z',
  },
  {
    id: 'media-2',
    name: 'classroom-workshop.png',
    url: '/images/classroom-workshop.png',
    size: '4.1 MB',
    type: 'image/png',
    uploadedAt: '2026-07-14T15:30:00.000Z',
  },
  {
    id: 'media-3',
    name: 'annual-report-2025.pdf',
    url: '/files/annual-report-2025.pdf',
    size: '8.7 MB',
    type: 'application/pdf',
    uploadedAt: '2026-07-18T09:15:00.000Z',
  },
  {
    id: 'media-4',
    name: 'logo-amare.svg',
    url: '/images/logo-amare.svg',
    size: '42 KB',
    type: 'image/svg+xml',
    uploadedAt: '2026-07-20T12:45:00.000Z',
  },
  {
    id: 'media-5',
    name: 'conference-2026.jpg',
    url: '/images/conference-2026.jpg',
    size: '3.6 MB',
    type: 'image/jpeg',
    uploadedAt: '2026-07-23T16:20:00.000Z',
  },
  {
    id: 'media-6',
    name: 'branch-casablanca.jpg',
    url: '/images/branch-casablanca.jpg',
    size: '1.9 MB',
    type: 'image/jpeg',
    uploadedAt: '2026-07-26T08:05:00.000Z',
  },
]

export const seedActivityLogs: ActivityLog[] = [
  {
    id: 'log-1',
    actor: 'Sarah El Amrani',
    action: 'Published page',
    target: 'News',
    time: '2026-08-01T09:30:00.000Z',
  },
  {
    id: 'log-2',
    actor: 'Youssef Benali',
    action: 'Updated media',
    target: 'conference-2026.jpg',
    time: '2026-07-31T18:12:00.000Z',
  },
  {
    id: 'log-3',
    actor: 'System',
    action: 'Ran backup',
    target: 'automatic',
    time: '2026-07-31T02:00:00.000Z',
  },
  {
    id: 'log-4',
    actor: 'Fatima Zahra Idrissi',
    action: 'Saved draft',
    target: 'Activities',
    time: '2026-07-30T11:05:00.000Z',
  },
  {
    id: 'log-5',
    actor: 'Sarah El Amrani',
    action: 'Updated settings',
    target: 'Contact email',
    time: '2026-07-29T14:40:00.000Z',
  },
  {
    id: 'log-6',
    actor: 'Youssef Benali',
    action: 'Invited admin',
    target: 'mehdi@amare.ma',
    time: '2026-07-28T10:22:00.000Z',
  },
]

export const seedBackups: BackupRecord[] = [
  {
    id: 'backup-1',
    name: 'automatic-2026-07-31',
    size: '156 MB',
    createdAt: '2026-07-31T02:00:00.000Z',
  },
  {
    id: 'backup-2',
    name: 'manual-before-revamp',
    size: '151 MB',
    createdAt: '2026-07-20T19:30:00.000Z',
  },
  {
    id: 'backup-3',
    name: 'automatic-2026-07-15',
    size: '149 MB',
    createdAt: '2026-07-15T02:00:00.000Z',
  },
]
