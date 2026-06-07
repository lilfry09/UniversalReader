import { useState } from 'react'
import { ChevronRight, ChevronDown, BookOpen, X } from 'lucide-react'
import { clsx } from 'clsx'

export interface TocItem {
  label: string
  href: string
  subitems?: TocItem[]
  level?: number
}

interface TocPanelProps {
  toc: TocItem[]
  currentHref?: string
  onNavigate: (href: string) => void
  onClose?: () => void
  theme?: {
    bg: string
    text: string
    ui: string
  }
}

export default function TocPanel({ toc, currentHref, onNavigate, onClose, theme }: TocPanelProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  const toggleExpand = (href: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(href)) {
      newExpanded.delete(href)
    } else {
      newExpanded.add(href)
    }
    setExpandedItems(newExpanded)
  }

  const renderTocItem = (item: TocItem, index: number, depth: number = 0) => {
    const hasChildren = item.subitems && item.subitems.length > 0
    const isExpanded = expandedItems.has(item.href)
    const isCurrent = currentHref === item.href
    const indent = depth * 16

    return (
      <div key={`${item.href}-${index}`}>
        <div
          className={clsx(
            'group flex items-center gap-2 px-3 py-2 text-sm cursor-pointer transition-colors',
            isCurrent && 'bg-[#637a68]/10 font-medium'
          )}
          style={{
            paddingLeft: `${12 + indent}px`,
            color: isCurrent ? '#637a68' : theme?.text,
          }}
          onClick={() => {
            if (hasChildren) {
              toggleExpand(item.href)
            }
            onNavigate(item.href)
          }}
        >
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                toggleExpand(item.href)
              }}
              className="shrink-0"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          )}
          {!hasChildren && <div className="w-4" />}
          <span className="flex-1 truncate group-hover:text-[#637a68] transition-colors">
            {item.label}
          </span>
        </div>

        {hasChildren && isExpanded && (
          <div>
            {item.subitems!.map((subitem, subindex) =>
              renderTocItem(subitem, subindex, depth + 1)
            )}
          </div>
        )}
      </div>
    )
  }

  if (!toc || toc.length === 0) {
    return (
      <div
        className="h-full flex flex-col"
        style={{ backgroundColor: theme?.ui, color: theme?.text }}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'rgba(0,0,0,0.1)' }}>
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            <span className="font-medium text-sm">目录</span>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-black/5 rounded transition-colors"
              title="关闭目录"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="flex-1 flex items-center justify-center text-sm opacity-50">
          此书籍暂无目录
        </div>
      </div>
    )
  }

  return (
    <div
      className="h-full flex flex-col"
      style={{ backgroundColor: theme?.ui, color: theme?.text }}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'rgba(0,0,0,0.1)' }}>
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4" />
          <span className="font-medium text-sm">目录</span>
          <span className="text-xs opacity-50">({toc.length})</span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 hover:bg-black/5 rounded transition-colors"
            title="关闭目录"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {toc.map((item, index) => renderTocItem(item, index, 0))}
      </div>
    </div>
  )
}
