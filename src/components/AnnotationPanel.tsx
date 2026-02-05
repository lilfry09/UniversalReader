import { useState } from 'react'
import { X, Trash2, MessageSquare, Highlighter } from 'lucide-react'
import type { Annotation, ReaderTheme } from '../types'

interface AnnotationPanelProps {
  annotations: Annotation[]
  theme: ReaderTheme
  onDelete: (id: number) => void
  onUpdate: (id: number, updates: { note?: string; color?: string }) => void
  onNavigate?: (annotation: Annotation) => void
  isOpen: boolean
  onToggle: () => void
}

const HIGHLIGHT_COLORS = [
  { name: 'Yellow', value: '#ffeb3b' },
  { name: 'Green', value: '#4caf50' },
  { name: 'Blue', value: '#2196f3' },
  { name: 'Pink', value: '#e91e63' },
  { name: 'Orange', value: '#ff9800' },
]

export default function AnnotationPanel({
  annotations,
  theme,
  onDelete,
  onUpdate,
  onNavigate,
  isOpen,
  onToggle,
}: AnnotationPanelProps) {
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editNote, setEditNote] = useState('')

  const handleStartEdit = (annotation: Annotation) => {
    setEditingId(annotation.id)
    setEditNote(annotation.note || '')
  }

  const handleSaveNote = (id: number) => {
    onUpdate(id, { note: editNote })
    setEditingId(null)
    setEditNote('')
  }

  const handleColorChange = (id: number, color: string) => {
    onUpdate(id, { color })
  }

  const borderColor = theme.mode === 'light' || theme.mode === 'sepia' ? '#e5e7eb' : 'rgba(255,255,255,0.12)'

  return (
    <div 
      className="absolute right-0 top-0 bottom-0 z-30 flex flex-col transition-all duration-300"
      style={{ 
        width: isOpen ? '320px' : '40px',
        backgroundColor: theme.ui,
        borderLeft: `1px solid ${borderColor}`,
      }}
    >
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="absolute -left-10 top-4 p-2 rounded-l-lg shadow-md"
        style={{ backgroundColor: theme.ui, color: theme.text }}
        title={isOpen ? 'Hide annotations' : 'Show annotations'}
      >
        <MessageSquare className="w-5 h-5" />
      </button>

      {isOpen && (
        <>
          {/* Header */}
          <div 
            className="p-4 border-b flex items-center justify-between shrink-0"
            style={{ borderColor }}
          >
            <h3 className="font-semibold" style={{ color: theme.text }}>
              Annotations ({annotations.length})
            </h3>
            <button
              onClick={onToggle}
              className="p-1 rounded hover:bg-black/10 transition-colors"
              style={{ color: theme.text }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Annotation List */}
          <div className="flex-1 overflow-y-auto p-2">
            {annotations.length === 0 ? (
              <div className="text-center py-8 px-4" style={{ color: theme.text, opacity: 0.6 }}>
                <Highlighter className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No annotations yet</p>
                <p className="text-xs mt-1">Select text to highlight or add notes</p>
              </div>
            ) : (
              <div className="space-y-2">
                {annotations.map((annotation) => (
                  <div
                    key={annotation.id}
                    className="rounded-lg p-3 cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all"
                    style={{ 
                      backgroundColor: annotation.color + '20',
                      borderLeft: `3px solid ${annotation.color}`,
                    }}
                    onClick={() => onNavigate?.(annotation)}
                  >
                    {/* Highlighted text */}
                    {annotation.text && (
                      <p 
                        className="text-sm mb-2 line-clamp-3"
                        style={{ color: theme.text }}
                      >
                        "{annotation.text}"
                      </p>
                    )}

                    {/* Page/Location info */}
                    <div className="text-xs mb-2" style={{ color: theme.text, opacity: 0.6 }}>
                      {annotation.pageNumber ? `Page ${annotation.pageNumber}` : 'EPUB location'}
                    </div>

                    {/* Note editing */}
                    {editingId === annotation.id ? (
                      <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                        <textarea
                          value={editNote}
                          onChange={(e) => setEditNote(e.target.value)}
                          placeholder="Add a note..."
                          className="w-full p-2 rounded text-sm resize-none border"
                          style={{ 
                            backgroundColor: theme.bg, 
                            color: theme.text,
                            borderColor,
                          }}
                          rows={3}
                          autoFocus
                        />
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => handleSaveNote(annotation.id)}
                            className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-3 py-1 rounded text-xs hover:bg-black/10"
                            style={{ color: theme.text }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : annotation.note ? (
                      <p 
                        className="text-xs italic mt-2 p-2 rounded"
                        style={{ backgroundColor: theme.bg, color: theme.text }}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleStartEdit(annotation)
                        }}
                      >
                        {annotation.note}
                      </p>
                    ) : null}

                    {/* Actions */}
                    <div 
                      className="flex items-center justify-between mt-2 pt-2 border-t"
                      style={{ borderColor }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Color selector */}
                      <div className="flex gap-1">
                        {HIGHLIGHT_COLORS.map((color) => (
                          <button
                            key={color.value}
                            onClick={() => handleColorChange(annotation.id, color.value)}
                            className="w-5 h-5 rounded-full border-2 transition-transform hover:scale-110"
                            style={{ 
                              backgroundColor: color.value,
                              borderColor: annotation.color === color.value ? theme.text : 'transparent',
                            }}
                            title={color.name}
                          />
                        ))}
                      </div>

                      <div className="flex gap-1">
                        <button
                          onClick={() => handleStartEdit(annotation)}
                          className="p-1.5 rounded hover:bg-black/10 transition-colors"
                          style={{ color: theme.text }}
                          title="Edit note"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Delete this annotation?')) {
                              onDelete(annotation.id)
                            }
                          }}
                          className="p-1.5 rounded hover:bg-red-100 text-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

// Floating toolbar for creating highlights
interface HighlightToolbarProps {
  position: { x: number; y: number }
  onHighlight: (color: string) => void
  onAddNote: () => void
  onClose: () => void
}

export function HighlightToolbar({ position, onHighlight, onAddNote, onClose }: HighlightToolbarProps) {
  return (
    <div
      className="fixed z-50 bg-gray-900 text-white rounded-lg shadow-xl p-2 flex items-center gap-1"
      style={{
        left: position.x,
        top: position.y,
        transform: 'translateX(-50%)',
      }}
    >
      {HIGHLIGHT_COLORS.map((color) => (
        <button
          key={color.value}
          onClick={() => onHighlight(color.value)}
          className="w-6 h-6 rounded-full hover:scale-110 transition-transform"
          style={{ backgroundColor: color.value }}
          title={`Highlight ${color.name}`}
        />
      ))}
      <div className="w-px h-6 bg-gray-600 mx-1" />
      <button
        onClick={onAddNote}
        className="p-1.5 rounded hover:bg-gray-700 transition-colors"
        title="Add note"
      >
        <MessageSquare className="w-4 h-4" />
      </button>
      <button
        onClick={onClose}
        className="p-1.5 rounded hover:bg-gray-700 transition-colors"
        title="Close"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
