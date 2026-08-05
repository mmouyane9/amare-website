import { useState } from 'react'
import { Loader2, RotateCcw, Save, Send } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

interface PropertiesPanelProps {
  title: string
  seoTitle: string
  seoDescription: string
  seoKeywords: string
  ogImage: string
  slug: string
  dirty: boolean
  busy: 'save' | 'publish' | null
  onTitleChange: (value: string) => void
  onSeoTitleChange: (value: string) => void
  onSeoDescriptionChange: (value: string) => void
  onSeoKeywordsChange: (value: string) => void
  onOgImageChange: (value: string) => void
  onSlugChange: (value: string) => void
  onSaveDraft: () => void
  onPublish: () => void
  onReset: () => void
}

export function PropertiesPanel({
  title,
  seoTitle,
  seoDescription,
  seoKeywords,
  ogImage,
  slug,
  dirty,
  busy,
  onTitleChange,
  onSeoTitleChange,
  onSeoDescriptionChange,
  onSeoKeywordsChange,
  onOgImageChange,
  onSlugChange,
  onSaveDraft,
  onPublish,
  onReset,
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
      <div className="space-y-4 p-4">
        <Card size="sm">
          <CardHeader>
            <CardTitle>Page</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="prop-title">Title</Label>
              <Input
                id="prop-title"
                value={title}
                onChange={(e) => {
                  onTitleChange(e.target.value)
                }}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="prop-slug">URL Slug</Label>
              <Input
                id="prop-slug"
                value={slug}
                onChange={(e) => {
                  onSlugChange(e.target.value)
                }}
              />
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
              <Label htmlFor="seo-title">SEO Title</Label>
              <Input
                id="seo-title"
                value={seoTitle}
                onChange={(e) => {
                  onSeoTitleChange(e.target.value)
                }}
              />
              <p className="text-right text-xs text-muted-foreground">
                {seoTitle.length}/60
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="seo-description">Meta Description</Label>
              <Textarea
                id="seo-description"
                value={seoDescription}
                onChange={(e) => {
                  onSeoDescriptionChange(e.target.value)
                }}
                className="min-h-20"
              />
              <p className="text-right text-xs text-muted-foreground">
                {seoDescription.length}/160
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="seo-keywords">Keywords</Label>
              <Input
                id="seo-keywords"
                value={seoKeywords}
                onChange={(e) => {
                  onSeoKeywordsChange(e.target.value)
                }}
                placeholder="keyword1, keyword2, keyword3"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="seo-og">Open Graph Image</Label>
              <Input
                id="seo-og"
                value={ogImage}
                onChange={(e) => {
                  onOgImageChange(e.target.value)
                }}
                placeholder="/images/og-…"
              />
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
              onClick={onSaveDraft}
              disabled={!dirty || busy !== null}
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
              onClick={onPublish}
              disabled={busy !== null}
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
    </div>
  )
}
