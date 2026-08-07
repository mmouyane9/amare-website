import { ArrowLeft, GripVertical, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { SECTION_TYPE_LABELS, type PageSection, type SectionType } from '@/types/content'

import { SECTION_EDITORS } from '@/pages/ContentEditor/components/SectionEditor'

interface SectionEditorPanelProps {
  section: PageSection
  onClose: () => void
  onChange: (data: Record<string, unknown>) => void
  onToggle: (enabled: boolean) => void
  onDelete: () => void
  onDuplicate: () => void
}

export function SectionEditorPanel({
  section,
  onClose,
  onChange,
  onToggle,
  onDelete,
  onDuplicate,
}: SectionEditorPanelProps) {
  const data = section.data as Record<string, unknown>

  const Editor = SECTION_EDITORS[section.type as SectionType]

  const updateDesign = (key: string, value: unknown) => {
    onChange({ ...data, [key]: value })
  }

  const label = SECTION_TYPE_LABELS[section.type as SectionType] ?? section.type
  const renderer = section.type === 'custom' ? (data._renderer as string) : undefined
  const displayName = renderer ?? label

  const editorProps = {
    section,
    index: 0,
    total: 1,
    onChange,
    onToggle,
    onDelete,
    onDuplicate,
    onMoveUp: () => {},
    onMoveDown: () => {},
  }

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex shrink-0 items-center gap-2 border-b border-[#E5E7EB] px-4 py-3">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
        </Button>

        <div className="flex min-w-0 flex-1 items-center gap-2">
          <GripVertical className="size-4 shrink-0 text-muted-foreground/40" />
          <span className="truncate text-sm font-semibold text-foreground">
            {displayName}
          </span>
          <span
            className={cn(
              'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium',
              section.enabled
                ? 'bg-emerald-50 text-emerald-600'
                : 'bg-muted text-muted-foreground',
            )}
          >
            {section.enabled ? 'ظاهر' : 'مخفي'}
          </span>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="size-4" />
        </Button>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        <Tabs defaultValue="content" className="flex h-full flex-col">
          <TabsList className="mx-4 mt-3 w-fit shrink-0 rounded-xl bg-gray-100 p-1">
            <TabsTrigger
              value="content"
              className="rounded-lg px-3 py-1.5 text-xs font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              المحتوى
            </TabsTrigger>
            <TabsTrigger
              value="design"
              className="rounded-lg px-3 py-1.5 text-xs font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              التصميم
            </TabsTrigger>
            <TabsTrigger
              value="seo"
              className="rounded-lg px-3 py-1.5 text-xs font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              SEO
            </TabsTrigger>
            <TabsTrigger
              value="advanced"
              className="rounded-lg px-3 py-1.5 text-xs font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              متقدم
            </TabsTrigger>
          </TabsList>

          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            <TabsContent value="content" className="mt-0 space-y-3">
              {Editor ? (
                <Editor {...editorProps} />
              ) : (
                <div className="flex flex-col items-center gap-2 py-8 text-center">
                  <p className="text-sm text-muted-foreground">لا يوجد محرر لهذا النوع من الأقسام</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="design" className="mt-0 space-y-4">
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">لون الخلفية</Label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={(data._bgColor as string) ?? '#ffffff'}
                      onChange={(e) => updateDesign('_bgColor', e.target.value)}
                      className="h-9 w-10 cursor-pointer rounded-lg border border-[#E5E7EB] bg-transparent p-0.5"
                    />
                    <Input
                      value={(data._bgColor as string) ?? ''}
                      onChange={(e) => updateDesign('_bgColor', e.target.value)}
                      placeholder="#ffffff"
                      className="h-9 flex-1 text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">صورة الخلفية</Label>
                  <Input
                    value={(data._bgImage as string) ?? ''}
                    onChange={(e) => updateDesign('_bgImage', e.target.value)}
                    placeholder="https://..."
                    className="h-9 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">
                    شفافية الطبقة
                  </Label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={String(parseFloat(String(data._overlayOpacity ?? '0')) * 100)}
                      onChange={(e) =>
                        updateDesign('_overlayOpacity', String(parseInt(e.target.value, 10) / 100))
                      }
                      className="h-1 flex-1 appearance-none rounded-full bg-gray-200 accent-primary"
                    />
                    <span className="w-10 text-right text-xs text-muted-foreground tabular-nums">
                      {Math.round(parseFloat(String(data._overlayOpacity ?? '0')) * 100)}%
                    </span>
                  </div>
                </div>

                <Separator className="bg-[#E5E7EB]" />

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">المساحة العلوية</Label>
                    <Input
                      value={(data._paddingTop as string) ?? ''}
                      onChange={(e) => updateDesign('_paddingTop', e.target.value)}
                      placeholder="80px"
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">المساحة السفلية</Label>
                    <Input
                      value={(data._paddingBottom as string) ?? ''}
                      onChange={(e) => updateDesign('_paddingBottom', e.target.value)}
                      placeholder="80px"
                      className="h-9 text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">محاذاة النص</Label>
                  <Select
                    value={(data._textAlign as string) ?? 'right'}
                    onValueChange={(v) => updateDesign('_textAlign', v)}
                  >
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="right">يمين</SelectItem>
                      <SelectItem value="center">وسط</SelectItem>
                      <SelectItem value="left">يسار</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="seo" className="mt-0 space-y-4">
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">العنوان الوصفي</Label>
                  <Input
                    value={(data._seoTitle as string) ?? ''}
                    onChange={(e) => updateDesign('_seoTitle', e.target.value)}
                    placeholder="Section meta title"
                    className="h-9 text-sm"
                  />
                  <p className="text-right text-[11px] text-muted-foreground">
                    {String(data._seoTitle ?? '').length}/60
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">الوصف الوصفي</Label>
                  <Textarea
                    value={(data._seoDescription as string) ?? ''}
                    onChange={(e) => updateDesign('_seoDescription', e.target.value)}
                    placeholder="Section meta description"
                    className="min-h-16 resize-y text-sm"
                  />
                  <p className="text-right text-[11px] text-muted-foreground">
                    {String(data._seoDescription ?? '').length}/160
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">الكلمات المفتاحية</Label>
                  <Input
                    value={(data._seoKeywords as string) ?? ''}
                    onChange={(e) => updateDesign('_seoKeywords', e.target.value)}
                    placeholder="كلمة1, كلمة2, كلمة3"
                    className="h-9 text-sm"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="mt-0 space-y-4">
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">معرف الارتساء</Label>
                  <Input
                    value={(data._anchorId as string) ?? ''}
                    onChange={(e) => updateDesign('_anchorId', e.target.value)}
                    placeholder="مثال: about-section"
                    className="h-9 text-sm font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">فئات CSS</Label>
                  <Input
                    value={(data._cssClasses as string) ?? ''}
                    onChange={(e) => updateDesign('_cssClasses', e.target.value)}
                    placeholder="e.g. custom-bg dark-section"
                    className="h-9 text-sm font-mono"
                  />
                </div>

                <Separator className="bg-[#E5E7EB]" />

                <div className="flex items-center justify-between rounded-xl border border-[#E5E7EB] bg-gray-50 p-3">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium text-foreground">الظهور</Label>
                    <p className="text-xs text-muted-foreground">
                      {section.enabled ? 'القسم ظاهر على الصفحة' : 'القسم مخفي'}
                    </p>
                  </div>
                  <Switch
                    checked={section.enabled}
                    onCheckedChange={onToggle}
                  />
                </div>

                <Separator className="bg-[#E5E7EB]" />

                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">الإجراءات</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={onDuplicate}
                      className="w-full justify-center gap-1.5 border-[#E5E7EB]"
                    >
                      تكرار
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={onDelete}
                      className="w-full justify-center gap-1.5 border-destructive/20 text-destructive hover:bg-destructive/5 hover:text-destructive"
                    >
                      حذف
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}
