import { useEffect, useState } from 'react'
import { Eye, Loader2, PanelLeft, PanelRight, SearchX } from 'lucide-react'

import { EditorCanvas } from '@/pages/ContentEditor/components/EditorCanvas'
import { PagesPanel } from '@/pages/ContentEditor/components/PagesPanel'
import { PreviewDialog } from '@/pages/ContentEditor/components/PreviewDialog'
import { PropertiesPanel } from '@/pages/ContentEditor/components/PropertiesPanel'
import { createBlock } from '@/pages/ContentEditor/block-meta'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { getCmsService } from '@/services/cms'
import { cn } from '@/lib/utils'
import type { ContentBlock, ContentPage, CtaButton, SeoFields } from '@/types/cms'

type BusyAction = 'save' | 'publish' | 'reset' | null

export default function ContentEditorPage() {
  const cms = getCmsService()

  const [pages, setPages] = useState<ContentPage[]>([])
  const [selectedId, setSelectedId] = useState('home')
  const [dirtyIds, setDirtyIds] = useState<Set<string>>(() => new Set())
  const [busy, setBusy] = useState<BusyAction>(null)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [focusedBlockId, setFocusedBlockId] = useState<string | null>(null)
  const [showPagesMobile, setShowPagesMobile] = useState(false)
  const [showPropsMobile, setShowPropsMobile] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)

  const selectedPage = pages.find((page) => page.id === selectedId)
  const isDirty = selectedPage ? dirtyIds.has(selectedId) : false

  useEffect(() => {
    let alive = true
    cms.listPages().then((items) => {
      if (!alive) return
      setPages(items)
    })
    return () => {
      alive = false
    }
  }, [cms])

  useEffect(() => {
    if (!feedback) return
    const timer = window.setTimeout(() => setFeedback(null), 2600)
    return () => window.clearTimeout(timer)
  }, [feedback])

  const showFeedback = (message: string) => setFeedback(message)

  const markDirty = (pageId: string) => {
    setDirtyIds((prev) => {
      if (prev.has(pageId)) return prev
      const next = new Set(prev)
      next.add(pageId)
      return next
    })
  }

  const updatePage = (
    pageId: string,
    updater: (page: ContentPage) => ContentPage,
    dirty = true,
  ) => {
    setPages((prev) => prev.map((page) => (page.id === pageId ? updater(page) : page)))
    if (dirty) markDirty(pageId)
  }

  const updateBlock = (pageId: string, blockId: string, patch: Partial<ContentBlock>) => {
    updatePage(pageId, (page) => ({
      ...page,
      blocks: page.blocks.map((block) => {
        if (block.id !== blockId) return block
        const next = { ...block, ...patch }
        if (next.kind === 'heading' && patch.heading !== undefined) {
          next.label = patch.heading.trim() || next.label
        }
        return next
      }),
    }))
  }

  const moveBlock = (pageId: string, blockId: string, direction: -1 | 1) => {
    updatePage(pageId, (page) => {
      const index = page.blocks.findIndex((block) => block.id === blockId)
      const target = index + direction
      if (index === -1 || target < 0 || target >= page.blocks.length) return page
      const blocks = [...page.blocks]
      ;[blocks[index], blocks[target]] = [blocks[target], blocks[index]]
      return { ...page, blocks }
    })
  }

  const toggleBlock = (pageId: string, blockId: string, enabled: boolean) => {
    updateBlock(pageId, blockId, { enabled })
  }

  const removeBlock = (pageId: string, blockId: string) => {
    updatePage(pageId, (page) => ({
      ...page,
      blocks: page.blocks.filter((block) => block.id !== blockId),
    }))
  }

  const addBlock = (pageId: string, kind: ContentBlock['kind']) => {
    updatePage(pageId, (page) => ({
      ...page,
      blocks: [...page.blocks, createBlock(kind, page.blocks.length)],
    }))
  }

  const updateSeo = (pageId: string, patch: Partial<SeoFields>) => {
    updatePage(pageId, (page) => ({ ...page, seo: { ...page.seo, ...patch } }))
  }

  const updateCtaButton = (
    pageId: string,
    blockId: string,
    buttonId: string,
    patch: Partial<CtaButton>,
  ) => {
    updatePage(pageId, (page) => ({
      ...page,
      blocks: page.blocks.map((block) => {
        if (block.id !== blockId) return block
        return {
          ...block,
          buttons: block.buttons?.map((button) =>
            button.id === buttonId ? { ...button, ...patch } : button,
          ),
        }
      }),
    }))
  }

  const addCtaButton = (pageId: string, blockId: string) => {
    updatePage(pageId, (page) => ({
      ...page,
      blocks: page.blocks.map((block) => {
        if (block.id !== blockId) return block
        return {
          ...block,
          buttons: [
            ...(block.buttons ?? []),
            { id: `cta-${Date.now().toString(36)}`, label: 'Button', href: '/' },
          ],
        }
      }),
    }))
  }

  const removeCtaButton = (pageId: string, blockId: string, buttonId: string) => {
    updatePage(pageId, (page) => ({
      ...page,
      blocks: page.blocks.map((block) => {
        if (block.id !== blockId) return block
        return {
          ...block,
          buttons: block.buttons?.filter((button) => button.id !== buttonId),
        }
      }),
    }))
  }

  const handleSaveDraft = async () => {
    if (!selectedPage || !isDirty) return
    setBusy('save')
    await cms.saveDraft(selectedPage)
    updatePage(
      selectedId,
      (page) => ({ ...page, status: 'draft', updatedAt: new Date().toISOString() }),
      false,
    )
    setDirtyIds((prev) => {
      const next = new Set(prev)
      next.delete(selectedId)
      return next
    })
    setBusy(null)
    showFeedback('Draft saved')
  }

  const handlePublish = async () => {
    if (!selectedPage || !isDirty) return
    setBusy('publish')
    await cms.publish(selectedPage)
    updatePage(
      selectedId,
      (page) => ({ ...page, status: 'published', updatedAt: new Date().toISOString() }),
      false,
    )
    setDirtyIds((prev) => {
      const next = new Set(prev)
      next.delete(selectedId)
      return next
    })
    setBusy(null)
    showFeedback('Page published')
  }

  const handleReset = async () => {
    if (!selectedPage) return
    setBusy('reset')
    const original = await cms.resetPage(selectedId)
    updatePage(selectedId, () => original, false)
    setDirtyIds((prev) => {
      const next = new Set(prev)
      next.delete(selectedId)
      return next
    })
    setBusy(null)
    showFeedback('Changes reset')
  }

  const handleSelectPage = (pageId: string, blockId?: string) => {
    setSelectedId(pageId)
    setShowPagesMobile(false)
    if (blockId) {
      setFocusedBlockId(blockId)
      window.setTimeout(() => {
        document
          .getElementById(`block-${blockId}`)
          ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 80)
      window.setTimeout(() => setFocusedBlockId(null), 2400)
    }
  }

  return (
    <div className="relative flex h-full min-h-0 flex-col bg-background">
      <div className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border/60 px-3 lg:px-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground lg:hidden"
            onClick={() => setShowPagesMobile(true)}
            aria-label="Open pages list"
          >
            <PanelLeft className="size-4" />
          </Button>
          {selectedPage ? (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold tracking-tight text-foreground">
                {selectedPage.name}
              </p>
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span
                  className={cn(
                    'size-1.5 rounded-full',
                    selectedPage.status === 'published'
                      ? 'bg-emerald-500'
                      : 'bg-amber-500',
                  )}
                />
                <span className="capitalize">{selectedPage.status}</span>
                {isDirty && (
                  <>
                    <span aria-hidden>·</span>
                    <span className="font-medium text-amber-600 dark:text-amber-400">
                      Unsaved
                    </span>
                  </>
                )}
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Loading pages…
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => setPreviewOpen(true)}
          >
            <Eye className="size-3.5" />
            Preview
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground xl:hidden"
            onClick={() => setShowPropsMobile(true)}
            aria-label="Open page properties"
          >
            <PanelRight className="size-4" />
          </Button>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[260px_minmax(0,1fr)_320px]">
        <aside className="hidden h-full border-r border-border/60 bg-background lg:block">
          <PagesPanel
            pages={pages}
            selectedId={selectedId}
            query={query}
            onQueryChange={setQuery}
            onSelect={handleSelectPage}
          />
        </aside>

        <section className="min-w-0 border-r border-border/60 xl:border-r">
          <EditorCanvas
            page={selectedPage}
            focusedBlockId={focusedBlockId}
            onChange={(blockId, patch) => updateBlock(selectedId, blockId, patch)}
            onMove={(blockId, direction) => moveBlock(selectedId, blockId, direction)}
            onToggle={(blockId, enabled) => toggleBlock(selectedId, blockId, enabled)}
            onRemove={(blockId) => removeBlock(selectedId, blockId)}
            onCtaChange={(blockId, buttonId, patch) =>
              updateCtaButton(selectedId, blockId, buttonId, patch)
            }
            onCtaAdd={(blockId) => addCtaButton(selectedId, blockId)}
            onCtaRemove={(blockId, buttonId) =>
              removeCtaButton(selectedId, blockId, buttonId)
            }
            onAddBlock={(kind) => addBlock(selectedId, kind)}
          />
        </section>

        <aside className="hidden h-full border-l border-border/60 bg-background xl:block">
          <PropertiesPanel
            page={selectedPage}
            dirty={isDirty}
            busy={busy}
            onSeoChange={(patch) => updateSeo(selectedId, patch)}
            onSaveDraft={handleSaveDraft}
            onPublish={handlePublish}
            onReset={handleReset}
            onPreview={() => setPreviewOpen(true)}
          />
        </aside>
      </div>

      <Dialog open={showPagesMobile} onOpenChange={setShowPagesMobile}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Website Pages</DialogTitle>
          </DialogHeader>
          <div className="-mx-4 -mb-4 h-[58svh] border-t border-border/60">
            <PagesPanel
              pages={pages}
              selectedId={selectedId}
              query={query}
              onQueryChange={setQuery}
              onSelect={handleSelectPage}
            />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showPropsMobile} onOpenChange={setShowPropsMobile}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Page Properties</DialogTitle>
          </DialogHeader>
          <div className="-mx-4 -mb-4 h-[65svh] border-t border-border/60">
            <PropertiesPanel
              page={selectedPage}
              dirty={isDirty}
              busy={busy}
              onSeoChange={(patch) => updateSeo(selectedId, patch)}
              onSaveDraft={handleSaveDraft}
              onPublish={handlePublish}
              onReset={handleReset}
              onPreview={() => setPreviewOpen(true)}
            />
          </div>
        </DialogContent>
      </Dialog>

      <PreviewDialog
        page={selectedPage}
        open={previewOpen}
        onOpenChange={setPreviewOpen}
      />

      {feedback && (
        <div className="pointer-events-none absolute bottom-4 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-full border border-border bg-background px-3.5 py-1.5 text-xs font-medium text-foreground shadow-sm">
          <CheckBadge />
          {feedback}
        </div>
      )}

      {pages.length === 0 && (
        <div className="pointer-events-none absolute inset-0 z-20 hidden items-center justify-center bg-background/60 lg:flex">
          <div className="flex flex-col items-center gap-2 text-center">
            <SearchX className="size-8 text-muted-foreground/50" />
            <p className="text-sm font-medium text-foreground">No pages found</p>
          </div>
        </div>
      )}
    </div>
  )
}

function CheckBadge() {
  return (
    <span className="flex size-4 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
      <svg viewBox="0 0 20 20" fill="none" className="size-2.5">
        <path
          d="M4 10.5 8 14.5 16 6"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  )
}
