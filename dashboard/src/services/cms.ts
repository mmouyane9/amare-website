import { seedPages } from '@/data/cms-pages'
import type { ContentPage } from '@/types/cms'

/**
 * Repository contract for CMS content. Every page is identified by id,
 * blocks are ordered, and publishing is an explicit action.
 *
 * Swapping the local implementation for Supabase later only requires
 * implementing this interface (e.g. `SupabaseCmsRepository` backed by
 * the `content_pages` and `content_blocks` tables).
 */
export interface CmsRepository {
  listPages(): Promise<ContentPage[]>
  getPage(pageId: string): Promise<ContentPage | undefined>
  saveDraft(page: ContentPage): Promise<void>
  publish(page: ContentPage): Promise<void>
  resetPage(pageId: string): Promise<ContentPage>
}

const delay = (ms = 350) => new Promise((resolve) => setTimeout(resolve, ms))

class LocalCmsRepository implements CmsRepository {
  private store: ContentPage[] = structuredClone(seedPages)

  async listPages(): Promise<ContentPage[]> {
    await delay(120)
    return structuredClone(this.store)
  }

  async getPage(pageId: string): Promise<ContentPage | undefined> {
    await delay(60)
    const page = this.store.find((item) => item.id === pageId)
    return page ? structuredClone(page) : undefined
  }

  async saveDraft(page: ContentPage): Promise<void> {
    await delay(450)
    const index = this.store.findIndex((item) => item.id === page.id)
    if (index !== -1) {
      this.store[index] = {
        ...structuredClone(page),
        status: 'draft',
        updatedAt: new Date().toISOString(),
      }
    }
  }

  async publish(page: ContentPage): Promise<void> {
    await delay(550)
    const index = this.store.findIndex((item) => item.id === page.id)
    if (index !== -1) {
      this.store[index] = {
        ...structuredClone(page),
        status: 'published',
        updatedAt: new Date().toISOString(),
      }
    }
  }

  async resetPage(pageId: string): Promise<ContentPage> {
    await delay(300)
    const original = seedPages.find((item) => item.id === pageId)
    const index = this.store.findIndex((item) => item.id === pageId)
    if (original && index !== -1) {
      this.store[index] = structuredClone(original)
    }
    return original ? structuredClone(original) : structuredClone(seedPages[0])
  }
}

const localRepository = new LocalCmsRepository()

export function getCmsService(): CmsRepository {
  return localRepository
}
