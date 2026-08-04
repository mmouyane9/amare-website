import { useState } from 'react'
import { Eye, Loader2, RotateCcw, Save, Send } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { ContentPage, SeoFields } from '@/types/cms'

interface PropertiesPanelProps {
  page?: ContentPage
  dirty: boolean
  busy: 'save' | 'publish' | 'reset' | null
  onSeoChange: (patch: Partial<SeoFields>) => void
  onSaveDraft: () => void
  onPublish: () => void
  onReset: () => void
  onPreview: () => void
}

export function PropertiesPanel({
  page,
  dirty,
  busy,
  onSeoChange,
  onSaveDraft,
  onPublish,
  onReset,
  onPreview,
}: PropertiesPanelProps) {
  const [confirmReset, setConfirmReset] = useState(false)

  const handleReset = () => {
    if (!confirmReset) {
      setConfirmReset(true)
      window.setTimeout(() => setConfirmReset(false), 3000)
      return
    }
    setConfirmReset(false)
    onReset()
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-y-auto">
      {!page ? (
        <div className="flex h-full items-center justify-center px-4 text-sm text-muted-foreground">
          Select a page to see its properties.
        </div>
      ) : (
        <div className="space-y-4 p-4">
          <Card size="sm">
            <CardHeader>
              <CardTitle>Page</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-foreground">{page.name}</span>
                <Badge
                  variant={page.status === 'published' ? 'secondary' : 'outline'}
                  className="capitalize"
                >
                  {page.status}
                </Badge>
              </div>
              <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                <span>Last updated</span>
                <span className="text-foreground">{formatDate(page.updatedAt)}</span>
              </div>
              {dirty && (
                <p className="rounded-md bg-amber-500/10 px-2 py-1.5 text-xs font-medium text-amber-700 dark:text-amber-400">
                  You have unsaved changes
                </p>
              )}
            </CardContent>
          </Card>

          <Card size="sm">
            <CardHeader>
              <CardTitle>SEO</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="seo-title">Page title</Label>
                <Input
                  id="seo-title"
                  value={page.seo.title}
                  onChange={(event) => onSeoChange({ title: event.target.value })}
                />
                <p className="text-right text-xs text-muted-foreground">
                  {page.seo.title.length}/60
                </p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="seo-description">Meta description</Label>
                <Textarea
                  id="seo-description"
                  value={page.seo.metaDescription}
                  onChange={(event) =>
                    onSeoChange({ metaDescription: event.target.value })
                  }
                  className="min-h-20"
                />
                <p className="text-right text-xs text-muted-foreground">
                  {page.seo.metaDescription.length}/160
                </p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="seo-og">Open Graph image</Label>
                <Input
                  id="seo-og"
                  value={page.seo.ogImage}
                  onChange={(event) => onSeoChange({ ogImage: event.target.value })}
                  placeholder="/images/og-…"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="seo-slug">URL slug</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-sm text-muted-foreground">
                    /
                  </span>
                  <Input
                    id="seo-slug"
                    value={page.seo.slug.replace(/^\//, '')}
                    onChange={(event) =>
                      onSeoChange({ slug: `/${event.target.value.replace(/^\//, '')}` })
                    }
                    className="pl-5"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card size="sm">
            <CardHeader>
              <CardTitle>Publishing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start"
                disabled={busy !== null}
                onClick={onPreview}
              >
                <Eye className="size-4" />
                Preview Website
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start"
                disabled={!dirty || busy !== null}
                onClick={onSaveDraft}
              >
                {busy === 'save' ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Save className="size-4" />
                )}
                Save Draft
              </Button>
              <Button
                type="button"
                className="w-full justify-start"
                disabled={!dirty || busy !== null}
                onClick={onPublish}
              >
                {busy === 'publish' ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Send className="size-4" />
                )}
                Publish
              </Button>
              <Button
                type="button"
                variant="ghost"
                className={cn(
                  'w-full justify-start text-muted-foreground hover:text-destructive',
                  confirmReset && 'text-destructive',
                )}
                disabled={!dirty || busy !== null}
                onClick={handleReset}
              >
                <RotateCcw className="size-4" />
                {confirmReset ? 'Confirm reset?' : 'Reset Changes'}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
