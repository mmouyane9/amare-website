import { FileText, Plus } from 'lucide-react'

import { BlockCard } from '@/pages/ContentEditor/components/BlockCard'
import { ADD_BLOCK_KINDS, BLOCK_KIND_META } from '@/pages/ContentEditor/block-meta'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { ContentBlock, ContentPage, CtaButton } from '@/types/cms'

interface EditorCanvasProps {
  page?: ContentPage
  focusedBlockId: string | null
  onChange: (blockId: string, patch: Partial<ContentBlock>) => void
  onMove: (blockId: string, direction: -1 | 1) => void
  onToggle: (blockId: string, enabled: boolean) => void
  onRemove: (blockId: string) => void
  onCtaChange: (blockId: string, buttonId: string, patch: Partial<CtaButton>) => void
  onCtaAdd: (blockId: string) => void
  onCtaRemove: (blockId: string, buttonId: string) => void
  onAddBlock: (kind: ContentBlock['kind']) => void
}

export function EditorCanvas({
  page,
  focusedBlockId,
  onChange,
  onMove,
  onToggle,
  onRemove,
  onCtaChange,
  onCtaAdd,
  onCtaRemove,
  onAddBlock,
}: EditorCanvasProps) {
  if (!page) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="flex size-11 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            <FileText className="size-5" />
          </span>
          <p className="text-sm font-medium text-foreground">No page selected</p>
          <p className="text-sm text-muted-foreground">
            Choose a page from the list to start editing.
          </p>
        </div>
      </div>
    )
  }

  const enabledCount = page.blocks.filter((block) => block.enabled).length

  return (
    <div className="h-full overflow-y-auto bg-muted/30">
      <div className="mx-auto w-full max-w-2xl px-4 py-5 lg:px-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{page.name}</span>
            <span aria-hidden>·</span>
            <span className="truncate">{page.seo.slug}</span>
          </div>
          <span className="shrink-0 text-xs text-muted-foreground">
            {enabledCount} of {page.blocks.length} sections visible
          </span>
        </div>

        <div className="space-y-3">
          {page.blocks.map((block, index) => (
            <BlockCard
              key={block.id}
              block={block}
              index={index}
              total={page.blocks.length}
              focused={focusedBlockId === block.id}
              onChange={onChange}
              onMove={onMove}
              onToggle={onToggle}
              onRemove={onRemove}
              onCtaChange={onCtaChange}
              onCtaAdd={onCtaAdd}
              onCtaRemove={onCtaRemove}
            />
          ))}

          {page.blocks.length === 0 && (
            <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border px-4 py-12 text-center">
              <p className="text-sm font-medium text-foreground">This page is empty</p>
              <p className="text-sm text-muted-foreground">
                Add your first content block below.
              </p>
            </div>
          )}
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-border/60 pt-4">
          <span className="mr-1 flex items-center gap-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">
            <Plus className="size-3.5" />
            Add block
          </span>
          {ADD_BLOCK_KINDS.map((kind) => {
            const meta = BLOCK_KIND_META[kind]
            return (
              <Button
                key={kind}
                type="button"
                variant="outline"
                size="sm"
                className={cn('gap-1.5')}
                onClick={() => onAddBlock(kind)}
              >
                <meta.icon className="size-3.5" />
                {meta.label}
              </Button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
