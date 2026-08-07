import { useCallback, useState } from 'react'
import {
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  GripVertical,
  Pencil,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { NavigationTreeNode } from '@/types/navigation'

interface Props {
  node: NavigationTreeNode
  onEdit: (node: NavigationTreeNode) => void
  onDelete: (node: NavigationTreeNode) => void
  onToggle: (node: NavigationTreeNode) => void
  onAddChild: (parent: NavigationTreeNode) => void
  onMoveUp: (node: NavigationTreeNode) => void
  onMoveDown: (node: NavigationTreeNode) => void
  expanded: Set<string>
  onToggleExpand: (id: string) => void
  onDrop: (draggedId: string, targetId: string) => void
}

export default function NavigationNode({
  node,
  onEdit,
  onDelete,
  onToggle,
  onAddChild,
  onMoveUp,
  onMoveDown,
  expanded,
  onToggleExpand,
  onDrop,
}: Props) {
  const hasChildren = node.children.length > 0
  const isExpanded = expanded.has(node.id)
  const [dragOver, setDragOver] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  const handleDragStart = useCallback(
    (e: React.DragEvent) => {
      e.dataTransfer.setData('text/plain', node.id)
      e.dataTransfer.effectAllowed = 'move'
      setIsDragging(true)
    },
    [node.id],
  )

  const handleDragEnd = useCallback(() => {
    setIsDragging(false)
    setDragOver(false)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setDragOver(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragOver(false)
      const draggedId = e.dataTransfer.getData('text/plain')
      if (draggedId && draggedId !== node.id) {
        onDrop(draggedId, node.id)
      }
    },
    [node.id, onDrop],
  )

  return (
    <>
      <div
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        data-item-id={node.id}
        className={`group flex items-center gap-1.5 rounded-lg px-3 py-2 transition-all hover:bg-muted/50 ${
          dragOver ? 'border-2 border-dashed border-primary bg-primary/5' : 'border-2 border-transparent'
        } ${isDragging ? 'opacity-40' : ''}`}
        style={{ paddingRight: `${node.depth * 24 + 12}px` }}
      >
        <div className="cursor-grab active:cursor-grabbing text-muted-foreground/30 hover:text-muted-foreground/60">
          <GripVertical className="size-4" />
        </div>

        {hasChildren ? (
          <button
            onClick={() => onToggleExpand(node.id)}
            className="flex size-5 items-center justify-center rounded text-muted-foreground hover:text-foreground"
          >
            {isExpanded ? (
              <ChevronDown className="size-4" />
            ) : (
              <ChevronRight className="size-4" />
            )}
          </button>
        ) : (
          <span className="w-5" />
        )}

        <span
          className={`flex-1 text-sm font-medium ${
            node.is_visible ? 'text-foreground' : 'text-muted-foreground line-through'
          }`}
        >
          {node.title_ar}
          {node.description_ar && (
            <span className="ml-2 text-xs text-muted-foreground/60">
              — {node.description_ar}
            </span>
          )}
        </span>

        {node.url && (
          <span className="hidden text-xs text-muted-foreground sm:inline-block">
            {node.url}
          </span>
        )}

        <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => onToggle(node)}
            title={node.is_visible ? 'إخفاء' : 'إظهار'}
          >
            {node.is_visible ? (
              <Eye className="size-3" />
            ) : (
              <EyeOff className="size-3" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => onMoveUp(node)}
            title="تحريك لأعلى"
          >
            <ArrowUp className="size-3" />
          </Button>

          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => onMoveDown(node)}
            title="تحريك لأسفل"
          >
            <ArrowDown className="size-3" />
          </Button>

          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => onAddChild(node)}
            title="إضافة رابط فرعي"
          >
            <Plus className="size-3" />
          </Button>

          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => onEdit(node)}
            title="تعديل"
          >
            <Pencil className="size-3" />
          </Button>

          <Button
            variant="ghost"
            size="icon-xs"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => onDelete(node)}
            title="حذف"
          >
            <Trash2 className="size-3" />
          </Button>
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div>
          {node.children.map((child) => (
            <NavigationNode
              key={child.id}
              node={child}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggle={onToggle}
              onAddChild={onAddChild}
              onMoveUp={onMoveUp}
              onMoveDown={onMoveDown}
              expanded={expanded}
              onToggleExpand={onToggleExpand}
              onDrop={onDrop}
            />
          ))}
        </div>
      )}
    </>
  )
}
