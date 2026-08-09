/**
 * System-Managed Pages
 *
 * These pages are NOT normal CMS pages — their content is managed by a
 * dedicated dashboard section (Store / Regional Branches / Online Membership /
 * Membership Renewal). Inside the normal Content Editor they must appear as
 * locked / read-only and must never load or create CMS page rows.
 *
 * `pageKeys` are the exact page keys used by the Content Editor page tree
 * (src/pages/ContentEditor/data/treeData.ts) and page discovery manifest
 * (src/services/pageDiscovery.ts). `route` points to the existing dedicated
 * dashboard section when one exists — never invent new routes here.
 */

export interface SystemManagedPage {
  /** Stable identifier for the system */
  id: string
  /** Display name shown in the Content Editor */
  label: string
  /** Name of the dedicated dashboard section that manages this content */
  manageLabel: string
  /** Main read-only message shown to the user */
  message: string
  /** Secondary read-only message shown to the user */
  secondaryMessage: string
  /** Existing dedicated dashboard route, when one exists */
  route?: string
  /** Exact Content Editor page keys belonging to this system */
  pageKeys: string[]
}

const READ_ONLY_HINT = 'لا يمكن تعديل محتوى هذه الصفحة من محرر المحتوى.'

export const SYSTEM_MANAGED_PAGES: SystemManagedPage[] = [
  {
    id: 'store',
    label: 'متجر Amare',
    manageLabel: 'متجر Amare',
    message: 'هذه الصفحة تتم إدارتها من قسم متجر Amare',
    secondaryMessage: READ_ONLY_HINT,
    route: '/store',
    pageKeys: ['services-store'],
  },
  {
    id: 'regional-branches',
    label: 'الفروع الجهوية',
    manageLabel: 'الفروع الجهوية',
    message: 'هذه الصفحة تتم إدارتها من قسم الفروع الجهوية',
    secondaryMessage: READ_ONLY_HINT,
    route: '/branches',
    pageKeys: [
      'tangier-tetouan-al-hoceima',
      'oriental',
      'fes-meknes',
      'rabat-sale-kenitra',
      'beni-mellal-khenifra',
      'casablanca-settat',
      'marrakech-safi',
      'draa-tafilalet',
      'souss-massa',
      'guelmim-oued-noun',
      'laayoune-sakia-el-hamra',
      'dakhla-oued-eddahab',
      'tanger-tetouan-al-hoceima',
    ],
  },
  {
    id: 'membership-online',
    label: 'الانخراط عبر الإنترنت',
    manageLabel: 'الأعضاء',
    message: 'هذه الصفحة مرتبطة بنظام الانخراط',
    secondaryMessage: READ_ONLY_HINT,
    route: '/members',
    pageKeys: ['join-us-online'],
  },
  {
    id: 'membership-renewal',
    label: 'تجديد الانخراط',
    manageLabel: 'طلبات الانخراط الجديدة',
    message: 'هذه الصفحة مرتبطة بنظام تجديد الانخراط',
    secondaryMessage: READ_ONLY_HINT,
    route: '/membership-requests',
    pageKeys: ['membership-renewal'],
  },
]

/** All page keys that must be treated as read-only in the Content Editor. */
export function getSystemManagedPageKeys(): Set<string> {
  return new Set(SYSTEM_MANAGED_PAGES.flatMap((entry) => entry.pageKeys))
}

/** Returns the system managing a page, or undefined if the page is editable. */
export function getSystemManagedPage(pageKey: string): SystemManagedPage | undefined {
  return SYSTEM_MANAGED_PAGES.find((entry) => entry.pageKeys.includes(pageKey))
}

/** Whether a page key must be shown as read-only in the Content Editor. */
export function isSystemManagedPage(pageKey: string): boolean {
  return getSystemManagedPage(pageKey) !== undefined
}
