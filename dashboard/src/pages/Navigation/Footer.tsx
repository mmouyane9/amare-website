import { useCallback, useEffect, useState } from 'react'
import { Plus, LayoutList } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  getItems,
  createItem,
  updateItem,
  deleteItem,
  toggleVisibility,
  moveItemUp,
  moveItemDown,
  getStats,
  buildTree,
  getColumns,
  subscribeToFooter,
  reorderItem,
  reparentItem,
} from '@/services/footer.service'
import type {
  FooterItem,
  FooterItemCreateInput,
  FooterColumn,
  FooterTreeNode,
  FooterStats as FooterStatsType,
} from '@/types/footer'

import FooterStatsCards from '@/components/footer/FooterStats'
import FooterAboutSettings from '@/components/footer/FooterAboutSettings'
import FooterTree from '@/components/footer/FooterTree'
import FooterModal from '@/components/footer/FooterModal'
import FooterDeleteDialog from '@/components/footer/FooterDeleteDialog'

const ICON_MAP: Record<string, string> = {
  about: 'info',
  links: 'link',
  contact: 'phone',
  map: 'map-pin',
}

export default function FooterPage() {
  const [items, setItems] = useState<FooterItem[]>([])
  const [columns, setColumns] = useState<FooterColumn[]>([])
  const [stats, setStats] = useState<FooterStatsType>({
    totalItems: 0,
    visibleItems: 0,
    hiddenItems: 0,
    columnCount: 0,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const [activeColumn, setActiveColumn] = useState<string>('all')

  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<FooterTreeNode | null>(null)
  const [preselectedColumnId, setPreselectedColumnId] = useState<string | null>(null)
  const [preselectedParentId, setPreselectedParentId] = useState<string | null>(null)

  const [deleteTarget, setDeleteTarget] = useState<FooterTreeNode | null>(null)

  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [fetchedItems, fetchedColumns, fetchedStats] = await Promise.all([
        getItems(),
        getColumns(),
        getStats(),
      ])
      setItems(fetchedItems)
      setColumns(fetchedColumns)

      const autoExpand = new Set<string>()
      fetchedItems
        .filter((i) => i.parent_id)
        .forEach((i) => {
          if (i.parent_id) autoExpand.add(i.parent_id)
        })
      setExpanded(autoExpand)
      setStats(fetchedStats)
    } catch {
      toast.error('فشل تحميل بيانات القائمة السفلية')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    const channel = subscribeToFooter(() => {
      fetchData()
    })
    return () => {
      channel.unsubscribe()
    }
  }, [fetchData])

  const handleToggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const tree = buildTree(
    items.filter((item) => {
      const matchesColumn =
        activeColumn === 'all' || item.column_id === activeColumn
      return matchesColumn
    }),
  )

  const handleAddToColumn = (columnId: string) => {
    setEditingItem(null)
    setPreselectedColumnId(columnId)
    setPreselectedParentId(null)
    setModalOpen(true)
  }

  const openEditModal = (node: FooterTreeNode) => {
    setEditingItem(node)
    setPreselectedColumnId(null)
    setPreselectedParentId(null)
    setModalOpen(true)
  }

  const handleSave = async (input: FooterItemCreateInput) => {
    setSaving(true)
    try {
      if (editingItem) {
        await updateItem(editingItem.id, input)
        toast.success('تم تحديث الرابط بنجاح')
      } else {
        await createItem(input)
        toast.success('تم إضافة الرابط بنجاح')
      }
      setModalOpen(false)
      await fetchData()
    } catch {
      toast.error(editingItem ? 'فشل تحديث الرابط' : 'فشل إضافة الرابط')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteItem(deleteTarget.id)
      toast.success('تم حذف الرابط بنجاح')
      setDeleteTarget(null)
      await fetchData()
    } catch {
      toast.error('فشل حذف الرابط')
    } finally {
      setDeleting(false)
    }
  }

  const handleToggle = async (node: FooterTreeNode) => {
    const previousItems = [...items]
    setItems((prev) =>
      prev.map((i) =>
        i.id === node.id ? { ...i, is_visible: !i.is_visible } : i,
      ),
    )
    try {
      await toggleVisibility(node.id, !node.is_visible)
      toast.success(node.is_visible ? 'تم إخفاء الرابط' : 'تم إظهار الرابط')
      await fetchData()
    } catch {
      setItems(previousItems)
      toast.error('فشل تحديث الحالة')
    }
  }

  const handleMoveUp = async (node: FooterTreeNode) => {
    try {
      await moveItemUp(node.id)
      toast.success('تم تحريك الرابط لأعلى')
      await fetchData()
    } catch {
      toast.error('فشل تحريك العنصر')
    }
  }

  const handleMoveDown = async (node: FooterTreeNode) => {
    try {
      await moveItemDown(node.id)
      toast.success('تم تحريك الرابط لأسفل')
      await fetchData()
    } catch {
      toast.error('فشل تحريك العنصر')
    }
  }

  const handleAddChild = (parent: FooterTreeNode) => {
    setEditingItem(null)
    setPreselectedColumnId(parent.column_id)
    setPreselectedParentId(parent.id)
    setModalOpen(true)
  }

  const handleDrop = async (draggedId: string, targetId: string) => {
    if (draggedId === targetId) return
    const dragged = items.find((i) => i.id === draggedId)
    const target = items.find((i) => i.id === targetId)
    if (!dragged || !target) return

    try {
      if (dragged.parent_id !== target.parent_id) {
        await reparentItem(draggedId, target.parent_id, target.column_id)
      }

      const targetSiblings = items
        .filter(
          (i) =>
            i.parent_id === target.parent_id &&
            i.column_id === target.column_id,
        )
        .sort((a, b) => a.sort_order - b.sort_order)

      const targetIndex = targetSiblings.findIndex((i) => i.id === targetId)
      if (targetIndex < 0) return

      const newSorted = targetSiblings
        .filter((i) => i.id !== draggedId)
        .slice(0, targetIndex)
        .concat([dragged])
        .concat(
          targetSiblings.filter((i) => i.id !== draggedId).slice(targetIndex),
        )

      for (let i = 0; i < newSorted.length; i++) {
        await reorderItem(newSorted[i].id, i + 1)
      }
      await fetchData()
      toast.success('تم ترتيب الرابط بنجاح')
    } catch {
      toast.error('فشل ترتيب الرابط')
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            القائمة السفلية (Footer)
          </h2>
          <p className="text-sm text-muted-foreground">
            إدارة أعمدة وروابط القائمة السفلية للموقع —{' '}
            {columns.length} أعمدة.
          </p>
        </div>
        <Button onClick={() => handleAddToColumn(activeColumn !== 'all' ? activeColumn : '')} className="gap-1.5">
          <Plus className="size-4" />
          إضافة رابط
        </Button>
      </div>

      <FooterStatsCards stats={stats} />

      <div className="mb-6">
        <FooterAboutSettings />
      </div>

      <Tabs
        value={activeColumn}
        onValueChange={setActiveColumn}
        className="mb-4"
      >
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="all">كل الأعمدة</TabsTrigger>
          {columns.map((col) => (
            <TabsTrigger key={col.id} value={col.id}>
              {col.title_ar}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {columns.map((col) => (
              <div
                key={col.id}
                className="rounded-xl border border-border/60 bg-card"
              >
                <div className="flex items-center justify-between border-b px-4 py-3">
                  <h3 className="text-sm font-semibold">{col.title_ar}</h3>
                  <span className="rounded bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                    {ICON_MAP[col.type] || col.type}
                  </span>
                </div>
                <div className="max-h-[400px] overflow-y-auto p-2">
                  <FooterTree
                    tree={buildTree(items.filter((i) => i.column_id === col.id))}
                    expanded={expanded}
                    onToggleExpand={handleToggleExpand}
                    onEdit={openEditModal}
                    onDelete={(node) => setDeleteTarget(node)}
                    onToggle={handleToggle}
                    onAddChild={handleAddChild}
                    onMoveUp={handleMoveUp}
                    onMoveDown={handleMoveDown}
                    onDrop={handleDrop}
                    loading={loading}
                  />
                  <div className="mt-1 px-3 pb-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-xs text-muted-foreground"
                      onClick={() => handleAddToColumn(col.id)}
                    >
                      <Plus className="mr-1 size-3" />
                      إضافة رابط
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {columns.map((col) => (
          <TabsContent key={col.id} value={col.id} className="mt-4">
            <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
              <LayoutList className="size-4" />
              العمود: {col.title_ar}
              <span className="rounded bg-muted px-2 py-0.5 text-[10px]">
                {col.type === 'about'
                  ? 'حول الجمعية'
                  : col.type === 'links'
                    ? 'روابط'
                    : col.type === 'contact'
                      ? 'تواصل'
                      : 'خريطة'}
              </span>
            </div>
            <FooterTree
              tree={tree}
              expanded={expanded}
              onToggleExpand={handleToggleExpand}
              onEdit={openEditModal}
              onDelete={(node) => setDeleteTarget(node)}
              onToggle={handleToggle}
              onAddChild={handleAddChild}
              onMoveUp={handleMoveUp}
              onMoveDown={handleMoveDown}
              onDrop={handleDrop}
              loading={loading}
            />
          </TabsContent>
        ))}
      </Tabs>

      <FooterModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSave={handleSave}
        saving={saving}
        editingItem={editingItem}
        columns={columns}
        defaultColumnId={preselectedColumnId}
        defaultParentId={preselectedParentId}
      />

      <FooterDeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        title={deleteTarget?.title_ar ?? ''}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  )
}
