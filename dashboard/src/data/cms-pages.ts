import { getWebsitePages } from '@/services/pageDiscovery'
import type { ContentPage } from '@/types/cms'

export const seedPages: ContentPage[] = getWebsitePages().map((page) => ({
  id: page.id,
  name: page.name,
  status: 'draft',
  updatedAt: new Date().toISOString(),
  seo: {
    title: `${page.name} | الجمعية المغربية لهواة البحث والاستكشاف`,
    metaDescription: '',
    ogImage: '',
    slug: page.path,
  },
  blocks: [],
}))
