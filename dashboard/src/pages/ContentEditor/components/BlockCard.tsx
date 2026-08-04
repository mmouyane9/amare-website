import {
  ArrowDown,
  ArrowUp,
  EyeOff,
  GripVertical,
  ImageIcon,
  Plus,
  Trash2,
  Upload,
} from 'lucide-react'
import { useRef } from 'react'

import { BLOCK_KIND_META } from '@/pages/ContentEditor/block-meta'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import type { ContentBlock, CtaButton } from '@/types/cms'
import { cn } from '@/lib/utils'

interface BlockCardProps {
  block: ContentBlock
  index: number
  total: number
  focused: boolean
  onChange: (blockId: string, patch: Partial<ContentBlock>) => void
  onMove: (blockId: string, direction: -1 | 1) => void
  onToggle: (blockId: string, enabled: boolean) => void
  onRemove: (blockId: string) => void
  onCtaChange: (blockId: string, buttonId: string, patch: Partial<CtaButton>) => void
  onCtaAdd: (blockId: string) => void
  onCtaRemove: (blockId: string, buttonId: string) => void
}

export function BlockCard({
  block,
  index,
  total,
  focused,
  onChange,
  onMove,
  onToggle,
  onRemove,
  onCtaChange,
  onCtaAdd,
  onCtaRemove,
}: BlockCardProps) {
  const meta = BLOCK_KIND_META[block.kind]
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = (file?: File) => {
    if (!file) return
    onChange(block.id, { imageUrl: URL.createObjectURL(file) })
  }

  return (
    <div
      id={`block-${block.id}`}
      className={cn(
        'group/block rounded-xl border bg-card transition-shadow',
        focused ? 'ring-2 ring-ring' : 'border-border',
      )}
    >
      <div className="flex items-center gap-2 border-b border-border/60 px-3 py-2">
        <GripVertical className="size-4 shrink-0 text-muted-foreground/50" />
        <span className="min-w-0 flex-1 truncate text-xs font-medium text-muted-foreground">
          {block.label}
        </span>
        <Badge variant="secondary" className="hidden sm:inline-flex">
          <meta.icon className="size-3" />
          {meta.label}
        </Badge>
        <Switch
          checked={block.enabled}
          size="sm"
          onCheckedChange={(checked) => onToggle(block.id, checked === true)}
          aria-label={`${block.enabled ? 'Hide' : 'Show'} ${block.label}`}
        />
        <span className="mx-0.5 h-4 w-px bg-border/60" />
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="text-muted-foreground"
          disabled={index === 0}
          onClick={() => onMove(block.id, -1)}
          aria-label="Move block up"
        >
          <ArrowUp className="size-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="text-muted-foreground"
          disabled={index === total - 1}
          onClick={() => onMove(block.id, 1)}
          aria-label="Move block down"
        >
          <ArrowDown className="size-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={() => onRemove(block.id)}
          aria-label="Delete block"
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>

      <div className={cn('space-y-3 p-3', !block.enabled && 'bg-muted/30')}>
        {!block.enabled && (
          <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <EyeOff className="size-3.5" />
            Hidden from the website
          </p>
        )}

        {block.kind === 'heading' && (
          <Input
            value={block.heading ?? ''}
            onChange={(event) => onChange(block.id, { heading: event.target.value })}
            placeholder="Heading text"
            className="h-10 px-3 text-base font-semibold"
          />
        )}

        {block.kind === 'paragraph' && (
          <Textarea
            value={block.paragraph ?? ''}
            onChange={(event) => onChange(block.id, { paragraph: event.target.value })}
            placeholder="Paragraph text"
            className="min-h-24"
          />
        )}

        {block.kind === 'section' && (
          <>
            <Input
              value={block.heading ?? ''}
              onChange={(event) => onChange(block.id, { heading: event.target.value })}
              placeholder="Section heading"
              className="h-10 px-3 text-base font-semibold"
            />
            <Textarea
              value={block.paragraph ?? ''}
              onChange={(event) => onChange(block.id, { paragraph: event.target.value })}
              placeholder="Section description"
              className="min-h-20"
            />
          </>
        )}

        {block.kind === 'image' && (
          <>
            <div
              className={cn(
                'relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-lg border border-dashed bg-muted/40',
                block.imageUrl ? 'border-transparent' : 'border-border',
              )}
            >
              {block.imageUrl ? (
                <img
                  src={block.imageUrl}
                  alt={block.imageAlt ?? ''}
                  className="size-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center gap-1.5 text-muted-foreground">
                  <ImageIcon className="size-6" />
                  <span className="text-xs">No image selected</span>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Input
                value={block.imageUrl ?? ''}
                onChange={(event) => onChange(block.id, { imageUrl: event.target.value })}
                placeholder="Image URL or /uploads/…"
                className="flex-1"
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => handleFile(event.target.files?.[0])}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="size-3.5" />
                Upload
              </Button>
            </div>
            <Input
              value={block.imageAlt ?? ''}
              onChange={(event) => onChange(block.id, { imageAlt: event.target.value })}
              placeholder="Alternative text"
            />
          </>
        )}

        {block.kind === 'buttons' && (
          <div className="space-y-2">
            {block.buttons?.map((button) => (
              <div key={button.id} className="flex items-center gap-2">
                <Input
                  value={button.label}
                  onChange={(event) =>
                    onCtaChange(block.id, button.id, { label: event.target.value })
                  }
                  placeholder="Button label"
                  className="flex-1"
                />
                <Input
                  value={button.href}
                  onChange={(event) =>
                    onCtaChange(block.id, button.id, { href: event.target.value })
                  }
                  placeholder="/link"
                  className="w-40"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => onCtaRemove(block.id, button.id)}
                  aria-label="Remove button"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onCtaAdd(block.id)}
            >
              <Plus className="size-3.5" />
              Add button
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
