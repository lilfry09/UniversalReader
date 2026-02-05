import { useEffect, useRef, useState, useCallback } from 'react'
import { ChevronLeft, ChevronRight, MessageSquare } from 'lucide-react'
import type { ReaderTheme, Annotation, ReaderSettings, PageMode } from '../../types'
import { DEFAULT_READER_SETTINGS } from '../../types'
import AnnotationPanel, { HighlightToolbar } from '../AnnotationPanel'

interface FoliateView extends HTMLElement {
  open: (book: Blob | File) => Promise<void>
  next: () => Promise<void>
  prev: () => Promise<void>
  goTo: (target: string | number | { fraction: number }) => Promise<void>
  getCFI?: () => string
  renderer?: {
    setStyles?: (styles: Record<string, string>) => void
    setAttribute?: (name: string, value: string) => void
  }
}

interface EpubReaderProps {
  filePath: string
  bookId: number
  initialProgress?: number
  onProgressUpdate?: (progress: number) => void
  theme: ReaderTheme
  readerSettings?: ReaderSettings
}

interface SelectionInfo {
  text: string
  position: { x: number; y: number }
  cfi?: string
}

export default function EpubReader({ 
  filePath, 
  bookId, 
  initialProgress = 0, 
  onProgressUpdate, 
  theme,
  readerSettings = DEFAULT_READER_SETTINGS 
}: EpubReaderProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<FoliateView | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentLabel, setCurrentLabel] = useState('')
  
  // Annotation state
  const [annotations, setAnnotations] = useState<Annotation[]>([])
  const [showAnnotations, setShowAnnotations] = useState(false)
  const [selection, setSelection] = useState<SelectionInfo | null>(null)

  // Load annotations
  const loadAnnotations = useCallback(async () => {
    try {
      const annots = await window.ipcRenderer.invoke('get-annotations', bookId)
      setAnnotations(annots)
    } catch (err) {
      console.error('Failed to load annotations:', err)
    }
  }, [bookId])

  useEffect(() => {
    loadAnnotations()
  }, [loadAnnotations])

  // Apply reader settings when they change
  useEffect(() => {
    if (!viewRef.current) return
    const view = viewRef.current

    // Apply font and reading styles via CSS custom properties
    view.style.setProperty('--foliate-font-size', `${readerSettings.fontSize}px`)
    view.style.setProperty('--foliate-line-height', `${readerSettings.lineHeight}`)
    view.style.setProperty('--foliate-font-family', readerSettings.fontFamily)

    // Try to apply styles via renderer if available
    if (view.renderer?.setStyles) {
      view.renderer.setStyles({
        fontSize: `${readerSettings.fontSize}px`,
        lineHeight: `${readerSettings.lineHeight}`,
        fontFamily: readerSettings.fontFamily,
      })
    }
  }, [readerSettings])

  useEffect(() => {
    let mounted = true

    const loadBook = async () => {
      try {
        setLoading(true)
        setError(null)

        // Dynamically import foliate-js to ensure Web Component is registered
        await import('foliate-js/view.js')

        // Wait a tick for custom element to be defined
        await customElements.whenDefined('foliate-view')

        if (!mounted || !containerRef.current) return

        // Create the foliate-view element programmatically
        const view = document.createElement('foliate-view') as FoliateView
        view.style.width = '100%'
        view.style.height = '100%'
        containerRef.current.innerHTML = ''
        containerRef.current.appendChild(view)
        viewRef.current = view

        // Apply theme styles
        view.style.setProperty('--foliate-background', theme.customBgImage ? `url(${theme.customBgImage})` : theme.bg)
        view.style.setProperty('--foliate-color', theme.text)
        
        // Apply reader settings
        view.style.setProperty('--foliate-font-size', `${readerSettings.fontSize}px`)
        view.style.setProperty('--foliate-line-height', `${readerSettings.lineHeight}`)
        view.style.setProperty('--foliate-font-family', readerSettings.fontFamily)

        // Read file and create File object (foliate-js needs the name property)
        const buffer = await window.ipcRenderer.invoke('read-file-buffer', filePath)
        const fileName = filePath.split(/[/\\]/).pop() || 'book.epub'
        // Convert buffer to ArrayBuffer properly
        const uint8Array = new Uint8Array(buffer)
        const file = new File([uint8Array], fileName, { type: 'application/epub+zip' })

        // Open the book
        await view.open(file)

        if (initialProgress > 0) {
          await view.goTo({ fraction: initialProgress })
        }

        // Handle relocate events
        const handleRelocate = (e: Event) => {
          const customEvent = e as CustomEvent
          const { fraction, tocItem } = customEvent.detail
          if (onProgressUpdate && typeof fraction === 'number') {
            onProgressUpdate(fraction)
          }
          if (tocItem?.label) {
            setCurrentLabel(tocItem.label)
          }
        }

        view.addEventListener('relocate', handleRelocate)

      } catch (err) {
        console.error('Failed to load EPUB:', err)
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to load EPUB')
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadBook()

    return () => {
      mounted = false
    }
  }, [filePath, initialProgress, onProgressUpdate, theme.bg, theme.text])

  // Handle text selection
  const handleMouseUp = useCallback(() => {
    const sel = window.getSelection()
    if (!sel || sel.isCollapsed || !sel.toString().trim()) {
      setSelection(null)
      return
    }

    const text = sel.toString().trim()
    if (text.length < 2) {
      setSelection(null)
      return
    }

    const range = sel.getRangeAt(0)
    const rect = range.getBoundingClientRect()
    
    // Try to get CFI from foliate-view if available
    const cfi = viewRef.current?.getCFI?.()

    setSelection({
      text,
      position: {
        x: rect.left + rect.width / 2,
        y: rect.top - 10,
      },
      cfi,
    })
  }, [])

  // Add highlight
  const handleHighlight = async (color: string) => {
    if (!selection) return

    try {
      await window.ipcRenderer.invoke('add-annotation', {
        bookId,
        type: 'highlight',
        cfi: selection.cfi,
        text: selection.text,
        color,
      })
      await loadAnnotations()
      setSelection(null)
      window.getSelection()?.removeAllRanges()
    } catch (err) {
      console.error('Failed to add highlight:', err)
    }
  }

  // Add note
  const handleAddNote = async () => {
    if (!selection) return

    const note = prompt('Add a note:')
    if (note === null) return

    try {
      await window.ipcRenderer.invoke('add-annotation', {
        bookId,
        type: 'note',
        cfi: selection.cfi,
        text: selection.text,
        note,
        color: '#ffeb3b',
      })
      await loadAnnotations()
      setSelection(null)
      window.getSelection()?.removeAllRanges()
    } catch (err) {
      console.error('Failed to add note:', err)
    }
  }

  // Delete annotation
  const handleDeleteAnnotation = async (id: number) => {
    try {
      await window.ipcRenderer.invoke('delete-annotation', id)
      await loadAnnotations()
    } catch (err) {
      console.error('Failed to delete annotation:', err)
    }
  }

  // Update annotation
  const handleUpdateAnnotation = async (id: number, updates: { note?: string; color?: string }) => {
    try {
      await window.ipcRenderer.invoke('update-annotation', id, updates)
      await loadAnnotations()
    } catch (err) {
      console.error('Failed to update annotation:', err)
    }
  }

  // Navigate to annotation
  const handleNavigateToAnnotation = async (annotation: Annotation) => {
    if (annotation.cfi && viewRef.current) {
      try {
        await viewRef.current.goTo(annotation.cfi)
      } catch (err) {
        console.error('Failed to navigate to annotation:', err)
      }
    }
  }

  const handlePrev = () => viewRef.current?.prev()
  const handleNext = () => viewRef.current?.next()

  // Compute background style
  const backgroundStyle: React.CSSProperties = theme.customBgImage
    ? {
        backgroundImage: `url(${theme.customBgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        color: theme.text,
      }
    : { backgroundColor: theme.bg, color: theme.text }

  return (
    <div 
      className="flex flex-col h-full relative group transition-colors duration-200"
      style={backgroundStyle}
      onMouseUp={handleMouseUp}
    >
      {loading && (
        <div 
          className="absolute inset-0 flex items-center justify-center z-20"
          style={{ backgroundColor: theme.bg }}
        >
          <div className="text-gray-600">Loading eBook...</div>
        </div>
      )}

      {error && (
        <div 
          className="absolute inset-0 flex items-center justify-center z-20"
          style={{ backgroundColor: theme.bg }}
        >
          <div className="text-center p-8">
            <div className="text-red-600 mb-2">Failed to load EPUB</div>
            <div className="text-sm text-gray-500">{error}</div>
          </div>
        </div>
      )}
      
      {!loading && !error && readerSettings.pageMode !== 'scroll' && (
        <>
          <div 
            className="absolute left-0 top-0 bottom-0 w-16 z-10 cursor-pointer hover:bg-black/5 transition-colors flex items-center justify-start pl-2"
            onClick={handlePrev}
          >
            <ChevronLeft className="opacity-0 group-hover:opacity-50" />
          </div>
          <div 
            className="absolute right-0 top-0 bottom-0 w-16 z-10 cursor-pointer hover:bg-black/5 transition-colors flex items-center justify-end pr-2"
            style={{ right: showAnnotations ? '320px' : '0' }}
            onClick={handleNext}
          >
            <ChevronRight className="opacity-0 group-hover:opacity-50" />
          </div>

          {currentLabel && (
            <div 
              className="absolute top-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded text-xs backdrop-blur z-10"
              style={{ backgroundColor: theme.ui + 'cc', color: theme.text }}
            >
              {currentLabel}
            </div>
          )}

          {/* Annotation toggle button */}
          <button
            onClick={() => setShowAnnotations(!showAnnotations)}
            className="absolute top-2 right-2 p-2 rounded-lg z-20 transition-colors"
            style={{ 
              backgroundColor: showAnnotations ? theme.ui : 'transparent',
              color: theme.text,
            }}
            title="Annotations"
          >
            <MessageSquare className="w-5 h-5" />
            {annotations.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
                {annotations.length}
              </span>
            )}
          </button>
        </>
      )}

      <div 
        ref={containerRef} 
        className="flex-1 overflow-hidden w-full h-full transition-all duration-300" 
        style={{ marginRight: showAnnotations ? '320px' : '0' }}
      />

      {/* Highlight Toolbar */}
      {selection && (
        <HighlightToolbar
          position={selection.position}
          onHighlight={handleHighlight}
          onAddNote={handleAddNote}
          onClose={() => {
            setSelection(null)
            window.getSelection()?.removeAllRanges()
          }}
        />
      )}

      {/* Annotation Panel */}
      <AnnotationPanel
        annotations={annotations}
        theme={theme}
        onDelete={handleDeleteAnnotation}
        onUpdate={handleUpdateAnnotation}
        onNavigate={handleNavigateToAnnotation}
        isOpen={showAnnotations}
        onToggle={() => setShowAnnotations(!showAnnotations)}
      />
    </div>
  )
}
