export interface TreeNode {
  id: string
  label: string
  type: 'folder' | 'page'
  children?: TreeNode[]
  pageKey?: string
}

export const TREE_DATA: TreeNode[] = [
  { id: 'home', label: 'الرئيسية', type: 'page', pageKey: 'home' },
  { id: 'who-we-are', label: 'من نحن', type: 'page', pageKey: 'who-we-are' },
  {
    id: 'our-activities',
    label: 'أنشطتنا',
    type: 'page',
    pageKey: 'our-activities',
  },
  {
    id: 'our-partners',
    label: 'شركاؤنا',
    type: 'folder',
    children: [
      { id: 'partners-lefouilleurma', label: 'Le Fouilleurma', type: 'page', pageKey: 'partners-lefouilleurma' },
      { id: 'partners-scnotce', label: 'SCNOTCE', type: 'page', pageKey: 'partners-scnotce' },
      { id: 'partners-astromet', label: 'ASTROMET', type: 'page', pageKey: 'partners-astromet' },
      { id: 'partners-detection-centre', label: 'Association Detection Centre', type: 'page', pageKey: 'partners-detection-centre' },
      { id: 'partners-ancpp', label: 'ANCPP', type: 'page', pageKey: 'partners-ancpp' },
      { id: 'partners-omsds', label: 'OMSDS', type: 'page', pageKey: 'partners-omsds' },
    ],
  },
  {
    id: 'our-services',
    label: 'خدماتنا',
    type: 'folder',
    children: [
      { id: 'services-sos-amare', label: 'SOS Amare', type: 'page', pageKey: 'services-sos-amare' },
      { id: 'services-store', label: 'متجر Amare', type: 'page', pageKey: 'services-store' },
      { id: 'services-magazine', label: 'مجلة Amare', type: 'page', pageKey: 'services-magazine' },
    ],
  },
  {
    id: 'regional-branches',
    label: 'الفروع الجهوية',
    type: 'folder',
    children: [
      { id: 'tangier-tetouan-al-hoceima', label: 'جهة طنجة تطوان الحسيمة', type: 'page', pageKey: 'tangier-tetouan-al-hoceima' },
      { id: 'oriental', label: 'جهة الشرق', type: 'page', pageKey: 'oriental' },
      { id: 'fes-meknes', label: 'جهة فاس مكناس', type: 'page', pageKey: 'fes-meknes' },
      { id: 'rabat-sale-kenitra', label: 'جهة الرباط سلا القنيطرة', type: 'page', pageKey: 'rabat-sale-kenitra' },
      { id: 'beni-mellal-khenifra', label: 'جهة بني ملال خنيفرة', type: 'page', pageKey: 'beni-mellal-khenifra' },
      { id: 'casablanca-settat', label: 'جهة الدار البيضاء سطات', type: 'page', pageKey: 'casablanca-settat' },
      { id: 'marrakech-safi', label: 'جهة مراكش آسفي', type: 'page', pageKey: 'marrakech-safi' },
      { id: 'draa-tafilalet', label: 'جهة درعة تافيلالت', type: 'page', pageKey: 'draa-tafilalet' },
      { id: 'souss-massa', label: 'جهة سوس ماسة', type: 'page', pageKey: 'souss-massa' },
      { id: 'guelmim-oued-noun', label: 'جهة كلميم واد نون', type: 'page', pageKey: 'guelmim-oued-noun' },
      { id: 'laayoune-sakia-el-hamra', label: 'جهة العيون الساقية الحمراء', type: 'page', pageKey: 'laayoune-sakia-el-hamra' },
      { id: 'dakhla-oued-eddahab', label: 'جهة الداخلة وادي الذهب', type: 'page', pageKey: 'dakhla-oued-eddahab' },
    ],
  },
  {
    id: 'join-us',
    label: 'انخرط معنا',
    type: 'folder',
    children: [
      { id: 'join-us-online', label: 'الانخراط Online', type: 'page', pageKey: 'join-us-online' },
      { id: 'membership-renewal', label: 'تجديد الانخراط', type: 'page', pageKey: 'membership-renewal' },
      { id: 'documents', label: 'وثائق الانخراط', type: 'page', pageKey: 'documents' },
    ],
  },
  { id: 'news', label: 'الأخبار', type: 'page', pageKey: 'news' },
  { id: 'archive', label: 'الأرشيف', type: 'page', pageKey: 'archive' },
  { id: 'contact', label: 'اتصل بنا', type: 'page', pageKey: 'contact' },
]

export function flattenPages(nodes: TreeNode[]): TreeNode[] {
  const result: TreeNode[] = []
  function walk(list: TreeNode[]) {
    for (const node of list) {
      if (node.type === 'page') {
        result.push(node)
      }
      if (node.children) {
        walk(node.children)
      }
    }
  }
  walk(nodes)
  return result
}

export function findNodeById(nodes: TreeNode[], id: string): TreeNode | undefined {
  for (const node of nodes) {
    if (node.id === id) return node
    if (node.children) {
      const found = findNodeById(node.children, id)
      if (found) return found
    }
  }
  return undefined
}

export function findParentPath(
  nodes: TreeNode[],
  targetId: string,
  path: string[] = [],
): string[] | null {
  for (const node of nodes) {
    if (node.id === targetId) return path
    if (node.children) {
      const result = findParentPath(node.children, targetId, [...path, node.id])
      if (result) return result
    }
  }
  return null
}

const STORAGE_KEY = 'amare-cms-expanded-folders'

export function loadExpandedState(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const arr = JSON.parse(raw)
      if (Array.isArray(arr)) return new Set(arr)
    }
  } catch {
    // ignore
  }
  return new Set<string>()
}

export function saveExpandedState(expanded: Set<string>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...expanded]))
  } catch {
    // ignore
  }
}
