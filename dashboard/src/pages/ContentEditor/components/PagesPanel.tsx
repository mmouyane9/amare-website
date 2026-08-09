import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ChevronRight,
  FileText,
  Folder,
  FolderOpen,
  Lock,
  Search,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import {
  type TreeNode,
  TREE_DATA,
  flattenPages,
  findParentPath,
  loadExpandedState,
  saveExpandedState,
} from '@/pages/ContentEditor/data/treeData'

export interface SidebarPage {
  pageKey: string
  name: string
  status: 'published' | 'draft' | 'archived' | 'uninitialized'
  icon: string
  section: string
  path: string
}

interface PagesPanelProps {
  pages: SidebarPage[]
  selectedId: string
  query: string
  onQueryChange: (query: string) => void
  onSelect: (pageKey: string) => void
  lockedKeys?: ReadonlySet<string>
}

const INDENT_PX = 20

function statusColor(status: SidebarPage['status']): string {
  if (status === 'published') return 'bg-emerald-500'
  if (status === 'draft') return 'bg-amber-400'
  return 'bg-muted-foreground/25'
}

function useStatusMap(pages: SidebarPage[]): Map<string, SidebarPage['status']> {
  return useMemo(() => {
    const map = new Map<string, SidebarPage['status']>()
    for (const p of pages) {
      map.set(p.pageKey, p.status)
    }
    return map
  }, [pages])
}

export function PagesPanel({
  pages,
  selectedId,
  query,
  onQueryChange,
  onSelect,
  lockedKeys,
}: PagesPanelProps) {
  const [expanded, setExpanded] = useState<Set<string>>(() => loadExpandedState())
  const [focusNodeId, setFocusNodeId] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const statusMap = useStatusMap(pages)

  const trimmed = query.trim().toLowerCase()

  const filteredFlat = useMemo(() => {
    if (!trimmed) return null
    const allPages = flattenPages(TREE_DATA)
    return allPages.filter((node) =>
      node.label.toLowerCase().includes(trimmed),
    )
  }, [trimmed])

  const visibleNodes = useMemo(() => {
    const result: TreeNode[] = []
    function walk(list: TreeNode[], depth: number) {
      for (const node of list) {
        result.push(node)
        if (node.type === 'folder' && node.children && expanded.has(node.id)) {
          walk(node.children, depth + 1)
        }
      }
    }
    walk(TREE_DATA, 0)
    return result
  }, [expanded])

  const focusNodeIndex = focusNodeId
    ? visibleNodes.findIndex((n) => n.id === focusNodeId)
    : -1

  const persistExpanded = useCallback((action: React.SetStateAction<Set<string>>) => {
    setExpanded((prev) => {
      const next = typeof action === 'function' ? action(prev) : action
      saveExpandedState(next)
      return next
    })
  }, [])

  const toggleFolder = useCallback(
    (folderId: string) => {
      setFocusNodeId(folderId)
      persistExpanded((prev: Set<string>) => {
        const next = new Set(prev)
        if (next.has(folderId)) {
          next.delete(folderId)
        } else {
          next.add(folderId)
        }
        return next
      })
    },
    [persistExpanded],
  )

  const expandToNode = useCallback(
    (nodeId: string) => {
      const path = findParentPath(TREE_DATA, nodeId)
      if (!path) return
      persistExpanded((prev: Set<string>) => {
        const next = new Set(prev)
        for (const id of path) {
          next.add(id)
        }
        return next
      })
    },
    [persistExpanded],
  )

  useEffect(() => {
    if (trimmed && filteredFlat && filteredFlat.length > 0) {
      for (const match of filteredFlat) {
        expandToNode(match.id)
      }
    }
  }, [trimmed, filteredFlat, expandToNode])

  const moveFocus = useCallback(
    (delta: 1 | -1) => {
      const list = visibleNodes
      if (list.length === 0) return
      const current = focusNodeIndex === -1 ? 0 : focusNodeIndex + delta
      const clamped = Math.max(0, Math.min(current, list.length - 1))
      setFocusNodeId(list[clamped].id)
    },
    [visibleNodes, focusNodeIndex],
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (trimmed && filteredFlat && filteredFlat.length === 0) return

      switch (e.key) {
        case 'ArrowDown': {
          e.preventDefault()
          moveFocus(1)
          return
        }
        case 'ArrowUp': {
          e.preventDefault()
          moveFocus(-1)
          return
        }
        case 'ArrowRight': {
          e.preventDefault()
          if (!focusNodeId) return
          const node = visibleNodes.find((n) => n.id === focusNodeId)
          if (!node) return
          if (node.type === 'folder') {
            if (!expanded.has(node.id)) {
              toggleFolder(node.id)
            } else {
              moveFocus(1)
            }
          }
          return
        }
        case 'ArrowLeft': {
          e.preventDefault()
          if (!focusNodeId) return
          const node = visibleNodes.find((n) => n.id === focusNodeId)
          if (!node) return
          if (node.type === 'folder' && expanded.has(node.id)) {
            toggleFolder(node.id)
          } else {
            const path = findParentPath(TREE_DATA, node.id)
            if (path && path.length > 0) {
              const parentId = path[path.length - 1]
              setFocusNodeId(parentId)
            }
          }
          return
        }
        case 'Enter':
        case ' ': {
          e.preventDefault()
          if (!focusNodeId) return
          const node = visibleNodes.find((n) => n.id === focusNodeId)
          if (!node) return
          if (node.type === 'folder') {
            toggleFolder(node.id)
          } else if (node.pageKey) {
            onSelect(node.pageKey)
          }
          return
        }
        case 'Escape': {
          e.preventDefault()
          searchRef.current?.focus()
          return
        }
        case '/': {
          if (e.target === scrollRef.current || (e.target as HTMLElement)?.tagName === 'DIV') {
            e.preventDefault()
            searchRef.current?.focus()
          }
          return
        }
      }
    },
    [trimmed, filteredFlat, moveFocus, focusNodeId, visibleNodes, expanded, toggleFolder, onSelect],
  )

  useEffect(() => {
    if (focusNodeId) {
      const el = document.querySelector(`[data-tree-id="${CSS.escape(focusNodeId)}"]`)
      if (el) {
        el.scrollIntoView({ block: 'nearest' })
      }
    }
  }, [focusNodeId])

  const selectPage = useCallback(
    (pageKey: string) => {
      setFocusNodeId(pageKey)
      onSelect(pageKey)
    },
    [onSelect],
  )

  const getDepth = useCallback(
    (nodeId: string): number => {
      const path = findParentPath(TREE_DATA, nodeId)
      return path ? path.length : 0
    },
    [],
  )

  const pageCount = useMemo(() => flattenPages(TREE_DATA).length, [])

  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      <div className="shrink-0 border-b border-[#E5E7EB] px-3 pt-3 pb-2.5">
        <div className="mb-2.5 flex items-center justify-between px-1">
          <h2 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            الصفحات
          </h2>
          <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            {pageCount}
          </span>
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground/60" />
          <input
            ref={searchRef}
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="تصفية الصفحات…"
            className="h-8 w-full rounded-lg border border-[#E5E7EB] bg-gray-50/70 py-1.5 pr-2.5 pl-7.5 text-[13px] outline-none transition-all placeholder:text-muted-foreground/50 focus:border-primary/30 focus:bg-white focus:ring-2 focus:ring-primary/8"
          />
        </div>
      </div>

      <div
        ref={scrollRef}
        tabIndex={0}
        role="tree"
        aria-label="صفحات الموقع"
        className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden py-1 outline-none"
        onKeyDown={handleKeyDown}
      >
        {trimmed && filteredFlat && filteredFlat.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-4 py-16 text-center">
            <Search className="size-5 text-muted-foreground/30" />
            <p className="text-[13px] text-muted-foreground">
              لا توجد صفحات تطابق{' '}
              <span className="font-medium text-foreground">"{query.trim()}"</span>
            </p>
          </div>
        ) : trimmed && filteredFlat ? (
          <div className="px-1.5">
            {filteredFlat.map((node) => (
              <TreeItem
                key={node.id}
                node={node}
                depth={getDepth(node.id)}
                expanded={expanded}
                selectedId={selectedId}
                focusId={focusNodeId}
                status={node.pageKey ? statusMap.get(node.pageKey) : undefined}
                lockedKeys={lockedKeys}
                onToggle={toggleFolder}
                onSelect={selectPage}
                onFocus={setFocusNodeId}
              />
            ))}
          </div>
        ) : (
          <div className="px-1.5">
            {TREE_DATA.map((node) => (
              <TreeNodeRenderer
                key={node.id}
                node={node}
                depth={0}
                expanded={expanded}
                selectedId={selectedId}
                focusId={focusNodeId}
                statusMap={statusMap}
                lockedKeys={lockedKeys}
                onToggle={toggleFolder}
                onSelect={selectPage}
                onFocus={setFocusNodeId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function TreeNodeRenderer({
  node,
  depth,
  expanded,
  selectedId,
  focusId,
  statusMap,
  lockedKeys,
  onToggle,
  onSelect,
  onFocus,
}: {
  node: TreeNode
  depth: number
  expanded: Set<string>
  selectedId: string
  focusId: string | null
  statusMap: Map<string, SidebarPage['status']>
  lockedKeys?: ReadonlySet<string>
  onToggle: (id: string) => void
  onSelect: (pageKey: string) => void
  onFocus: (id: string) => void
}) {
  const isExpanded = expanded.has(node.id)
  const status = node.pageKey ? statusMap.get(node.pageKey) : undefined

  return (
    <>
      <TreeItem
        node={node}
        depth={depth}
        expanded={expanded}
        selectedId={selectedId}
        focusId={focusId}
        status={status}
        lockedKeys={lockedKeys}
        onToggle={onToggle}
        onSelect={onSelect}
        onFocus={onFocus}
      />
      {node.type === 'folder' && node.children && (
        <div
          className={cn(
            'grid transition-all duration-200 ease-in-out',
            isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
          )}
        >
          <div className="overflow-hidden">
            {node.children.map((child) => (
              <TreeNodeRenderer
                key={child.id}
                node={child}
                depth={depth + 1}
                expanded={expanded}
                selectedId={selectedId}
                focusId={focusId}
                statusMap={statusMap}
                lockedKeys={lockedKeys}
                onToggle={onToggle}
                onSelect={onSelect}
                onFocus={onFocus}
              />
            ))}
          </div>
        </div>
      )}
    </>
  )
}

function TreeItem({
  node,
  depth,
  expanded,
  selectedId,
  focusId,
  status,
  lockedKeys,
  onToggle,
  onSelect,
  onFocus,
}: {
  node: TreeNode
  depth: number
  expanded: Set<string>
  selectedId: string
  focusId: string | null
  status?: SidebarPage['status']
  lockedKeys?: ReadonlySet<string>
  onToggle: (id: string) => void
  onSelect: (pageKey: string) => void
  onFocus: (id: string) => void
}) {
  const isFolder = node.type === 'folder'
  const isExpanded = expanded.has(node.id)
  const isSelected = node.pageKey === selectedId
  const isFocused = focusId === node.id
  const showStatus = !isFolder && status
  const isLocked = !isFolder && !!node.pageKey && !!lockedKeys?.has(node.pageKey)

  const handleClick = () => {
    if (isFolder) {
      onToggle(node.id)
    } else if (node.pageKey) {
      onSelect(node.pageKey)
    }
  }

  const handleMouseEnter = () => onFocus(node.id)

  return (
    <button
      type="button"
      data-tree-id={node.id}
      role="treeitem"
      aria-expanded={isFolder ? isExpanded : undefined}
      aria-selected={isSelected}
      tabIndex={-1}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      className={cn(
        'group relative flex w-full items-center gap-1 rounded-lg py-1.5 text-left transition-colors duration-100',
        'text-[13px] leading-tight',
        isSelected
          ? 'bg-primary/8 text-primary font-medium'
          : isFocused
            ? 'bg-gray-100 text-foreground'
            : 'text-foreground/80 hover:bg-gray-50 hover:text-foreground',
      )}
      style={{ paddingInlineStart: `${8 + depth * INDENT_PX}px`, paddingInlineEnd: '8px' }}
    >
      {isFolder && (
        <span className="flex shrink-0 items-center justify-center size-4 text-muted-foreground/70 transition-transform duration-200">
          <ChevronRight
            className={cn(
              'size-3.5 transition-transform duration-200',
              isExpanded && 'rotate-90',
            )}
          />
        </span>
      )}

      <span
        className={cn(
          'flex shrink-0 items-center justify-center size-5 transition-colors',
          isFolder
            ? isExpanded
              ? 'text-amber-500/80'
              : 'text-amber-500/60'
            : isSelected
              ? 'text-primary/70'
              : 'text-muted-foreground/50',
        )}
      >
        {isFolder ? (
          isExpanded ? (
            <FolderOpen className="size-4" />
          ) : (
            <Folder className="size-4" />
          )
        ) : (
          <FileText className="size-[15px]" />
        )}
      </span>

      <span
        className={cn(
          'min-w-0 flex-1 truncate',
          isSelected && 'font-semibold',
          isLocked && !isSelected && 'text-muted-foreground/70',
        )}
      >
        {node.label}
      </span>

      {isLocked ? (
        <span
          className="ml-auto flex shrink-0 items-center text-muted-foreground/50"
          title="غير قابل للتعديل"
          aria-label="غير قابل للتعديل"
        >
          <Lock className="size-3.5" />
        </span>
      ) : (
        showStatus && (
          <span className="ml-auto shrink-0 flex items-center gap-1">
            <span
              className={cn(
                'size-1.5 rounded-full transition-colors',
                statusColor(status),
              )}
              title={status}
            />
          </span>
        )
      )}
    </button>
  )
}
