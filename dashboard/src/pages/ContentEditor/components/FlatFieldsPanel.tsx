import { useEffect, useState } from 'react'
import { Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getPageContent, savePageField } from '@/services/content.service'
import type { PageRow } from '@/types/content'

interface FlatFieldsPanelProps {
  page: PageRow | null
}

interface FieldRow {
  content_key: string
  value: string
  label: string | null
}

export function FlatFieldsPanel({ page }: FlatFieldsPanelProps) {
  const [fields, setFields] = useState<FieldRow[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState<string | null>(null)

  useEffect(() => {
    if (!page) return
    setLoading(true)
    getPageContent(page.id)
      .then(setFields)
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false))
  }, [page])

  const handleChange = (key: string, value: string) => {
    setFields((prev) =>
      prev.map((f) => (f.content_key === key ? { ...f, value } : f)),
    )
  }

  const handleSave = async (field: FieldRow) => {
    if (!page) return
    setSaving(field.content_key)
    try {
      await savePageField(page.id, field.content_key, field.value, field.label ?? undefined)
      toast.success('تم الحفظ')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'فشل الحفظ')
    } finally {
      setSaving(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (fields.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-8 text-center">
        <p className="text-sm text-muted-foreground">لا توجد حقول مسطحة لهذه الصفحة</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {fields.map((field) => (
        <div key={field.content_key} className="flex items-start gap-2 rounded-lg border border-border/60 p-2.5">
          <div className="min-w-0 flex-1 space-y-1">
            <Label className="text-[11px] text-muted-foreground">
              {field.label || field.content_key}
            </Label>
            <Input
              value={field.value}
              onChange={(e) => handleChange(field.content_key, e.target.value)}
              className="h-8 text-sm"
            />
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="mt-4 shrink-0"
            onClick={() => handleSave(field)}
            disabled={saving === field.content_key}
          >
            {saving === field.content_key ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Save className="size-3.5" />
            )}
          </Button>
        </div>
      ))}
    </div>
  )
}
