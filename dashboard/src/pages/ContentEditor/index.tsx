import { useCallback, useEffect, useMemo, useState } from 'react'
import { Eye, Loader2, PanelLeft, PanelRight } from 'lucide-react'
import { toast } from 'sonner'

import { EditorCanvas } from '@/pages/ContentEditor/components/EditorCanvas'
import { PagesPanel, type SidebarPage } from '@/pages/ContentEditor/components/PagesPanel'
import { PreviewDialog } from '@/pages/ContentEditor/components/PreviewDialog'
import { PropertiesPanel } from '@/pages/ContentEditor/components/PropertiesPanel'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { getWebsitePages } from '@/services/pageDiscovery'
import {
  getPages,
  getPage,
  initializePage,
  saveDraft,
  publishPage,
  seedHomePage,
  createSection,
  reorderSections,
  generateSectionId,
} from '@/services/content.service'
import type { ContentPageRow, PageContent, PageSection, SectionType } from '@/types/content'

type BusyAction = 'save' | 'publish' | 'init' | null

export default function ContentEditorPage() {
  const initialId = useMemo(() => getWebsitePages()[0]?.id ?? 'home', [])

  const [sidebarPages, setSidebarPages] = useState<SidebarPage[]>([])
  const [selectedKey, setSelectedKey] = useState(initialId)
  const [pageLoading, setPageLoading] = useState(false)
  const [selectedPage, setSelectedPage] = useState<ContentPageRow | null>(null)
  const [sections, setSections] = useState<PageSection[]>([])
  const [seoTitle, setSeoTitle] = useState('')
  const [seoDescription, setSeoDescription] = useState('')
  const [seoKeywords, setSeoKeywords] = useState('')
  const [ogImage, setOgImage] = useState('')
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [dirty, setDirty] = useState(false)
  const [busy, setBusy] = useState<BusyAction>(null)
  const [query, setQuery] = useState('')
  const [showPagesMobile, setShowPagesMobile] = useState(false)
  const [showPropsMobile, setShowPropsMobile] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)

  const discovered = useMemo(() => getWebsitePages(), [])

  const loadSidebar = useCallback(async () => {
    try {
      const dbPages = await getPages()
      const dbMap: Record<string, ContentPageRow> = {}
      for (const p of dbPages) {
        dbMap[p.page_key] = p
      }

      const merged: SidebarPage[] = discovered.map((page) => {
        const db = dbMap[page.id]
        return {
          pageKey: page.id,
          name: db?.title || page.name,
          status: db ? db.status : 'uninitialized',
          icon: page.icon,
          section: page.section,
          path: page.path,
        }
      })

      setSidebarPages(merged)
    } catch {
      toast.error('Failed to load pages')
    }
  }, [discovered])

  const loadPageContent = useCallback(async (pageKey: string) => {
    try {
      setPageLoading(true)
      const page = await getPage(pageKey)
      if (page) {
        setSelectedPage(page)
        setSections(page.content.sections ?? [])
        setSeoTitle(page.seo_title)
        setSeoDescription(page.seo_description)
        setSeoKeywords(page.seo_keywords)
        setOgImage(page.og_image)
        setTitle(page.title)
        setSlug(page.slug)
      } else {
        setSelectedPage(null)
        setSections([])
        setSeoTitle('')
        setSeoDescription('')
        setSeoKeywords('')
        setOgImage('')
        const meta = discovered.find((p) => p.id === pageKey)
        setTitle(meta?.name ?? pageKey)
        setSlug(meta?.path ?? '/')
      }
      setDirty(false)
    } catch {
      toast.error('Failed to load page')
    } finally {
      setPageLoading(false)
    }
  }, [discovered])

  useEffect(() => {
    loadSidebar()
  }, [loadSidebar])

  useEffect(() => {
    if (selectedKey) loadPageContent(selectedKey)
  }, [selectedKey, loadPageContent])

  const pageNeedsInit = selectedKey ? !sidebarPages.find((p) => p.pageKey === selectedKey)?.status ||
    sidebarPages.find((p) => p.pageKey === selectedKey)?.status === 'uninitialized' : false

  const markDirty = () => setDirty(true)

  const handleSelectPage = (pageKey: string) => {
    setSelectedKey(pageKey)
    setShowPagesMobile(false)
  }

  const handleInitialize = async () => {
    const meta = discovered.find((p) => p.id === selectedKey)
    if (!meta) return
    setBusy('init')
    try {
      const page =
        selectedKey === 'home'
          ? await seedHomePage()
          : await initializePage(selectedKey, meta.name, meta.path)
      setSelectedPage(page)
      setSections(page.content.sections ?? [])
      setSeoTitle(page.seo_title)
      setSeoDescription(page.seo_description)
      setSeoKeywords(page.seo_keywords)
      setOgImage(page.og_image)
      setTitle(page.title)
      setSlug(page.slug)
      setDirty(false)

      setSidebarPages((prev) =>
        prev.map((p) =>
          p.pageKey === selectedKey
            ? { ...p, status: page.status, name: page.title || p.name }
            : p,
        ),
      )
      toast.success('Page initialized')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to initialize page')
    } finally {
      setBusy(null)
    }
  }

  const updateSection = (sectionId: string, data: Record<string, unknown>) => {
    setSections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, data: data as never } : s)),
    )
    markDirty()
  }

  const toggleSection = (sectionId: string, enabled: boolean) => {
    setSections((prev) => prev.map((s) => (s.id === sectionId ? { ...s, enabled } : s)))
    markDirty()
  }

  const deleteSection = (sectionId: string) => {
    setSections((prev) => reorderSections(prev.filter((s) => s.id !== sectionId)))
    markDirty()
  }

  const duplicateSection = (sectionId: string) => {
    setSections((prev) => {
      const idx = prev.findIndex((s) => s.id === sectionId)
      if (idx === -1) return prev
      const source = prev[idx]
      const clone: PageSection = {
        ...source,
        id: generateSectionId(),
        data: JSON.parse(JSON.stringify(source.data)),
      }
      const updated = [...prev]
      updated.splice(idx + 1, 0, clone)
      return reorderSections(updated)
    })
    markDirty()
  }

  const moveSection = (sectionId: string, direction: -1 | 1) => {
    setSections((prev) => {
      const idx = prev.findIndex((s) => s.id === sectionId)
      if (idx === -1) return prev
      const target = idx + direction
      if (target < 0 || target >= prev.length) return prev
      const updated = [...prev]
      ;[updated[idx], updated[target]] = [updated[target], updated[idx]]
      return reorderSections(updated)
    })
    markDirty()
  }

  const addSection = (type: SectionType) => {
    setSections((prev) => [...prev, createSection(type, prev.length + 1)])
    markDirty()
  }

  const handleSaveDraft = async () => {
    if (!dirty) return
    setBusy('save')
    try {
      const content: PageContent = { sections }
      await saveDraft(selectedKey, {
        content,
        seo_title: seoTitle,
        seo_description: seoDescription,
        seo_keywords: seoKeywords,
        og_image: ogImage,
        title,
        slug,
      })
      setDirty(false)
      setSidebarPages((prev) =>
        prev.map((p) => (p.pageKey === selectedKey ? { ...p, status: 'draft' } : p)),
      )
      toast.success('Draft saved')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save draft')
    } finally {
      setBusy(null)
    }
  }

  const handlePublish = async () => {
    setBusy('publish')
    try {
      if (dirty) {
        const content: PageContent = { sections }
        await saveDraft(selectedKey, {
          content,
          seo_title: seoTitle,
          seo_description: seoDescription,
          seo_keywords: seoKeywords,
          og_image: ogImage,
          title,
          slug,
        })
      }
      const published = await publishPage(selectedKey)
      setSelectedPage(published)
      setSidebarPages((prev) =>
        prev.map((p) => (p.pageKey === selectedKey ? { ...p, status: 'published' } : p)),
      )
      setDirty(false)
      toast.success('Page published')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to publish')
    } finally {
      setBusy(null)
    }
  }

  const handleReset = async () => {
    try {
      await loadPageContent(selectedKey)
      toast.success('Changes reset')
    } catch {
      toast.error('Failed to reset')
    }
  }

  const pageTitle = selectedPage?.title || title || selectedKey
  const pageStatus = selectedPage?.status ?? 'draft'

  return (
    <div className="relative flex h-full min-h-0 flex-col bg-background">
      <div className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border/60 px-3 lg:px-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground lg:hidden"
            onClick={() => setShowPagesMobile(true)}
            aria-label="Open pages list"
          >
            <PanelLeft className="size-4" />
          </Button>
          {pageLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Loading…
            </div>
          ) : (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold tracking-tight text-foreground">
                {pageTitle}
              </p>
              {!pageNeedsInit && (
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span
                    className={cn(
                      'size-1.5 rounded-full',
                      pageStatus === 'published' ? 'bg-emerald-500' : 'bg-amber-500',
                    )}
                  />
                  <span className="capitalize">{pageStatus}</span>
                  {dirty && (
                    <>
                      <span aria-hidden>·</span>
                      <span className="font-medium text-amber-600 dark:text-amber-400">
                        Unsaved
                      </span>
                    </>
                  )}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => setPreviewOpen(true)}
          >
            <Eye className="size-3.5" />
            Preview
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground xl:hidden"
            onClick={() => setShowPropsMobile(true)}
            aria-label="Open page properties"
          >
            <PanelRight className="size-4" />
          </Button>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[260px_minmax(0,1fr)_320px]">
        <aside className="hidden h-full border-r border-border/60 bg-background lg:block">
          <PagesPanel
            pages={sidebarPages}
            selectedId={selectedKey}
            query={query}
            onQueryChange={setQuery}
            onSelect={handleSelectPage}
          />
        </aside>

        <section className="min-w-0 border-r border-border/60 xl:border-r">
          <EditorCanvas
            page={selectedPage}
            sections={sections}
            loading={pageLoading}
            needsInit={pageNeedsInit}
            pageKey={selectedKey}
            onInitialize={handleInitialize}
            onUpdateSection={updateSection}
            onToggleSection={toggleSection}
            onDeleteSection={deleteSection}
            onDuplicateSection={duplicateSection}
            onMoveSection={moveSection}
            onAddSection={addSection}
          />
        </section>

        <aside className="hidden h-full border-l border-border/60 bg-background xl:block">
          <PropertiesPanel
            title={title}
            seoTitle={seoTitle}
            seoDescription={seoDescription}
            seoKeywords={seoKeywords}
            ogImage={ogImage}
            slug={slug}
            dirty={dirty}
            busy={busy === 'save' || busy === 'publish' ? busy : null}
            onTitleChange={setTitle}
            onSeoTitleChange={setSeoTitle}
            onSeoDescriptionChange={setSeoDescription}
            onSeoKeywordsChange={setSeoKeywords}
            onOgImageChange={setOgImage}
            onSlugChange={setSlug}
            onSaveDraft={handleSaveDraft}
            onPublish={handlePublish}
            onReset={handleReset}
          />
        </aside>
      </div>

      <Dialog open={showPagesMobile} onOpenChange={setShowPagesMobile}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Website Pages</DialogTitle>
          </DialogHeader>
          <div className="-mx-4 -mb-4 h-[58svh] border-t border-border/60">
            <PagesPanel
              pages={sidebarPages}
              selectedId={selectedKey}
              query={query}
              onQueryChange={setQuery}
              onSelect={handleSelectPage}
            />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showPropsMobile} onOpenChange={setShowPropsMobile}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Page Properties</DialogTitle>
          </DialogHeader>
          <div className="-mx-4 -mb-4 h-[65svh] border-t border-border/60">
            <PropertiesPanel
              title={title}
              seoTitle={seoTitle}
              seoDescription={seoDescription}
              seoKeywords={seoKeywords}
              ogImage={ogImage}
              slug={slug}
              dirty={dirty}
              busy={busy === 'save' || busy === 'publish' ? busy : null}
              onTitleChange={setTitle}
              onSeoTitleChange={setSeoTitle}
              onSeoDescriptionChange={setSeoDescription}
              onSeoKeywordsChange={setSeoKeywords}
              onOgImageChange={setOgImage}
              onSlugChange={setSlug}
              onSaveDraft={handleSaveDraft}
              onPublish={handlePublish}
              onReset={handleReset}
            />
          </div>
        </DialogContent>
      </Dialog>

      <PreviewDialog
        page={selectedPage}
        sections={sections}
        open={previewOpen}
        onOpenChange={setPreviewOpen}
      />
    </div>
  )
}
