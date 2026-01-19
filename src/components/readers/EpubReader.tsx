import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface FoliateView extends HTMLElement {
  open: (book: Blob | File) => Promise<void>
  next: () => Promise<void>
  prev: () => Promise<void>
  goTo: (target: string | number | { fraction: number }) => Promise<void>
}

import type { ReaderTheme } from '../../types'

interface EpubReaderProps {
  filePath: string
  initialProgress?: number
  onProgressUpdate?: (progress: number) => void
  theme: ReaderTheme
}

export default function EpubReader({ filePath, initialProgress = 0, onProgressUpdate, theme }: EpubReaderProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<FoliateView | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentLabel, setCurrentLabel] = useState('')

  useEffect(() => {
    let mounted = true

    // Inject theme styles into the custom element
    const updateTheme = () => {
      if (viewRef.current) {
        const style = document.createElement('style')
        style.textContent = `
          :host {
            --bg: ${theme.bg};
            --fg: ${theme.text};
            background-color: var(--bg);
            color: var(--fg);
          }
        `
        // Foliate might have its own way to set theme, but common way for web components 
        // that don't expose a specific API is injecting style into shadowRoot or setting attributes.
        // Let's try to set style on the element itself first as it might use CSS variables.
        viewRef.current.style.setProperty('--foliate-background', theme.bg)
        viewRef.current.style.setProperty('--foliate-color', theme.text)
      }
    }

    updateTheme()

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

        // Read file and create File object (foliate-js needs the name property)
        const buffer = await window.ipcRenderer.invoke('read-file-buffer', filePath)
        const fileName = filePath.split(/[/\\]/).pop() || 'book.epub'
        const file = new File([buffer as Uint8Array], fileName, { type: 'application/epub+zip' })

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
  }, [filePath, initialProgress, onProgressUpdate])

  const handlePrev = () => viewRef.current?.prev()
  const handleNext = () => viewRef.current?.next()

  return (
    <div 
      className="flex flex-col h-full relative group transition-colors duration-200"
      style={{ backgroundColor: theme.bg, color: theme.text }}
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
      
      {!loading && !error && (
        <>
          <div 
            className="absolute left-0 top-0 bottom-0 w-16 z-10 cursor-pointer hover:bg-black/5 transition-colors flex items-center justify-start pl-2"
            onClick={handlePrev}
          >
            <ChevronLeft className="opacity-0 group-hover:opacity-50" />
          </div>
          <div 
            className="absolute right-0 top-0 bottom-0 w-16 z-10 cursor-pointer hover:bg-black/5 transition-colors flex items-center justify-end pr-2"
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
        </>
      )}

      <div 
        ref={containerRef} 
        className="flex-1 overflow-hidden w-full h-full" 
      />
    </div>
  )
}
