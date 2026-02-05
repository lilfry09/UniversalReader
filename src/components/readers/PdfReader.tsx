import { useState, useEffect, useCallback, useRef } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, AlertCircle, MessageSquare } from 'lucide-react'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'
import 'react-pdf/dist/esm/Page/TextLayer.css'

// Use local worker for offline support
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  '/pdf.worker.min.mjs',
  import.meta.url
).href

import type { ReaderTheme, Annotation, ReaderSettings } from '../../types'
import { DEFAULT_READER_SETTINGS } from '../../types'
import AnnotationPanel, { HighlightToolbar } from '../AnnotationPanel'

interface PdfReaderProps {
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
  pageNumber: number
}

export default function PdfReader({ 
  filePath, 
  bookId, 
  initialProgress = 0, 
  onProgressUpdate, 
  theme,
  readerSettings = DEFAULT_READER_SETTINGS 
}: PdfReaderProps) {
  const [numPages, setNumPages] = useState<number>(0)
  const [pageNumber, setPageNumber] = useState<number>(1)
  const [scale, setScale] = useState<number>(1.0)
  const [pdfData, setPdfData] = useState<{ data: ArrayBuffer } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Annotation state
  const [annotations, setAnnotations] = useState<Annotation[]>([])
  const [showAnnotations, setShowAnnotations] = useState(false)
  const [selection, setSelection] = useState<SelectionInfo | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

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

  useEffect(() => {
    const loadFile = async () => {
      try {
        setError(null)
        setLoading(true)
        const data = await window.ipcRenderer.invoke('read-file-buffer', filePath)
        const uint8Array = new Uint8Array(data)
        const arrayBuffer = uint8Array.buffer.slice(
          uint8Array.byteOffset,
          uint8Array.byteOffset + uint8Array.byteLength
        )
        setPdfData({ data: arrayBuffer })
      } catch (err) {
        console.error('Failed to load PDF:', err)
        setError(err instanceof Error ? err.message : 'Failed to load PDF file')
      } finally {
        setLoading(false)
      }
    }
    loadFile()
  }, [filePath])

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages)
    setError(null)
    if (initialProgress > 0) {
      setPageNumber(Math.max(1, Math.round(initialProgress * numPages)))
    }
  }

  const onDocumentLoadError = (err: Error) => {
    console.error('PDF Document Load Error:', err)
    setError(err.message)
  }

  const changePage = (offset: number) => {
    const newPage = Math.min(Math.max(1, pageNumber + offset), numPages)
    setPageNumber(newPage)
    
    if (onProgressUpdate && numPages > 0) {
      onProgressUpdate(newPage / numPages)
    }
  }

  const changeScale = (delta: number) => {
    setScale(prev => Math.min(Math.max(0.5, prev + delta), 3.0))
  }

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
    
    setSelection({
      text,
      position: {
        x: rect.left + rect.width / 2,
        y: rect.top - 10,
      },
      pageNumber,
    })
  }, [pageNumber])

  // Add highlight
  const handleHighlight = async (color: string) => {
    if (!selection) return

    try {
      await window.ipcRenderer.invoke('add-annotation', {
        bookId,
        type: 'highlight',
        pageNumber: selection.pageNumber,
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
        pageNumber: selection.pageNumber,
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
  const handleNavigateToAnnotation = (annotation: Annotation) => {
    if (annotation.pageNumber) {
      setPageNumber(annotation.pageNumber)
    }
  }

  const handleClickCapture = async (e: React.MouseEvent) => {
    const raw = localStorage.getItem('open-external-links')
    const enabled = raw == null ? true : raw === 'true'
    if (!enabled) return

    const target = e.target as HTMLElement | null
    const anchor = target?.closest('a') as HTMLAnchorElement | null
    if (!anchor?.href) return

    try {
      const url = new URL(anchor.href)
      if (url.protocol !== 'http:' && url.protocol !== 'https:' && url.protocol !== 'mailto:') return
      e.preventDefault()
      await window.ipcRenderer.invoke('open-external', anchor.href)
    } catch {
      // ignore
    }
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-red-600 p-8">
        <AlertCircle className="w-12 h-12 mb-4 opacity-50" />
        <h3 className="text-lg font-medium mb-2">Failed to load PDF</h3>
        <p className="text-sm text-gray-500 bg-gray-50 p-4 rounded border border-gray-100 max-w-lg break-all">
          {error}
        </p>
      </div>
    )
  }

  if (loading || !pdfData) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <div className="animate-pulse">Loading PDF...</div>
      </div>
    )
  }

  // Filter annotations for current page (for future highlight overlay feature)
  // const pageAnnotations = annotations.filter(a => a.pageNumber === pageNumber)

  // Compute background style for custom background image
  const backgroundStyle: React.CSSProperties = theme.customBgImage
    ? {
        backgroundImage: `url(${theme.customBgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }
    : { backgroundColor: theme.bg }

  return (
    <div 
      className="flex flex-col h-full relative" 
      style={backgroundStyle} 
      onClickCapture={handleClickCapture}
      ref={containerRef}
    >
      {/* Toolbar */}
      <div 
        className="flex items-center justify-between p-2 shadow-sm z-10"
        style={{ backgroundColor: theme.ui, color: theme.text, borderColor: theme.mode === 'light' ? '#e5e7eb' : 'transparent', borderBottomWidth: 1 }}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => changePage(-1)}
            disabled={pageNumber <= 1}
            className="p-1 hover:bg-black/10 rounded disabled:opacity-50"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm">
            Page {pageNumber} of {numPages || '--'}
          </span>
          <button
            onClick={() => changePage(1)}
            disabled={pageNumber >= numPages}
            className="p-1 hover:bg-black/10 rounded disabled:opacity-50"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => changeScale(-0.1)} className="p-1 hover:bg-black/10 rounded">
            <ZoomOut className="w-5 h-5" />
          </button>
          <span className="text-sm w-12 text-center">{Math.round(scale * 100)}%</span>
          <button onClick={() => changeScale(0.1)} className="p-1 hover:bg-black/10 rounded">
            <ZoomIn className="w-5 h-5" />
          </button>
          <div className="w-px h-6 bg-gray-300 mx-2" />
          <button 
            onClick={() => setShowAnnotations(!showAnnotations)}
            className={`p-1.5 rounded transition-colors ${showAnnotations ? 'bg-blue-100 text-blue-600' : 'hover:bg-black/10'}`}
            title="Annotations"
          >
            <MessageSquare className="w-5 h-5" />
            {annotations.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
                {annotations.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Document Area */}
      <div 
        className="flex-1 overflow-auto flex justify-center p-8"
        style={{ marginRight: showAnnotations ? '320px' : '0' }}
        onWheel={(e) => {
          if (e.ctrlKey) {
            e.preventDefault()
            const delta = e.deltaY > 0 ? -0.1 : 0.1
            changeScale(delta)
          }
        }}
        onMouseUp={handleMouseUp}
      >
        <Document
          file={pdfData}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          className="shadow-lg"
          loading={
            <div className="text-white">Loading document...</div>
          }
          error={
            <div className="text-red-300">Failed to render PDF</div>
          }
        >
          <Page 
            pageNumber={pageNumber} 
            scale={scale} 
            renderTextLayer={true}
            renderAnnotationLayer={true}
            loading={
              <div className="w-[600px] h-[800px] bg-white animate-pulse" />
            }
          />
        </Document>
      </div>

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
