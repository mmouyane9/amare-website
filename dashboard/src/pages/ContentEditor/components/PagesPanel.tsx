import {
  CalendarDays,
  Globe,
  Handshake,
  Home,
  Info,
  LifeBuoy,
  Mail,
  Newspaper,
  Search,
  Users,
  type LucideIcon,
} from 'lucide-react'

import { BLOCK_KIND_META } from '@/pages/ContentEditor/block-meta'
import type { ContentPage } from '@/types/cms'
import { formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'

const PAGE_ICONS: Record<string, LucideIcon> = {
  home: Home,
  about: Info,
  activities: CalendarDays,
  news: Newspaper,
  membership: Users,
  branches: Globe,
  contact: Mail,
  partners: Handshake,
  support: LifeBuoy,
}

interface PagesPanelProps {
  pages: ContentPage[]
  selectedId: string
  query: string
  onQueryChange: (query: string) => void
  onSelect: (pageId: string, blockId?: string) => void
}

export function PagesPanel({
  pages,
  selectedId,
  query,
  onQueryChange,
  onSelect,
}: PagesPanelProps) {
  const trimmed = query.trim().toLowerCase()
  const matches = trimmed
    ? pages.flatMap((page) =>
        page.blocks
          .filter((block) =>
            [block.label, block.heading, block.paragraph, block.imageAlt]
              .concat(block.buttons?.map((button) => button.label) ?? [])
              .filter(Boolean)
              .join(' ')
              .toLowerCase()
              .includes(trimmed),
          )
          .map((block) => ({ page, block })),
      )
    : []

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
            placeholder="Search pages & blocks…"
            className="h-8 w-full rounded-lg border border-input bg-transparent pr-2.5 pl-8 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        {trimmed ? (
          <div className="space-y-3">
            <p className="px-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
              {matches.length} result{matches.length === 1 ? '' : 's'}
            </p>
            {matches.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
                <Search className="size-6 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">
                  No pages or blocks match{' '}
                  <span className="font-medium text-foreground">“{query.trim()}”</span>.
                </p>
              </div>
            ) : (
              matches.map(({ page, block }) => {
                const Meta = BLOCK_KIND_META[block.kind]
                const Icon = PAGE_ICONS[page.id] ?? Globe
                return (
                  <button
                    key={block.id}
                    type="button"
                    onClick={() => onSelect(page.id, block.id)}
                    className={cn(
                      'flex w-full items-start gap-2.5 rounded-lg border border-transparent px-2.5 py-2 text-left transition-colors',
                      page.id === selectedId
                        ? 'bg-muted/70'
                        : 'hover:bg-muted/50',
                    )}
                  >
                    <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-background text-muted-foreground ring-1 ring-border">
                      <Meta.icon className="size-3.5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-foreground">
                        {block.label}
                      </span>
                      <span className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Icon className="size-3" />
                        <span className="truncate">{page.name}</span>
                      </span>
                    </span>
                  </button>
                )
              })
            )}
          </div>
        ) : (
          <ul className="space-y-1">
            {pages.map((page) => {
              const Icon = PAGE_ICONS[page.id] ?? Globe
              const isActive = page.id === selectedId
              return (
                <li key={page.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(page.id)}
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
                              : 'bg-amber-500',
                          )}
                        />
                        <span className="capitalize">{page.status}</span>
                        <span aria-hidden>·</span>
                        <span>{formatDate(page.updatedAt)}</span>
                      </span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
