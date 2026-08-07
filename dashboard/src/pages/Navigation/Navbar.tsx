import { useCallback, useEffect, useRef, useState } from 'react'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  getItems,
  createItem,
  updateItem,
  deleteItem,
  toggleItemVisibility,
  moveItemUp,
  moveItemDown,
  getStats,
  getGroups,
  buildTree,
  subscribeToNavigation,
  reorderItem,
  reparentItem,
} from '@/services/navigation.service'
import type {
  NavigationTreeNode,
  NavigationItemCreateInput,
  NavigationItem,
  NavigationGroup,
  NavigationStats as NavigationStatsType,
} from '@/types/navigation'

import NavigationStats from '@/components/navigation/NavigationStats'
import NavigationToolbar from '@/components/navigation/NavigationToolbar'
import NavigationTree from '@/components/navigation/NavigationTree'
import NavigationModal from '@/components/navigation/NavigationModal'
import DeleteDialog from '@/components/navigation/DeleteDialog'

export default function NavbarPage() {
  const [items, setItems] = useState<NavigationItem[]>([])
  const [groups, setGroups] = useState<NavigationGroup[]>([])
  const [stats, setStats] = useState<NavigationStatsType>({
    totalItems: 0,
    visibleItems: 0,
    hiddenItems: 0,
    dropdownCount: 0,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [filter, setFilter] = useState('all')

  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<NavigationTreeNode | null>(null)
  const [preselectedParentId, setPreselectedParentId] = useState<string | null>(null)

  const [deleteTarget, setDeleteTarget] = useState<NavigationTreeNode | null>(null)

  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const searchTimeout = useRef<ReturnType<typeof setTimeout>>(undefined)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [fetchedItems, fetchedGroups, fetchedStats] = await Promise.all([
        getItems(),
        getGroups(),
        getStats(),
      ])
      setItems(fetchedItems)
      setGroups(fetchedGroups)
      setStats(fetchedStats)

      const autoExpand = new Set<string>()
      fetchedItems
        .filter((i) => i.parent_id && i.is_visible)
        .forEach((i) => {
          if (i.parent_id) autoExpand.add(i.parent_id)
        })
      setExpanded(autoExpand)
    } catch {
      toast.error('فشل تحميل بيانات القائمة')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    const channel = subscribeToNavigation(() => {
      fetchData()
    })
    return () => {
      channel.unsubscribe()
    }
  }, [fetchData])

  const handleSearchInput = (value: string) => {
    setSearchInput(value)
    if (searchTimeout.current) clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(() => {
      setSearch(value)
      const autoExpand = new Set<string>()
      if (value) {
        items.forEach((i) => {
          if (i.parent_id) autoExpand.add(i.parent_id)
        })
      }
      setExpanded(autoExpand)
    }, 300)
  }

  const handleFilterChange = (value: string) => {
    setFilter(value)
  }

  const handleToggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const tree = buildTree(
    items.filter((item) => {
      const matchesSearch =
        !search ||
        item.title_ar.includes(search) ||
        (item.url && item.url.includes(search))
      const matchesFilter =
        filter === 'all' ||
        (filter === 'visible' && item.is_visible) ||
        (filter === 'hidden' && !item.is_visible)
      return matchesSearch && matchesFilter
    }),
  )

  const allTree = buildTree(items)

  const openCreateModal = () => {
    setEditingItem(null)
    setPreselectedParentId(null)
    setModalOpen(true)
  }

  const openEditModal = (node: NavigationTreeNode) => {
    setEditingItem(node)
    setPreselectedParentId(null)
    setModalOpen(true)
  }

  const handleSave = async (input: NavigationItemCreateInput) => {
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
    } catch (err) {
      console.error('Failed to save item:', err)
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

  const handleToggle = async (node: NavigationTreeNode) => {
    const previousItems = [...items]
    setItems((prev) =>
      prev.map((i) =>
        i.id === node.id ? { ...i, is_visible: !i.is_visible } : i,
      ),
    )
    try {
      await toggleItemVisibility(node.id, !node.is_visible)
      toast.success(node.is_visible ? 'تم إخفاء الرابط' : 'تم إظهار الرابط')
      await fetchData()
    } catch {
      setItems(previousItems)
      toast.error('فشل تحديث الحالة')
    }
  }

  const handleMoveUp = async (node: NavigationTreeNode) => {
    try {
      await moveItemUp(node.id)
      toast.success('تم تحريك الرابط لأعلى')
      await fetchData()
    } catch {
      toast.error('فشل تحريك العنصر')
    }
  }

  const handleMoveDown = async (node: NavigationTreeNode) => {
    try {
      await moveItemDown(node.id)
      toast.success('تم تحريك الرابط لأسفل')
      await fetchData()
    } catch {
      toast.error('فشل تحريك العنصر')
    }
  }

  const handleAddChild = (parent: NavigationTreeNode) => {
    setEditingItem(null)
    setPreselectedParentId(parent.id)
    setModalOpen(true)
  }

  const handleDrop = async (draggedId: string, targetId: string) => {
    if (draggedId === targetId) return

    const dragged = items.find((i) => i.id === draggedId)
    const target = items.find((i) => i.id === targetId)
    if (!dragged || !target) return

    const isDescendant = (parentId: string, childId: string): boolean => {
      const children = items.filter((i) => i.parent_id === parentId)
      for (const c of children) {
        if (c.id === childId) return true
        if (isDescendant(c.id, childId)) return true
      }
      return false
    }

    if (isDescendant(draggedId, targetId)) return

    try {
      if (dragged.parent_id !== target.parent_id) {
        await reparentItem(draggedId, target.parent_id)
      }

      const targetSiblings = items
        .filter((i) => i.parent_id === target.parent_id)
        .sort((a, b) => a.sort_order - b.sort_order)

      const targetIndex = targetSiblings.findIndex((i) => i.id === targetId)
      if (targetIndex < 0) return

      const newSorted = targetSiblings
        .filter((i) => i.id !== draggedId)
        .slice(0, targetIndex)
        .concat([dragged])
        .concat(targetSiblings.filter((i) => i.id !== draggedId).slice(targetIndex))

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
            القائمة العلوية (Navbar)
          </h2>
          <p className="text-sm text-muted-foreground">
            إدارة روابط القائمة العلوية للموقع — كل تغيير يظهر مباشرة على الموقع.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={openCreateModal} className="gap-1.5">
            <Plus className="size-4" />
            إضافة رابط رئيسي
          </Button>
        </div>
      </div>

      <NavigationStats stats={stats} />

      <NavigationToolbar
        search={searchInput}
        onSearchChange={handleSearchInput}
        filter={filter}
        onFilterChange={handleFilterChange}
      />

      <NavigationTree
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

      <NavigationModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSave={handleSave}
        saving={saving}
        editingItem={editingItem}
        allItems={allTree}
        groups={groups}
        defaultParentId={preselectedParentId}
      />

      <DeleteDialog
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
