import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Check,
  Eye,
  FileText,
  Loader2,
  Monitor,
  PanelLeft,
  RotateCcw,
  Search,
  Send,
  Settings,
  Smartphone,
  Tablet,
  Undo2,
} from 'lucide-react'
import { toast } from 'sonner'

import { EditorCanvas } from '@/pages/ContentEditor/components/EditorCanvas'
import { PagesPanel, type SidebarPage } from '@/pages/ContentEditor/components/PagesPanel'
import { PreviewDialog } from '@/pages/ContentEditor/components/PreviewDialog'
import { PageSettingsPanel } from '@/pages/ContentEditor/components/PropertiesPanel'
import { SectionEditorPanel } from '@/pages/ContentEditor/components/SectionEditorPanel'
import { FlatFieldsPanel } from '@/pages/ContentEditor/components/FlatFieldsPanel'
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
  getSections,
  initializePage,
  saveDraft,
  publishPage,
  createSection,
  reorderSections,
  seedAboutPage,
  seedActivitiesPage,
  seedOnePartnerPage,
} from '@/services/content.service'
import { getPartnerNameFromKey } from '@/data/partner-page-content'
import type { PageRow, PageSection, SectionType } from '@/types/content'
import { sectionRowToPageSection } from '@/types/content'

type BusyAction = 'save' | 'publish' | null
type PreviewMode = 'desktop' | 'tablet' | 'mobile'

const HISTORY_LIMIT = 50

export default function ContentEditorPage() {
  const initialId = useMemo(() => getWebsitePages()[0]?.id ?? 'home', [])

  const [sidebarPages, setSidebarPages] = useState<SidebarPage[]>([])
  const [pagesLoading, setPagesLoading] = useState(true)
  const [selectedKey, setSelectedKey] = useState(initialId)
  const [pageLoading, setPageLoading] = useState(false)
  const [selectedPage, setSelectedPage] = useState<PageRow | null>(null)
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
  const [sectionQuery, setSectionQuery] = useState('')
  const [showPagesMobile, setShowPagesMobile] = useState(false)
  const [showPageSettings, setShowPageSettings] = useState(false)
  const [showFlatFields, setShowFlatFields] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [previewMode, setPreviewMode] = useState<PreviewMode>('desktop')
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)
  const [_historyTick, setHistoryTick] = useState(0)

  const undoStack = useRef<PageSection[][]>([])
  const redoStack = useRef<PageSection[][]>([])

  const discovered = useMemo(() => getWebsitePages(), [])

  const pushHistory = useCallback((newSections: PageSection[]) => {
    undoStack.current.push(newSections)
    if (undoStack.current.length > HISTORY_LIMIT) {
      undoStack.current.shift()
    }
    redoStack.current = []
    setHistoryTick((t) => t + 1)
  }, [])

  const handleUndo = useCallback(() => {
    if (undoStack.current.length === 0) return
    const prev = undoStack.current.pop()!
    redoStack.current.push(sections)
    setSections(prev)
    setDirty(true)
    setHistoryTick((t) => t + 1)
  }, [sections])

  const handleRedo = useCallback(() => {
    if (redoStack.current.length === 0) return
    const next = redoStack.current.pop()!
    undoStack.current.push(sections)
    setSections(next)
    setDirty(true)
    setHistoryTick((t) => t + 1)
  }, [sections])

  const canUndo = undoStack.current.length > 0
  const canRedo = redoStack.current.length > 0

  const loadSidebar = useCallback(async () => {
    try {
      setPagesLoading(true)
      const dbPages = await getPages()
      const dbMap: Record<string, PageRow> = {}
      for (const p of dbPages) {
        dbMap[p.slug] = p
      }

      const merged: SidebarPage[] = discovered.map((page) => ({
        pageKey: page.id,
        name: dbMap[page.path]?.title || page.name,
        status: dbMap[page.path] ? dbMap[page.path].status : 'uninitialized',
        icon: page.icon,
        section: page.section,
        path: page.path,
      }))

      setSidebarPages(merged)
    } catch (err) {
      console.error('[CMS] loadSidebar error:', err)
      toast.error('فشل تحميل الصفحات')
    } finally {
      setPagesLoading(false)
    }
  }, [discovered])

  const loadPageContent = useCallback(async (pageKey: string) => {
    try {
      setPageLoading(true)

      const meta = discovered.find((p) => p.id === pageKey)
      const lookupSlug = meta?.path ?? pageKey
      console.log('[CMS] Selected page:', pageKey, '→ slug:', lookupSlug)

      let page = await getPage(lookupSlug)
      console.log('[CMS] getPage result:', page ? { id: page.id, title: page.title, slug: page.slug, status: page.status } : 'NOT FOUND')

      if (!page) {
        const pageTitle = meta?.name ?? pageKey
        console.log('[CMS] Page not in DB — auto-creating:', { slug: lookupSlug, title: pageTitle })
        page = await initializePage(lookupSlug, pageTitle)
        console.log('[CMS] Created page:', { id: page.id, title: page.title })

        if (!page) {
          console.error('[CMS] Failed to initialize page')
          toast.error('فشل تحميل الصفحة')
          return
        }

        setSidebarPages((prev) =>
          prev.map((p) =>
            p.pageKey === pageKey
              ? { ...p, status: 'draft', name: page!.title || p.name }
              : p,
          ),
        )
      }

      if (!page) return

      setSelectedPage(page)
      setSeoTitle(page.seo_title)
      setSeoDescription(page.seo_description)
      setSeoKeywords(page.seo_keywords)
      setOgImage(page.og_image)
      setTitle(page.title)
      setSlug(page.slug)
      console.log('[CMS] Page set — id:', page.id)

      let sectionRows = await getSections(page.id)
      console.log('[CMS] getSections count:', sectionRows.length, 'page_id:', page.id)

      if (sectionRows.length === 0) {
        if (pageKey === 'about') {
          console.log('[CMS] Seeding about page sections...')
          const seeded = await seedAboutPage()
          sectionRows = await getSections(seeded.id)
          console.log('[CMS] Seeded about page sections:', sectionRows.length)
        } else if (pageKey === 'our-activities') {
          console.log('[CMS] Seeding activities page sections...')
          const seeded = await seedActivitiesPage()
          sectionRows = await getSections(seeded.id)
          console.log('[CMS] Seeded activities page sections:', sectionRows.length)
        } else if (pageKey.startsWith('partners-')) {
          const partnerName = getPartnerNameFromKey(pageKey.replace('partners-', ''))
          console.log('[CMS] Seeding partner page:', partnerName)
          const seeded = await seedOnePartnerPage(partnerName)
          sectionRows = await getSections(seeded.id)
          console.log('[CMS] Seeded partner page sections:', sectionRows.length)
        } else {
          console.warn(
            '[CMS] Zero sections returned for page. Verify RLS, page status, and section visibility.',
            { pageId: page.id, pageSlug: lookupSlug, pageStatus: page.status },
          )
        }
      }

      const mapped = sectionRows.map((row) => {
        const ps = sectionRowToPageSection(row)
        console.log('[CMS] mapped section:', { id: ps.id, type: ps.type, enabled: ps.enabled, dataKeys: Object.keys(ps.data as object) })
        return ps
      })
      console.log('[CMS] setSections with', mapped.length, 'items:', mapped.map(s => s.type))
      setSections(mapped)
      setDirty(false)
      setSelectedSectionId(null)
      setLastSavedAt(null)
      undoStack.current = []
      redoStack.current = []
      setHistoryTick(0)
      console.log('[CMS] Page loaded successfully —', sectionRows.length, 'sections')
    } catch (err) {
      console.error('[CMS] loadPageContent error:', err)
      toast.error(err instanceof Error ? err.message : 'فشل تحميل الصفحة')
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

  useEffect(() => {
    console.log('[CMS] sections state changed — length:', sections.length, 'items:', sections.map(s => s.type))
  }, [sections])

  const markDirty = () => {
    setDirty(true)
    setLastSavedAt(null)
  }

  const handleSelectPage = (pageKey: string) => {
    setSelectedKey(pageKey)
    setShowPagesMobile(false)
  }

  const updateSection = (sectionId: string, data: Record<string, unknown>) => {
    setSections((prev) => {
      const updated = prev.map((s) => (s.id === sectionId ? { ...s, data: data as never } : s))
      pushHistory(updated)
      return updated
    })
    markDirty()
  }

  const toggleSection = (sectionId: string, enabled: boolean) => {
    setSections((prev) => {
      const updated = prev.map((s) => (s.id === sectionId ? { ...s, enabled } : s))
      pushHistory(updated)
      return updated
    })
    markDirty()
  }

  const deleteSection = (sectionId: string) => {
    setSections((prev) => {
      const updated = reorderSections(prev.filter((s) => s.id !== sectionId))
      pushHistory(updated)
      return updated
    })
    markDirty()
  }

  const duplicateSection = (sectionId: string) => {
    setSections((prev) => {
      const idx = prev.findIndex((s) => s.id === sectionId)
      if (idx === -1) return prev
      const source = prev[idx]
      const clone: PageSection = {
        ...source,
        id: `sec-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
        data: JSON.parse(JSON.stringify(source.data)),
      }
      const updated = [...prev]
      updated.splice(idx + 1, 0, clone)
      pushHistory(reorderSections(updated))
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
      pushHistory(reorderSections(updated))
      return reorderSections(updated)
    })
    markDirty()
  }

  const addSection = (type: SectionType, renderer?: string) => {
    setSections((prev) => {
      const section = createSection(type, prev.length + 1)
      if (renderer) {
        section.data = { ...section.data, _renderer: renderer } as never
      }
      const updated = [...prev, section]
      pushHistory(updated)
      return updated
    })
    markDirty()
  }

  const handleSaveDraft = async () => {
    if (!dirty) return
    setBusy('save')
    try {
      await saveDraft(selectedPage?.slug ?? selectedKey, {
        title,
        newSlug: slug,
        seo_title: seoTitle,
        seo_description: seoDescription,
        seo_keywords: seoKeywords,
        og_image: ogImage,
        sections,
      })
      setDirty(false)
      setLastSavedAt(new Date())
      setSidebarPages((prev) =>
        prev.map((p) => (p.pageKey === selectedKey ? { ...p, status: 'draft' } : p)),
      )
      toast.success('تم الحفظ — تم تحديث الموقع')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'فشل الحفظ')
    } finally {
      setBusy(null)
    }
  }

  const handlePublish = async () => {
    setBusy('publish')
    try {
      if (dirty) {
        await saveDraft(selectedPage?.slug ?? selectedKey, {
          title,
          newSlug: slug,
          seo_title: seoTitle,
          seo_description: seoDescription,
          seo_keywords: seoKeywords,
          og_image: ogImage,
          sections,
        })
      }
      const pubSlug = selectedPage?.slug ?? selectedKey
      const published = await publishPage(pubSlug)
      setSelectedPage(published)
      setSidebarPages((prev) =>
        prev.map((p) => (p.pageKey === selectedKey ? { ...p, status: 'published' } : p)),
      )
      setDirty(false)
      setLastSavedAt(new Date())
      toast.success('تم النشر — تم تحديث الموقع')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'فشل النشر')
    } finally {
      setBusy(null)
    }
  }

  const handleReset = async () => {
    try {
      await loadPageContent(selectedKey)
      toast.success('تم إعادة تعيين التغييرات')
    } catch {
      toast.error('فشل إعادة التعيين')
    }
  }

  const busyRef = useRef(busy)
  busyRef.current = busy
  const dirtyRef = useRef(dirty)
  dirtyRef.current = dirty
  const handleSaveDraftRef = useRef(handleSaveDraft)
  handleSaveDraftRef.current = handleSaveDraft
  const handleUndoRef = useRef(handleUndo)
  handleUndoRef.current = handleUndo
  const handleRedoRef = useRef(handleRedo)
  handleRedoRef.current = handleRedo

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey
      if (mod && e.key === 's') {
        e.preventDefault()
        if (!busyRef.current && dirtyRef.current) handleSaveDraftRef.current()
        return
      }
      if (mod && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        handleUndoRef.current()
        return
      }
      if (mod && e.key === 'z' && e.shiftKey) {
        e.preventDefault()
        handleRedoRef.current()
        return
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const pageTitle = selectedPage?.title || title || selectedKey
  const pageStatus = selectedPage?.status ?? 'draft'

  const selectedSection = useMemo(
    () => sections.find((s) => s.id === selectedSectionId) ?? null,
    [sections, selectedSectionId],
  )

  const filteredSections = useMemo(() => {
    const q = sectionQuery.trim().toLowerCase()
    if (!q) return sections
    return sections.filter((s) => {
      const data = s.data as Record<string, unknown>
      return (
        s.type.toLowerCase().includes(q) ||
        String(data.heading ?? '').toLowerCase().includes(q) ||
        String(data.eyebrow ?? '').toLowerCase().includes(q) ||
        String(data.brandName ?? '').toLowerCase().includes(q)
      )
    })
  }, [sections, sectionQuery])

  const saveStatusText = useMemo(() => {
    if (busy) return null
    if (!lastSavedAt) return dirty ? 'تغييرات غير محفوظة' : null
    const minutes = Math.floor((Date.now() - lastSavedAt.getTime()) / 60000)
    if (minutes < 1) return 'حُفظت الآن'
    if (minutes === 1) return 'حُفظت منذ دقيقة'
    return `حُفظت منذ ${minutes} دقيقة`
  }, [lastSavedAt, dirty, busy])

  return (
    <div className="absolute inset-0 flex min-h-0 flex-col bg-white">
      <div className="flex shrink-0 items-center gap-3 border-b border-[#E5E7EB] px-4 py-2.5">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="text-muted-foreground lg:hidden"
          onClick={() => setShowPagesMobile(true)}
          aria-label="فتح قائمة الصفحات"
        >
          <PanelLeft className="size-4" />
        </Button>

        {pageLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            جارٍ التحميل…
          </div>
        ) : (
          <div className="flex min-w-0 items-center gap-3">
            <span className="truncate text-sm font-semibold text-foreground">
              {pageTitle}
            </span>
            {selectedPage && (
              <span
                className={cn(
                  'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium capitalize',
                  pageStatus === 'published'
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'bg-amber-50 text-amber-600',
                )}
              >
                {pageStatus}
                {dirty && ' · غير محفوظ'}
              </span>
            )}
          </div>
        )}

        <div className="flex flex-1 items-center justify-end gap-1.5">
          <div className="hidden items-center rounded-xl border border-[#E5E7EB] bg-gray-50 p-0.5 sm:flex">
            <button
              type="button"
              onClick={() => setPreviewMode('desktop')}
              className={cn(
                'rounded-lg px-2 py-1.5 transition-colors',
                previewMode === 'desktop'
                  ? 'bg-white text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
              title="سطح المكتب"
            >
              <Monitor className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setPreviewMode('tablet')}
              className={cn(
                'rounded-lg px-2 py-1.5 transition-colors',
                previewMode === 'tablet'
                  ? 'bg-white text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
              title="جهاز لوحي"
            >
              <Tablet className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setPreviewMode('mobile')}
              className={cn(
                'rounded-lg px-2 py-1.5 transition-colors',
                previewMode === 'mobile'
                  ? 'bg-white text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
              title="جوال"
            >
              <Smartphone className="size-3.5" />
            </button>
          </div>

          <div className="hidden sm:block h-5 w-px bg-[#E5E7EB] mx-1" />

          <div className="relative hidden md:block">
            <Search className="pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={sectionQuery}
              onChange={(e) => setSectionQuery(e.target.value)}
              placeholder="ابحث في الأقسام…"
              className="h-8 w-40 rounded-xl border border-[#E5E7EB] bg-gray-50 py-1 pl-3 pr-8 text-xs outline-none transition-all focus:w-52 focus:border-primary/30 focus:bg-white focus:ring-2 focus:ring-primary/10 placeholder:text-muted-foreground/60"
            />
          </div>

          <div className="hidden sm:block h-5 w-px bg-[#E5E7EB] mx-1" />

          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={handleUndo}
            disabled={!canUndo}
            className="text-muted-foreground hover:text-foreground disabled:opacity-30"
            title="تراجع (Ctrl+Z)"
          >
            <Undo2 className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={handleRedo}
            disabled={!canRedo}
            className="text-muted-foreground hover:text-foreground disabled:opacity-30"
            title="إعادة (Ctrl+Shift+Z)"
          >
            <RotateCcw className="size-4" />
          </Button>

          <div className="h-5 w-px bg-[#E5E7EB] mx-1" />

          {saveStatusText && (
            <span className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex">
              <Check className="size-3.5 text-emerald-500" />
              {saveStatusText}
            </span>
          )}

          {selectedPage && (
            <>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowPageSettings(true)}
                className="gap-1 text-muted-foreground hover:text-foreground"
              >
                <Settings className="size-3.5" />
                <span className="hidden sm:inline">الإعدادات</span>
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowFlatFields(true)}
                className="gap-1 text-muted-foreground hover:text-foreground"
              >
                <FileText className="size-3.5" />
                <span className="hidden sm:inline">حقول</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5 rounded-xl"
                onClick={() => setPreviewOpen(true)}
              >
                <Eye className="size-3.5" />
                <span className="hidden sm:inline">معاينة</span>
              </Button>

              <Button
                type="button"
                size="sm"
                className="gap-1.5 rounded-xl"
                onClick={handlePublish}
                disabled={busy !== null}
              >
                {busy === 'publish' ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Send className="size-3.5" />
                )}
                نشر
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden lg:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[260px_minmax(0,1fr)_420px]">
        <aside className="hidden h-full border-r border-[#E5E7EB] lg:block">
          {pagesLoading ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <PagesPanel
              pages={sidebarPages}
              selectedId={selectedKey}
              query={query}
              onQueryChange={setQuery}
              onSelect={handleSelectPage}
            />
          )}
        </aside>

        <section className="min-w-0 h-full">
          <EditorCanvas
            page={selectedPage}
            sections={sectionQuery ? filteredSections : sections}
            selectedSectionId={selectedSectionId}
            loading={pageLoading}
            showAddModal={showAddModal}
            pageKey={selectedKey}
            onSelectSection={(id) => {
              setSelectedSectionId(id)
              if (id) setShowPageSettings(false)
            }}
            onUpdateSection={updateSection}
            onToggleSection={toggleSection}
            onDeleteSection={deleteSection}
            onDuplicateSection={duplicateSection}
            onMoveSection={moveSection}
            onAddSection={addSection}
            onShowAddModal={setShowAddModal}
          />
        </section>

        <aside className="hidden h-full border-l border-[#E5E7EB] overflow-hidden xl:block">
          {selectedSection ? (
            <SectionEditorPanel
              section={selectedSection}
              onClose={() => setSelectedSectionId(null)}
              onChange={(data) => updateSection(selectedSection.id, data)}
              onToggle={(enabled) => toggleSection(selectedSection.id, enabled)}
              onDelete={() => {
                setSelectedSectionId(null)
                deleteSection(selectedSection.id)
              }}
              onDuplicate={() => duplicateSection(selectedSection.id)}
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
              <span className="flex size-16 items-center justify-center rounded-2xl bg-gray-50 text-muted-foreground/40">
                <Settings className="size-7" />
              </span>
              <div>
                <p className="text-sm font-medium text-foreground">لم يتم تحديد قسم</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  انقر على بطاقة قسم لتعديل محتواه وتصميمه وإعدادات SEO.
                </p>
              </div>
            </div>
          )}
        </aside>
      </div>

      <Dialog open={showPagesMobile} onOpenChange={setShowPagesMobile}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>الصفحات</DialogTitle>
          </DialogHeader>
          <div className="-mx-4 -mb-4 h-[58svh] border-t border-[#E5E7EB]">
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

      <Dialog open={showPageSettings} onOpenChange={setShowPageSettings}>
        <DialogContent className="max-h-[85svh] max-w-lg gap-0 overflow-hidden p-0">
          <DialogHeader className="border-b border-[#E5E7EB] px-6 py-4">
            <DialogTitle className="flex items-center gap-2 text-base font-semibold">
              <Settings className="size-4 text-primary" />
              إعدادات الصفحة
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              إدارة العنوان والرابط وSEO والنشر
            </p>
          </DialogHeader>
          <div className="overflow-y-auto">
            <PageSettingsPanel
              title={title}
              slug={slug}
              seoTitle={seoTitle}
              seoDescription={seoDescription}
              seoKeywords={seoKeywords}
              ogImage={ogImage}
              dirty={dirty}
              busy={busy}
              onTitleChange={setTitle}
              onSlugChange={setSlug}
              onSeoTitleChange={setSeoTitle}
              onSeoDescriptionChange={setSeoDescription}
              onSeoKeywordsChange={setSeoKeywords}
              onOgImageChange={setOgImage}
              onSaveDraft={handleSaveDraft}
              onPublish={handlePublish}
              onReset={handleReset}
            />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showFlatFields} onOpenChange={setShowFlatFields}>
        <DialogContent className="max-h-[85svh] max-w-lg gap-0 overflow-hidden p-0">
          <DialogHeader className="border-b border-[#E5E7EB] px-6 py-4">
            <DialogTitle className="flex items-center gap-2 text-base font-semibold">
              <FileText className="size-4 text-primary" />
              الحقول المسطحة
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              تعديل مباشر لحقول المحتوى من page_content
            </p>
          </DialogHeader>
          <div className="overflow-y-auto p-4">
            <FlatFieldsPanel page={selectedPage} />
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
