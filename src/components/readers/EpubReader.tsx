import { useEffect, useRef, useState, useCallback } from 'react'
import { ChevronLeft, ChevronRight, MessageSquare } from 'lucide-react'
import type { Annotation, EpubProgressLocator, ReaderProgressLocator, ReaderProgressUpdate, ReaderSettings, ReaderTheme } from '../../types'
import { DEFAULT_READER_SETTINGS } from '../../types'
import AnnotationPanel, { HighlightToolbar } from '../AnnotationPanel'
import { isElectron, OPEN_EXTERNAL_LINKS_KEY } from '../../utils'
import type { TocItem } from '../TocPanel'
import { getInitialEpubNavigationTarget } from './epubRestore'

export interface FoliateView extends HTMLElement {
  open: (book: Blob | File) => Promise<void>
  next: () => Promise<void>
  prev: () => Promise<void>
  goTo: (target: string | number | { fraction: number }) => Promise<void>
  getCFI?: (index: number, range: Range) => string
  getContents?: () => Array<{ doc?: Document }>
  currentIndex?: number
  renderer?: {
    setStyles?: (styles: string | [string, string]) => void
    setAttribute?: (name: string, value: string) => void
  }
  book?: {
    toc?: TocItem[]
  }
}

interface EpubReaderProps {
  filePath: string
  bookId: number
  format: 'epub' | 'mobi' | 'azw3'
  initialProgress?: number
  initialLocator?: ReaderProgressLocator
  onProgressUpdate?: (update: ReaderProgressUpdate) => void
  onTocLoad?: (toc: TocItem[]) => void
  onViewReady?: (view: FoliateView) => void
  theme: ReaderTheme
  readerSettings?: ReaderSettings
}

function withTimeout<T>(promise: Promise<T>, ms: number, stage: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`${stage} timed out after ${ms}ms`))
    }, ms)

    promise
      .then(value => {
        clearTimeout(timer)
        resolve(value)
      })
      .catch(err => {
        clearTimeout(timer)
        reject(err)
      })
  })
}

export interface SelectionInfo {
  text: string
  position: { x: number; y: number }
  cfi?: string
}

const MIME_TYPE_BY_FORMAT: Record<'epub' | 'mobi' | 'azw3', string> = {
  epub: 'application/epub+zip',
  mobi: 'application/x-mobipocket-ebook',
  azw3: 'application/vnd.amazon.mobi8-ebook',
}

function buildReaderCss(settings: ReaderSettings) {
  return `
    html, body {
      font-size: ${settings.fontSize}px !important;
      line-height: ${settings.lineHeight} !important;
      font-family: ${settings.fontFamily} !important;
    }
  `
}

function hasRenderableSectionContent(doc?: Document) {
  if (!doc) return false
  const text = doc.body?.textContent?.replace(/\s+/g, '') ?? ''
  if (text.length > 20) return true
  return doc.querySelector('img, svg, canvas, video, audio') != null
}

export default function EpubReader({
  filePath,
  bookId,
  format,
  initialProgress = 0,
  initialLocator,
  onProgressUpdate,
  onTocLoad,
  onViewReady,
  theme,
  readerSettings = DEFAULT_READER_SETTINGS
}: EpubReaderProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<FoliateView | null>(null)
  const progressCallbackRef = useRef<typeof onProgressUpdate>(onProgressUpdate)
  const tocLoadRef = useRef<typeof onTocLoad>(onTocLoad)
  const viewReadyRef = useRef<typeof onViewReady>(onViewReady)
  const initialProgressRef = useRef(initialProgress)
  const initialLocatorRef = useRef(initialLocator)
  const themeRef = useRef(theme)
  const readerSettingsRef = useRef(readerSettings)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentLabel, setCurrentLabel] = useState('')
  
  // Annotation state
  const [annotations, setAnnotations] = useState<Annotation[]>([])
  const [showAnnotations, setShowAnnotations] = useState(false)
  const [selection, setSelection] = useState<SelectionInfo | null>(null)
  const [canNavigate, setCanNavigate] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('Loading eBook...')

  const applyPageMode = useCallback((view: FoliateView, settings: ReaderSettings) => {
    if (!view.renderer?.setAttribute) return

    view.renderer.setAttribute('flow', settings.pageMode === 'scroll' ? 'scrolled' : 'paginated')
    view.renderer.setAttribute('max-column-count', settings.pageMode === 'single' ? '1' : '2')
  }, [])

  const applyReaderSettings = useCallback((view: FoliateView, settings: ReaderSettings) => {
    view.style.setProperty('--foliate-font-size', `${settings.fontSize}px`)
    view.style.setProperty('--foliate-line-height', `${settings.lineHeight}`)
    view.style.setProperty('--foliate-font-family', settings.fontFamily)

    view.renderer?.setStyles?.(buildReaderCss(settings))
  }, [])

  useEffect(() => {
    progressCallbackRef.current = onProgressUpdate
    tocLoadRef.current = onTocLoad
    viewReadyRef.current = onViewReady
  }, [onProgressUpdate, onTocLoad, onViewReady])

  useEffect(() => {
    initialProgressRef.current = initialProgress
    initialLocatorRef.current = initialLocator
    themeRef.current = theme
    readerSettingsRef.current = readerSettings
  }, [initialLocator, initialProgress, readerSettings, theme])

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
    const loadTimer = window.setTimeout(() => {
      void loadAnnotations()
    }, 0)

    return () => window.clearTimeout(loadTimer)
  }, [loadAnnotations])

  // Apply reader settings when they change
  useEffect(() => {
    if (!viewRef.current) return
    const view = viewRef.current

    applyReaderSettings(view, readerSettings)
  }, [applyReaderSettings, readerSettings])

  useEffect(() => {
    if (!viewRef.current) return
    applyPageMode(viewRef.current, readerSettings)
  }, [applyPageMode, readerSettings])

  useEffect(() => {
    let mounted = true
    const containerElement = containerRef.current
    const themeSnapshot = themeRef.current
    const readerSettingsSnapshot = readerSettingsRef.current
    const initialProgressSnapshot = initialProgressRef.current
    const initialLocatorSnapshot = initialLocatorRef.current

    const loadBook = async () => {
      try {
        setLoading(true)
        setLoadingMessage('Preparing reader...')
        setError(null)

        // Dynamically import foliate-js to ensure Web Component is registered
        await withTimeout(import('foliate-js/view.js'), 10000, 'Load foliate runtime')
        if (!mounted) return

        // Wait a tick for custom element to be defined
        await withTimeout(customElements.whenDefined('foliate-view'), 10000, 'Initialize foliate-view')

        if (!mounted || !containerElement) return

        // Create the foliate-view element programmatically
        const view = document.createElement('foliate-view') as FoliateView
        view.style.width = '100%'
        view.style.height = '100%'
        let shouldSkipEmptyOpeningSection = !initialLocatorSnapshot && initialProgressSnapshot <= 0
        let skippedOpeningSections = 0

        view.addEventListener('external-link', async (event) => {
          const customEvent = event as CustomEvent<{ href?: string }>
          const href = customEvent.detail?.href
          if (!href) return

          const raw = localStorage.getItem(OPEN_EXTERNAL_LINKS_KEY)
          const enabled = raw == null ? true : raw === 'true'
          event.preventDefault()
          if (!enabled) return

          try {
            if (isElectron()) {
              await window.ipcRenderer.invoke('open-external', href)
            } else {
              window.open(href, '_blank', 'noopener,noreferrer')
            }
          } catch (err) {
            console.error('Failed to open external link:', err)
          }
        })

        view.addEventListener('load', (event) => {
          requestAnimationFrame(() => {
            if (mounted) {
              applyReaderSettings(view, readerSettingsRef.current)
            }
          })
          if (!shouldSkipEmptyOpeningSection || skippedOpeningSections >= 5) return

          const customEvent = event as CustomEvent<{ doc?: Document }>
          if (hasRenderableSectionContent(customEvent.detail?.doc)) {
            shouldSkipEmptyOpeningSection = false
            return
          }

          skippedOpeningSections += 1
          window.setTimeout(() => {
            if (mounted) {
              void view.next()
            }
          }, 50)
        })

        containerElement.innerHTML = ''
        containerElement.appendChild(view)
        viewRef.current = view

        // Apply theme styles
        view.style.setProperty('--foliate-background', themeSnapshot.customBgImage ? `url(${themeSnapshot.customBgImage})` : themeSnapshot.bg)
        view.style.setProperty('--foliate-color', themeSnapshot.text)
        
        view.style.setProperty('--foliate-font-size', `${readerSettingsSnapshot.fontSize}px`)
        view.style.setProperty('--foliate-line-height', `${readerSettingsSnapshot.lineHeight}`)
        view.style.setProperty('--foliate-font-family', readerSettingsSnapshot.fontFamily)

        setLoadingMessage('Reading file...')
        // Read file and create File object (foliate-js needs the name property)
        const buffer = await withTimeout(
          window.ipcRenderer.invoke('read-file-buffer', filePath),
          15000,
          'Read ebook file'
        )
        const fileName = filePath.split(/[/\\]/).pop() || 'book.epub'
        // Convert buffer to ArrayBuffer properly
        const uint8Array = new Uint8Array(buffer)
        const primaryFile = new File([uint8Array], fileName, { type: MIME_TYPE_BY_FORMAT[format] })
        const fallbackFile = new File([uint8Array], fileName, { type: '' })

        setLoadingMessage('Parsing ebook...')
        try {
          await withTimeout(view.open(primaryFile), 20000, 'Open ebook')
        } catch (primaryErr) {
          // Some files fail with specific MIME hints; retry with generic File type.
          console.warn('Primary ebook open failed, retrying with generic file type:', primaryErr)
          await withTimeout(view.open(fallbackFile), 20000, 'Open ebook fallback')
        }
        if (!mounted) return
        applyPageMode(view, readerSettingsRef.current)

        // Restoring previous position should not fail the whole book loading flow.
        try {
          await view.goTo(getInitialEpubNavigationTarget(
            initialLocatorSnapshot,
            initialProgressSnapshot,
            readerSettingsRef.current.pageMode
          ))
        } catch (restoreErr) {
          console.warn('Failed to restore EPUB position, fallback to chapter start:', restoreErr)
        }

        // Extract TOC if available
        try {
          if (view.book?.toc) {
            tocLoadRef.current?.(view.book.toc)
          }
        } catch (tocErr) {
          console.warn('Failed to extract TOC:', tocErr)
        }

        // Expose view to parent component
        viewReadyRef.current?.(view)

        // Handle relocate events
        const handleRelocate = (e: Event) => {
          const customEvent = e as CustomEvent<{
            fraction?: number
            tocItem?: { label?: string }
            location?: { start?: { cfi?: string } }
          }>
          const { fraction, tocItem, location } = customEvent.detail
          if (progressCallbackRef.current && typeof fraction === 'number') {
            const locator: EpubProgressLocator = {
              kind: 'epub',
              fraction,
              cfi: location?.start?.cfi,
              chapterLabel: tocItem?.label,
            }
            progressCallbackRef.current({
              progress: fraction,
              locator,
              updatedAt: Date.now(),
            })
          }
          if (tocItem?.label) {
            setCurrentLabel(tocItem.label)
          }
        }

        view.addEventListener('relocate', handleRelocate)
        setCanNavigate(true)

      } catch (err) {
        console.error('Failed to load EPUB:', err)
        if (mounted) {
          const baseMessage = err instanceof Error ? err.message : 'Failed to load EPUB'
          if (format === 'azw3' || format === 'mobi') {
            setError(`${baseMessage}\n\n当前格式（.${format}）兼容性较弱，建议先转换为 .epub 后再导入。`)
          } else {
            setError(baseMessage)
          }
          setCanNavigate(false)
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    void loadBook()

    return () => {
      mounted = false
      setCanNavigate(false)
      if (containerElement) {
        containerElement.innerHTML = ''
      }
      viewRef.current = null
    }
  }, [applyPageMode, applyReaderSettings, filePath, format])

  useEffect(() => {
    if (!viewRef.current) return
    const view = viewRef.current
    view.style.setProperty('--foliate-background', theme.customBgImage ? `url(${theme.customBgImage})` : theme.bg)
    view.style.setProperty('--foliate-color', theme.text)
  }, [theme.bg, theme.customBgImage, theme.text])

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
    
    // Try to get CFI from foliate-view - getCFI requires (index, range) parameters
    // We'll try to get the current location from the view's lastLocation
    let cfi: string | undefined
    try {
      const view = viewRef.current
      if (view && typeof view.getCFI === 'function') {
        // Try to get current section index from the view
        const currentIndex = view.currentIndex ?? 0
        cfi = view.getCFI(currentIndex, range)
      }
    } catch (err) {
      console.warn('Failed to get CFI:', err)
    }

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
    if (!selection || !selection.cfi) return

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
    if (!selection || !selection.cfi) return

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

  const navigatePage = useCallback(async (direction: 'prev' | 'next') => {
    if (!canNavigate || isNavigating || loading || error) return
    const view = viewRef.current
    if (!view) return

    setIsNavigating(true)
    try {
      if (direction === 'prev') {
        await view.prev()
      } else {
        await view.next()
      }
    } catch (err) {
      // Prevent foliate internal navigation rejects from surfacing as unhandled rejections.
      console.warn(`Failed to navigate ${direction} page:`, err)
    } finally {
      setIsNavigating(false)
    }
  }, [canNavigate, error, isNavigating, loading])

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
          <div className="text-gray-600">{loadingMessage}</div>
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
            onClick={() => {
              void navigatePage('prev')
            }}
          >
            <ChevronLeft className="opacity-0 group-hover:opacity-50" />
          </div>
          <div 
            className="absolute right-0 top-0 bottom-0 w-16 z-10 cursor-pointer hover:bg-black/5 transition-colors flex items-center justify-end pr-2"
            style={{ right: showAnnotations ? '320px' : '0' }}
            onClick={() => {
              void navigatePage('next')
            }}
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
