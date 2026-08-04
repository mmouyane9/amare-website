import { useRef } from 'react'
import { ImagePlus, Upload } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface ImageFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  compact?: boolean
  accept?: string
}

export function ImageField({
  label,
  value,
  onChange,
  compact = false,
  accept = 'image/*',
}: ImageFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = (file?: File) => {
    if (!file) return
    onChange(URL.createObjectURL(file))
  }

  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'flex shrink-0 items-center justify-center overflow-hidden rounded-lg border border-dashed border-border bg-muted/40 text-muted-foreground',
            compact ? 'size-11' : 'size-16',
          )}
        >
          {value ? (
            <img
              src={value}
              alt={label}
              className="size-full object-cover"
            />
          ) : (
            <ImagePlus className="size-5" />
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            className="hidden"
            onChange={(event) => handleFile(event.target.files?.[0])}
          />
          <Input
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="/images/…"
            className="text-xs"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="size-3.5" />
            Upload file
          </Button>
        </div>
      </div>
    </div>
  )
}
