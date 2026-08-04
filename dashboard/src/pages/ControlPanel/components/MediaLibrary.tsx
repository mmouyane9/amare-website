import { useEffect, useRef, useState } from 'react'
import {
  FileText,
  Loader2,
  RefreshCw,
  Search,
  Trash2,
  Upload,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { formatDateTime } from '@/lib/format'
import { getSettingsService } from '@/services/settings'
import type { MediaItem } from '@/types/settings'

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function isImage(type: string): boolean {
  return type.startsWith('image/')
}

function extension(name: string): string {
  const parts = name.split('.')
  return parts.length > 1 ? parts.pop()!.toUpperCase() : 'FILE'
}

export function MediaLibrary() {
  const service = getSettingsService()
  const [media, setMedia] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [uploading, setUploading] = useState(false)
  const [replaceTarget, setReplaceTarget] = useState<MediaItem | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<MediaItem | null>(null)
  const [removing, setRemoving] = useState(false)
  const uploadInputRef = useRef<HTMLInputElement>(null)
  const replaceInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    let alive = true
    service.listMedia().then((items) => {
      if (!alive) return
      setMedia(items)
      setLoading(false)
    })
    return () => {
      alive = false
    }
  }, [service])

  const handleUpload = (file?: File) => {
    if (!file) return
    setUploading(true)
    window.setTimeout(() => {
      const item: MediaItem = {
        id: `media-${Date.now().toString(36)}`,
        name: file.name,
        url: URL.createObjectURL(file),
        size: formatBytes(file.size),
        type: file.type || 'application/octet-stream',
        uploadedAt: new Date().toISOString(),
      }
      setMedia((prev) => [item, ...prev])
      setUploading(false)
    }, 600)
  }

  const handleReplace = (file?: File) => {
    if (!file || !replaceTarget) return
    setMedia((prev) =>
      prev.map((item) =>
        item.id === replaceTarget.id
          ? {
              ...item,
              name: file.name,
              url: URL.createObjectURL(file),
              size: formatBytes(file.size),
              type: file.type || item.type,
              uploadedAt: new Date().toISOString(),
            }
          : item,
      ),
    )
    setReplaceTarget(null)
  }

  const handleRemove = async () => {
    if (!deleteTarget) return
    setRemoving(true)
    await service.removeMedia(deleteTarget.id)
    setMedia((prev) => prev.filter((item) => item.id !== deleteTarget.id))
    setRemoving(false)
    setDeleteTarget(null)
  }

  const filtered = media.filter((item) =>
    item.name.toLowerCase().includes(query.trim().toLowerCase()),
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle>Media Library</CardTitle>
            <CardDescription>
              Images and files used across the website.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search media…"
                className="w-48 pl-8"
              />
            </div>
            <input
              ref={uploadInputRef}
              type="file"
              className="hidden"
              onChange={(event) => {
                handleUpload(event.target.files?.[0])
                event.target.value = ''
              }}
            />
            <input
              ref={replaceInputRef}
              type="file"
              className="hidden"
              onChange={(event) => {
                handleReplace(event.target.files?.[0])
                event.target.value = ''
              }}
            />
            <Button
              type="button"
              onClick={() => uploadInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Upload className="size-4" />
              )}
              Upload
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-4 py-12 text-center">
            <Search className="size-6 text-muted-foreground/50" />
            <p className="text-sm font-medium text-foreground">No media found</p>
            <p className="text-sm text-muted-foreground">
              {query ? 'Try a different search.' : 'Upload your first file to get started.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="group/media overflow-hidden rounded-xl border border-border bg-background"
              >
                <div className="relative flex aspect-video items-center justify-center overflow-hidden bg-muted/40">
                  {isImage(item.type) && item.url ? (
                    <img
                      src={item.url}
                      alt={item.name}
                      className="size-full object-cover transition-transform duration-200 group-hover/media:scale-[1.02]"
                    />
                  ) : (
                    <span className="flex size-10 items-center justify-center rounded-lg bg-background text-muted-foreground ring-1 ring-border">
                      <FileText className="size-5" />
                    </span>
                  )}
                  <Badge className="absolute top-2 left-2">{extension(item.name)}</Badge>
                  <div className="absolute inset-0 flex items-center justify-center gap-1.5 bg-black/40 opacity-0 backdrop-blur-[2px] transition-opacity group-hover/media:opacity-100">
                    <Button
                      type="button"
                      variant="secondary"
                      size="icon-sm"
                      className="size-8"
                      onClick={() => {
                        setReplaceTarget(item)
                        replaceInputRef.current?.click()
                      }}
                      aria-label={`Replace ${item.name}`}
                    >
                      <RefreshCw className="size-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon-sm"
                      className="size-8"
                      onClick={() => setDeleteTarget(item)}
                      aria-label={`Delete ${item.name}`}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-0.5 p-2.5">
                  <p className="truncate text-xs font-medium text-foreground">
                    {item.name}
                  </p>
                  <p className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>{item.size}</span>
                    <span>{formatDateTime(item.uploadedAt)}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="justify-between">
        <p className="text-xs text-muted-foreground">
          {filtered.length} of {media.length} items
        </p>
        <p className="text-xs text-muted-foreground">
          Files are stored securely and reused across pages.
        </p>
      </CardFooter>

      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete media?</DialogTitle>
            <DialogDescription>
              “{deleteTarget?.name}” will be removed from the library and any
              page using it will show a broken image.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteTarget(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleRemove}
              disabled={removing}
            >
              {removing && <Loader2 className="size-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <span className="sr-only" aria-live="polite">
        {uploading ? 'Uploading…' : ''}
      </span>
    </Card>
  )
}
