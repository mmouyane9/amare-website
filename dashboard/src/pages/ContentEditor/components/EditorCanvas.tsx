import { FileText, Loader2, Plus } from 'lucide-react'

import { SectionEditor, AddSectionMenu } from '@/pages/ContentEditor/components/SectionEditor'
import { Button } from '@/components/ui/button'
import type { ContentPageRow, PageSection, SectionType } from '@/types/content'

interface EditorCanvasProps {
  page: ContentPageRow | null
  sections: PageSection[]
  loading: boolean
  needsInit: boolean
  pageKey: string
  onInitialize: () => void
  onUpdateSection: (sectionId: string, data: Record<string, unknown>) => void
  onToggleSection: (sectionId: string, enabled: boolean) => void
  onDeleteSection: (sectionId: string) => void
  onDuplicateSection: (sectionId: string) => void
  onMoveSection: (sectionId: string, direction: -1 | 1) => void
  onAddSection: (type: SectionType) => void
}

export function EditorCanvas({
  page,
  sections,
  loading,
  needsInit,
  pageKey: _pageKey,
  onInitialize,
  onUpdateSection,
  onToggleSection,
  onDeleteSection,
  onDuplicateSection,
  onMoveSection,
  onAddSection,
}: EditorCanvasProps) {
  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Loading page…
        </div>
      </div>
    )
  }

  if (needsInit) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-center px-6">
          <span className="flex size-11 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            <FileText className="size-5" />
          </span>
          <p className="text-sm font-semibold text-foreground">
            This page has not been initialized yet.
          </p>
          <p className="text-sm text-muted-foreground max-w-xs">
            Click below to create this page in the database and start editing its content.
          </p>
          <Button
            type="button"
            onClick={onInitialize}
            className="gap-1.5"
          >
            <Plus className="size-3.5" />
            Initialize Page
          </Button>
        </div>
      </div>
    )
  }

  if (!page) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="flex size-11 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            <FileText className="size-5" />
          </span>
          <p className="text-sm font-medium text-foreground">No page selected</p>
          <p className="text-sm text-muted-foreground">
            Choose a page from the list to start editing.
          </p>
        </div>
      </div>
    )
  }

  const enabledCount = sections.filter((s) => s.enabled).length

  return (
    <div className="h-full overflow-y-auto bg-muted/30">
      <div className="mx-auto w-full max-w-2xl px-4 py-5 lg:px-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{page.title || page.page_key}</span>
            <span aria-hidden>·</span>
            <span className="truncate">{page.slug || '/'}</span>
          </div>
          <span className="shrink-0 text-xs text-muted-foreground">
            {enabledCount} of {sections.length} sections visible
          </span>
        </div>

        <div className="space-y-3">
          {sections.map((section, index) => (
            <SectionEditor
              key={section.id}
              section={section}
              index={index}
              total={sections.length}
              onChange={(data) => onUpdateSection(section.id, data)}
              onToggle={(enabled) => onToggleSection(section.id, enabled)}
              onDelete={() => onDeleteSection(section.id)}
              onDuplicate={() => onDuplicateSection(section.id)}
              onMoveUp={() => onMoveSection(section.id, -1)}
              onMoveDown={() => onMoveSection(section.id, 1)}
            />
          ))}

          {sections.length === 0 && (
            <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border px-4 py-12 text-center">
              <p className="text-sm font-medium text-foreground">This page is empty</p>
              <p className="text-sm text-muted-foreground">
                Add a section below to start building.
              </p>
            </div>
          )}
        </div>

        <div className="mt-5 border-t border-border/60 pt-4">
          <AddSectionMenu onAdd={onAddSection} />
        </div>
      </div>
    </div>
  )
}
