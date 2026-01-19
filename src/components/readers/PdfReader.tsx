import { useState, useEffect } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, AlertCircle } from 'lucide-react'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'
import 'react-pdf/dist/esm/Page/TextLayer.css'

// Use CDN for worker - most reliable in Electron environment
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`

import { Book, ReaderTheme } from '../types'

interface PdfReaderProps {
  filePath: string
  initialProgress?: number
  onProgressUpdate?: (progress: number) => void
  theme: ReaderTheme
}

export default function PdfReader({ filePath, initialProgress = 0, onProgressUpdate, theme }: PdfReaderProps) {
  const [numPages, setNumPages] = useState<number>(0)
  const [pageNumber, setPageNumber] = useState<number>(1)
  const [scale, setScale] = useState<number>(1.0)
  const [pdfData, setPdfData] = useState<{ data: ArrayBuffer } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadFile = async () => {
      try {
        setError(null)
        setLoading(true)
        const data = await window.ipcRenderer.invoke('read-file-buffer', filePath)
        // Convert to ArrayBuffer properly
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

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: theme.bg }}>
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
        </div>
      </div>

      {/* Document Area */}
      <div 
        className="flex-1 overflow-auto flex justify-center p-8"
        onWheel={(e) => {
          if (e.ctrlKey) {
            e.preventDefault()
            const delta = e.deltaY > 0 ? -0.1 : 0.1
            changeScale(delta)
          }
        }}
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
    </div>
  )
}
