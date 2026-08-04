import {
  seedActivityLogs,
  seedAdmins,
  seedBackups,
  seedGeneralSettings,
  seedLoginHistory,
  seedMedia,
  seedRoles,
  seedSocialLinks,
} from '@/data/settings'
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

export interface SettingsRepository {
  getGeneralSettings(): Promise<GeneralSettings>
  updateGeneralSettings(settings: GeneralSettings): Promise<void>
  getSocialLinks(): Promise<SocialLinks>
  updateSocialLinks(links: SocialLinks): Promise<void>
  listAdmins(): Promise<AdminUser[]>
  addAdmin(admin: Omit<AdminUser, 'id'>): Promise<AdminUser>
  updateAdmin(admin: AdminUser): Promise<void>
  removeAdmin(adminId: string): Promise<void>
  listRoles(): Promise<RoleDefinition[]>
  updateRole(role: RoleDefinition): Promise<void>
  listLoginHistory(): Promise<LoginEntry[]>
  listMedia(): Promise<MediaItem[]>
  removeMedia(mediaId: string): Promise<void>
  listActivityLogs(): Promise<ActivityLog[]>
  listBackups(): Promise<BackupRecord[]>
  createBackup(name: string): Promise<BackupRecord>
}

const delay = (ms = 350) => new Promise((resolve) => setTimeout(resolve, ms))

let nextId = 100

function uid(prefix: string): string {
  nextId += 1
  return `${prefix}-${nextId}`
}

class LocalSettingsRepository implements SettingsRepository {
  private general = structuredClone(seedGeneralSettings)
  private social = structuredClone(seedSocialLinks)
  private admins = structuredClone(seedAdmins)
  private roles = structuredClone(seedRoles)
  private loginHistory = structuredClone(seedLoginHistory)
  private media = structuredClone(seedMedia)
  private activityLogs = structuredClone(seedActivityLogs)
  private backups = structuredClone(seedBackups)

  async getGeneralSettings(): Promise<GeneralSettings> {
    await delay(80)
    return structuredClone(this.general)
  }

  async updateGeneralSettings(settings: GeneralSettings): Promise<void> {
    await delay(400)
    this.general = structuredClone(settings)
  }

  async getSocialLinks(): Promise<SocialLinks> {
    await delay(80)
    return structuredClone(this.social)
  }

  async updateSocialLinks(links: SocialLinks): Promise<void> {
    await delay(400)
    this.social = structuredClone(links)
  }

  async listAdmins(): Promise<AdminUser[]> {
    await delay(80)
    return structuredClone(this.admins)
  }

  async addAdmin(admin: Omit<AdminUser, 'id'>): Promise<AdminUser> {
    await delay(450)
    const created: AdminUser = { ...admin, id: uid('admin') }
    this.admins.push(created)
    this.activityLogs.unshift({
      id: uid('log'),
      actor: 'Admin',
      action: 'Invited admin',
      target: created.email,
      time: new Date().toISOString(),
    })
    return structuredClone(created)
  }

  async updateAdmin(admin: AdminUser): Promise<void> {
    await delay(400)
    const index = this.admins.findIndex((item) => item.id === admin.id)
    if (index !== -1) this.admins[index] = structuredClone(admin)
  }

  async removeAdmin(adminId: string): Promise<void> {
    await delay(350)
    this.admins = this.admins.filter((item) => item.id !== adminId)
  }

  async listRoles(): Promise<RoleDefinition[]> {
    await delay(80)
    return structuredClone(this.roles)
  }

  async updateRole(role: RoleDefinition): Promise<void> {
    await delay(350)
    const index = this.roles.findIndex((item) => item.id === role.id)
    if (index !== -1) this.roles[index] = structuredClone(role)
  }

  async listLoginHistory(): Promise<LoginEntry[]> {
    await delay(80)
    return structuredClone(this.loginHistory)
  }

  async listMedia(): Promise<MediaItem[]> {
    await delay(80)
    return structuredClone(this.media)
  }

  async removeMedia(mediaId: string): Promise<void> {
    await delay(350)
    this.media = this.media.filter((item) => item.id !== mediaId)
  }

  async listActivityLogs(): Promise<ActivityLog[]> {
    await delay(80)
    return structuredClone(this.activityLogs)
  }

  async listBackups(): Promise<BackupRecord[]> {
    await delay(80)
    return structuredClone(this.backups)
  }

  async createBackup(name: string): Promise<BackupRecord> {
    await delay(600)
    const backup: BackupRecord = {
      id: uid('backup'),
      name,
      size: `${Math.round(140 + Math.random() * 40)} MB`,
      createdAt: new Date().toISOString(),
    }
    this.backups.unshift(backup)
    this.activityLogs.unshift({
      id: uid('log'),
      actor: 'Admin',
      action: 'Ran backup',
      target: name,
      time: new Date().toISOString(),
    })
    return structuredClone(backup)
  }
}

const localRepository = new LocalSettingsRepository()

export function getSettingsService(): SettingsRepository {
  return localRepository
}
