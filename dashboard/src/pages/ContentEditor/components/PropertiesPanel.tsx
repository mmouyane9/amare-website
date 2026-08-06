import { useState } from 'react'
import { Loader2, RotateCcw, Save, Send } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

export interface PageSettingsData {
  title: string
  slug: string
  seoTitle: string
  seoDescription: string
  seoKeywords: string
  ogImage: string
}

interface PageSettingsPanelProps {
  title: string
  slug: string
  seoTitle: string
  seoDescription: string
  seoKeywords: string
  ogImage: string
  dirty: boolean
  busy: 'save' | 'publish' | null
  onTitleChange: (value: string) => void
  onSlugChange: (value: string) => void
  onSeoTitleChange: (value: string) => void
  onSeoDescriptionChange: (value: string) => void
  onSeoKeywordsChange: (value: string) => void
  onOgImageChange: (value: string) => void
  onSaveDraft: () => void
  onPublish: () => void
  onReset: () => void
}

export function PageSettingsPanel({
  title,
  slug,
  seoTitle,
  seoDescription,
  seoKeywords,
  ogImage,
  dirty,
  busy,
  onTitleChange,
  onSlugChange,
  onSeoTitleChange,
  onSeoDescriptionChange,
  onSeoKeywordsChange,
  onOgImageChange,
  onSaveDraft,
  onPublish,
  onReset,
}: PageSettingsPanelProps) {
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
      <div className="space-y-4 p-6">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Page Settings</h3>
          <p className="text-xs text-muted-foreground">Title, URL, and metadata</p>
        </div>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Page Title</Label>
            <Input
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              className="h-9 text-sm rounded-xl"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">URL Slug</Label>
            <Input
              value={slug}
              onChange={(e) => onSlugChange(e.target.value)}
              className="h-9 text-sm rounded-xl font-mono"
            />
          </div>
          {dirty && (
            <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
              You have unsaved changes
            </p>
          )}
        </div>

        <Separator className="bg-[#E5E7EB]" />

        <div>
          <h3 className="text-sm font-semibold text-foreground">SEO</h3>
          <p className="text-xs text-muted-foreground">Search engine optimization</p>
        </div>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">SEO Title</Label>
            <Input
              value={seoTitle}
              onChange={(e) => onSeoTitleChange(e.target.value)}
              className="h-9 text-sm rounded-xl"
            />
            <p className="text-right text-[11px] text-muted-foreground">
              {seoTitle.length}/60
            </p>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Meta Description</Label>
            <Textarea
              value={seoDescription}
              onChange={(e) => onSeoDescriptionChange(e.target.value)}
              className="min-h-20 text-sm rounded-xl resize-y"
            />
            <p className="text-right text-[11px] text-muted-foreground">
              {seoDescription.length}/160
            </p>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Keywords</Label>
            <Input
              value={seoKeywords}
              onChange={(e) => onSeoKeywordsChange(e.target.value)}
              placeholder="keyword1, keyword2, keyword3"
              className="h-9 text-sm rounded-xl"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Open Graph Image</Label>
            <Input
              value={ogImage}
              onChange={(e) => onOgImageChange(e.target.value)}
              placeholder="/images/og-image.jpg"
              className="h-9 text-sm rounded-xl"
            />
          </div>
        </div>

        <Separator className="bg-[#E5E7EB]" />

        <div>
          <h3 className="text-sm font-semibold text-foreground">Publishing</h3>
        </div>

        <div className="space-y-2">
          <Button
            type="button"
            variant="outline"
            className="w-full justify-start gap-2 rounded-xl"
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
            className="w-full justify-start gap-2 rounded-xl"
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
              'w-full justify-start gap-2 rounded-xl text-muted-foreground hover:text-destructive',
              confirmReset && 'text-destructive',
            )}
            disabled={!dirty || busy !== null}
            onClick={handleReset}
          >
            <RotateCcw className="size-4" />
            {confirmReset ? 'Confirm reset?' : 'Reset Changes'}
          </Button>
        </div>
      </div>
    </div>
  )
}
