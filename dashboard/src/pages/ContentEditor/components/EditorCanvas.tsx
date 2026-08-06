import { FileText, Loader2, Plus } from 'lucide-react'

import { SectionCard } from '@/pages/ContentEditor/components/SectionCard'
import { AddSectionModal } from '@/pages/ContentEditor/components/AddSectionModal'
import { Button } from '@/components/ui/button'
import type { PageRow, PageSection, SectionType } from '@/types/content'

interface EditorCanvasProps {
  page: PageRow | null
  sections: PageSection[]
  selectedSectionId: string | null
  loading: boolean
  showAddModal: boolean
  pageKey: string
  onSelectSection: (sectionId: string | null) => void
  onUpdateSection: (sectionId: string, data: Record<string, unknown>) => void
  onToggleSection: (sectionId: string, enabled: boolean) => void
  onDeleteSection: (sectionId: string) => void
  onDuplicateSection: (sectionId: string) => void
  onMoveSection: (sectionId: string, direction: -1 | 1) => void
  onAddSection: (type: SectionType, renderer?: string) => void
  onShowAddModal: (show: boolean) => void
}

export function EditorCanvas({
  page,
  sections,
  selectedSectionId,
  loading,
  showAddModal,
  onSelectSection,
  onUpdateSection,
  onToggleSection,
  onDeleteSection,
  onDuplicateSection,
  onMoveSection,
  onAddSection,
  onShowAddModal,
}: EditorCanvasProps) {
  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-white">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Loading page…
        </div>
      </div>
    )
  }

  if (!page) {
    return (
      <div className="flex h-full items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-gray-50 text-muted-foreground">
            <FileText className="size-6" />
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
  console.log('[EditorCanvas] render — loading:', loading, 'page:', !!page, 'sections.length:', sections.length, 'sections:', sections.map(s => ({ id: s.id, type: s.type, enabled: s.enabled })))

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[#E5E7EB] px-6 py-3">
        <div className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">
            {page.title || page.slug}
          </span>
          <span className="text-[#E5E7EB]">·</span>
          <span className="truncate">{page.slug || '/'}</span>
        </div>
        <span className="shrink-0 text-xs text-muted-foreground">
          {enabledCount} of {sections.length} visible
        </span>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-2xl px-6 py-5">
          <div className="space-y-2">
            {sections.map((section, index) => (
              <SectionCard
                key={section.id}
                section={section}
                isSelected={selectedSectionId === section.id}
                onSelect={onSelectSection}
                onToggle={(enabled) => onToggleSection(section.id, enabled)}
                onDuplicate={() => onDuplicateSection(section.id)}
                onDelete={() => {
                  if (selectedSectionId === section.id) {
                    onSelectSection(null)
                  }
                  onDeleteSection(section.id)
                }}
                onMoveUp={() => onMoveSection(section.id, -1)}
                onMoveDown={() => onMoveSection(section.id, 1)}
                isFirst={index === 0}
                isLast={index === sections.length - 1}
              />
            ))}

            {sections.length === 0 && (
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-[#E5E7EB] px-4 py-16 text-center">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-gray-50 text-muted-foreground">
                  <Plus className="size-6" />
                </span>
                <div>
                  <p className="text-sm font-medium text-foreground">This page is empty</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Add a section below to start building.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 border-t border-[#E5E7EB] pt-5">
            <Button
              type="button"
              variant="outline"
              onClick={() => onShowAddModal(true)}
              className="w-full justify-center gap-2 rounded-xl border-dashed border-[#E5E7EB] py-3 text-sm text-muted-foreground hover:border-primary/30 hover:text-foreground transition-all duration-200"
            >
              <Plus className="size-4" />
              Add Section
            </Button>
          </div>
        </div>
      </div>

      <AddSectionModal
        open={showAddModal}
        onOpenChange={onShowAddModal}
        onAddSection={onAddSection}
      />
    </div>
  )
}
