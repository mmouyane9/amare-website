import { Globe, Lock } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { ContentPageRow, PageSection } from '@/types/content'

interface PreviewDialogProps {
  page: ContentPageRow | null
  sections?: PageSection[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PreviewDialog({ page, sections, open, onOpenChange }: PreviewDialogProps) {
  const displaySections = sections ?? page?.content?.sections ?? []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 p-0 sm:max-w-3xl">
        {page ? (
          <>
            <div className="flex items-center gap-3 border-b border-border/60 px-4 py-3">
              <div className="flex gap-1.5">
                <span className="size-2.5 rounded-full bg-destructive/70" />
                <span className="size-2.5 rounded-full bg-amber-500/70" />
                <span className="size-2.5 rounded-full bg-emerald-500/70" />
              </div>
              <div className="flex min-w-0 flex-1 items-center gap-1.5 rounded-md bg-muted px-3 py-1.5 text-xs text-muted-foreground">
                <Lock className="size-3" />
                <Globe className="size-3" />
                <span className="truncate">amare.ma{page.slug || '/'}</span>
              </div>
              <Badge variant="secondary" className="capitalize">
                {page.status}
              </Badge>
            </div>

            <div className="max-h-[65svh] overflow-y-auto">
              <article className="mx-auto w-full max-w-2xl px-8 py-10 space-y-8">
                {displaySections
                  .filter((s) => s.enabled)
                  .map((section) => (
                    <SectionPreview key={section.id} section={section} />
                  ))}
              </article>
            </div>

            <div className="border-t border-border/60 bg-muted/50 px-4 py-2.5 text-center text-xs text-muted-foreground">
              Preview — this is how visitors see "{page.title || page.page_key}" once published.
            </div>
          </>
        ) : (
          <DialogHeader>
            <DialogTitle>Nothing to preview</DialogTitle>
          </DialogHeader>
        )}
      </DialogContent>
    </Dialog>
  )
}

function SectionPreview({ section }: { section: PageSection }) {
  const data = section.data as Record<string, unknown>

  const heading = data.heading as string | undefined
  const body = data.body as string | undefined
  const description = data.description as string | undefined
  const url = data.url as string | undefined
  const buttons = data.buttons as Array<{ label: string; url: string }> | undefined
  const stats = data.stats as Array<{ value: string; suffix: string; label: string }> | undefined

  return (
    <div>
      {heading && (
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          {heading}
        </h2>
      )}
      {(body || description) && (
        <p className="mt-2 text-muted-foreground">{body || description}</p>
      )}
      {url && (
        <div className="mt-2 flex aspect-video items-center justify-center rounded-lg bg-muted">
          <span className="text-xs text-muted-foreground">🖼 {url}</span>
        </div>
      )}
      {buttons && buttons.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {buttons.map((btn, i) => (
            <span
              key={i}
              className="inline-flex h-8 items-center rounded-lg border border-border bg-background px-3 text-xs font-medium"
            >
              {btn.label}
            </span>
          ))}
        </div>
      )}
      {stats && stats.length > 0 && (
        <div className="mt-3 flex gap-6">
          {stats.map((s, i) => (
            <div key={i}>
              <span className="text-xl font-bold">{s.value}{s.suffix}</span>
              <span className="ml-1 text-xs text-muted-foreground">{s.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
