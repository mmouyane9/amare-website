import { useMemo } from 'react'
import {
  Bell,
  BookOpen,
  Building2,
  ClipboardList,
  Eye,
  FileCheck,
  Files,
  FileText,
  FolderOpen,
  Heart,
  Home,
  Mail,
  Map,
  MapPinned,
  RefreshCw,
  Scroll,
  Search,
  Target,
  UserPlus,
  type LucideIcon,
} from 'lucide-react'

import { cn } from '@/lib/utils'

export interface SidebarPage {
  pageKey: string
  name: string
  status: 'published' | 'draft' | 'uninitialized'
  icon: string
  section: string
  path: string
}

const ICON_MAP: Record<string, LucideIcon> = {
  home: Home,
  building2: Building2,
  eye: Eye,
  target: Target,
  heart: Heart,
  map: Map,
  'map-pinned': MapPinned,
  'user-plus': UserPlus,
  'refresh-cw': RefreshCw,
  files: Files,
  'book-open': BookOpen,
  scroll: Scroll,
  'folder-open': FolderOpen,
  bell: Bell,
  'clipboard-list': ClipboardList,
  'file-check': FileCheck,
  mail: Mail,
  'file-text': FileText,
}

const FALLBACK_ICON = FileText

function resolveIcon(iconName: string): LucideIcon {
  return ICON_MAP[iconName] ?? FALLBACK_ICON
}

interface PagesPanelProps {
  pages: SidebarPage[]
  selectedId: string
  query: string
  onQueryChange: (query: string) => void
  onSelect: (pageKey: string) => void
}

export function PagesPanel({
  pages,
  selectedId,
  query,
  onQueryChange,
  onSelect,
}: PagesPanelProps) {
  const filteredPages = useMemo(() => {
    const trimmed = query.trim().toLowerCase()
    if (!trimmed) return pages
    return pages.filter(
      (page) =>
        page.name.toLowerCase().includes(trimmed) ||
        page.section.toLowerCase().includes(trimmed) ||
        page.path.toLowerCase().includes(trimmed),
    )
  }, [pages, query])

  const grouped = useMemo(() => {
    const sections: Record<string, SidebarPage[]> = {}
    for (const page of filteredPages) {
      if (!sections[page.section]) {
        sections[page.section] = []
      }
      sections[page.section]!.push(page)
    }
    return sections
  }, [filteredPages])

  const trimmed = query.trim().toLowerCase()

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b border-border/60 px-4 pt-4 pb-3">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-tight text-foreground">
            Website Pages
          </h2>
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
            {pages.length}
          </span>
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search pages…"
            className="h-8 w-full rounded-lg border border-input bg-transparent pr-2.5 pl-8 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        {trimmed && filteredPages.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
            <Search className="size-6 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              No pages match <span className="font-medium text-foreground">"{query.trim()}"</span>.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(grouped).map(([section, sectionPages]) => (
              <div key={section}>
                <p className="mb-1.5 px-2.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  {section}
                </p>
                <ul className="space-y-0.5">
                  {sectionPages.map((page) => {
                    const Icon = resolveIcon(page.icon)
                    const isActive = page.pageKey === selectedId
                    return (
                      <li key={page.pageKey}>
                        <button
                          type="button"
                          onClick={() => onSelect(page.pageKey)}
                          className={cn(
                            'flex w-full items-center gap-2.5 rounded-lg border border-transparent px-2.5 py-2 text-left transition-colors',
                            isActive
                              ? 'border-border bg-muted/70 shadow-sm'
                              : 'hover:bg-muted/50',
                          )}
                        >
                          <span
                            className={cn(
                              'flex size-8 shrink-0 items-center justify-center rounded-lg ring-1 ring-border transition-colors',
                              isActive
                                ? 'bg-primary/10 text-primary'
                                : 'bg-background text-muted-foreground',
                            )}
                          >
                            <Icon className="size-4" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-medium text-foreground">
                              {page.name}
                            </span>
                            <span className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                              <span
                                className={cn(
                                  'size-1.5 rounded-full',
                                  page.status === 'published'
                                    ? 'bg-emerald-500'
                                    : page.status === 'draft'
                                      ? 'bg-amber-500'
                                      : 'bg-muted-foreground/30',
                                )}
                              />
                              <span className="capitalize">
                                {page.status === 'uninitialized'
                                  ? 'Not initialized'
                                  : page.status}
                              </span>
                            </span>
                          </span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
