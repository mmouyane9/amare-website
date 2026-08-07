import { ListTree } from 'lucide-react'
import FooterNode from './FooterNode'
import type { FooterTreeNode } from '@/types/footer'

interface Props {
  tree: FooterTreeNode[]
  expanded: Set<string>
  onToggleExpand: (id: string) => void
  onEdit: (node: FooterTreeNode) => void
  onDelete: (node: FooterTreeNode) => void
  onToggle: (node: FooterTreeNode) => void
  onAddChild: (parent: FooterTreeNode) => void
  onMoveUp: (node: FooterTreeNode) => void
  onMoveDown: (node: FooterTreeNode) => void
  onDrop: (draggedId: string, targetId: string) => void
  loading: boolean
}

export default function FooterTree({
  tree,
  expanded,
  onToggleExpand,
  onEdit,
  onDelete,
  onToggle,
  onAddChild,
  onMoveUp,
  onMoveDown,
  onDrop,
  loading,
}: Props) {
  if (loading) {
    return (
      <div className="rounded-xl border border-border/60 bg-card">
        <div className="space-y-2 p-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 rounded-lg px-3 py-2">
              <span className="block h-4 w-4 animate-pulse rounded bg-muted" />
              <span className="block h-4 w-32 animate-pulse rounded bg-muted" />
              <span className="block h-4 w-20 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (tree.length === 0) {
    return (
      <div className="rounded-xl border border-border/60 bg-card">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <ListTree className="size-10 text-muted-foreground/40" />
          <p className="mt-3 text-sm font-medium text-muted-foreground">
            لا توجد روابط في القائمة السفلية.
          </p>
          <p className="mt-1 text-xs text-muted-foreground/70">
            أضف أول رابط للبدء.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border/60 bg-card">
      <div className="py-2">
        {tree.map((node) => (
          <FooterNode
            key={node.id}
            node={node}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggle={onToggle}
            onAddChild={onAddChild}
            onMoveUp={onMoveUp}
            onMoveDown={onMoveDown}
            onDrop={onDrop}
            expanded={expanded}
            onToggleExpand={onToggleExpand}
          />
        ))}
      </div>
    </div>
  )
}
