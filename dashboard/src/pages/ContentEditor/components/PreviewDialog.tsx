import { Globe, ImageIcon, Lock } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import type { ContentPage } from '@/types/cms'

interface PreviewDialogProps {
  page?: ContentPage
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PreviewDialog({ page, open, onOpenChange }: PreviewDialogProps) {
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
                <span className="truncate">amare.ma{page.seo.slug}</span>
              </div>
              <Badge variant="secondary" className="capitalize">
                {page.status}
              </Badge>
            </div>

            <div className="max-h-[65svh] overflow-y-auto">
              <article className="mx-auto w-full max-w-2xl px-8 py-10">
                {page.blocks
                  .filter((block) => block.enabled)
                  .map((block) => (
                    <div key={block.id}>
                      {block.kind === 'section' && (
                        <section className="mb-8">
                          {block.heading && (
                            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                              {block.heading}
                            </h1>
                          )}
                          {block.paragraph && (
                            <p className="mt-2 text-muted-foreground">{block.paragraph}</p>
                          )}
                        </section>
                      )}

                      {block.kind === 'heading' && block.heading && (
                        <h2 className="mt-8 mb-2 text-lg font-semibold tracking-tight text-foreground">
                          {block.heading}
                        </h2>
                      )}

                      {block.kind === 'paragraph' && block.paragraph && (
                        <p className="my-2 leading-relaxed text-muted-foreground">
                          {block.paragraph}
                        </p>
                      )}

                      {block.kind === 'image' && (
                        <div
                          className={cn(
                            'my-4 flex aspect-video w-full items-center justify-center overflow-hidden rounded-xl border border-border/60 bg-muted',
                          )}
                        >
                          {block.imageUrl ? (
                            <img
                              src={block.imageUrl}
                              alt={block.imageAlt ?? ''}
                              className="size-full object-cover"
                            />
                          ) : (
                            <ImageIcon className="size-8 text-muted-foreground/50" />
                          )}
                        </div>
                      )}

                      {block.kind === 'buttons' && (
                        <div className="mt-6 flex flex-wrap gap-3">
                          {block.buttons?.map((button, index) => (
                            <button
                              key={button.id}
                              type="button"
                              className={cn(
                                'inline-flex h-9 items-center justify-center rounded-lg px-4 text-sm font-medium transition-colors',
                                index === 0
                                  ? 'bg-foreground text-background'
                                  : 'border border-border bg-background text-foreground hover:bg-muted',
                              )}
                            >
                              {button.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
              </article>
            </div>

            <div className="border-t border-border/60 bg-muted/50 px-4 py-2.5 text-center text-xs text-muted-foreground">
              Preview — this is how visitors see “{page.name}” once published.
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
