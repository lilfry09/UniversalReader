import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Settings, Type, Image, BookOpen, Minus, Plus, MessageSquare, List } from 'lucide-react'
import type { Book, ThemeMode, ReaderSettings, PageMode, ReaderTheme, ReaderProgressUpdate } from '../types'
import { THEMES, DEFAULT_READER_SETTINGS, FONT_FAMILIES } from '../types'
import { isElectron, isLightTheme, WEB_LIBRARY_KEY, READER_THEME_KEY, READER_SETTINGS_KEY, READER_CUSTOM_BG_KEY } from '../utils'
import { safeGetItem, safeSetItem } from '../utils/storage'
import { getReaderEngine } from '../domain/document'
import type { FoliateView } from '../components/readers/EpubReader'
import type { TocItem } from '../components/TocPanel'

const PdfReader = lazy(() => import('../components/readers/PdfReader'))
const MarkdownReader = lazy(() => import('../components/readers/MarkdownReader'))
const EpubReader = lazy(() => import('../components/readers/EpubReader'))
const QAChat = lazy(() => import('../components/QAChat'))
const TocPanel = lazy(() => import('../components/TocPanel'))
const PROGRESS_FLUSH_INTERVAL_MS = 1200
const PROGRESS_SKIP_DELTA = 0.001

interface PendingProgressUpdate {
  bookId: number
  isWebBook: boolean
  update: ReaderProgressUpdate
}

function readThemeMode() {
  const mode = safeGetItem<ThemeMode>(READER_THEME_KEY, 'light')
  return mode in THEMES ? mode : 'light'
}

function readReaderSettings() {
  const saved = safeGetItem<Partial<ReaderSettings>>(READER_SETTINGS_KEY, {})
  return {
    ...DEFAULT_READER_SETTINGS,
    ...saved,
    pageMode: saved.pageMode === 'scroll' || saved.pageMode === 'paginated' || saved.pageMode === 'single'
      ? saved.pageMode
      : DEFAULT_READER_SETTINGS.pageMode,
  }
}

function ReaderFallback({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center h-full text-gray-500">
      {label}
    </div>
  )
}

export default function Reader() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isDesktop = isElectron()
  const [book, setBook] = useState<Book | null>(null)
  const [loading, setLoading] = useState(true)
  const [fileExists, setFileExists] = useState<boolean | null>(null)
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    return readThemeMode()
  })
  const [showSettingsMenu, setShowSettingsMenu] = useState(false)
  const [customBgImage, setCustomBgImage] = useState<string | null>(() => {
    return safeGetItem<string | null>(READER_CUSTOM_BG_KEY, null)
  })
  const [customBgUrl, setCustomBgUrl] = useState<string | null>(null)
  const [showQA, setShowQA] = useState(false)
  const [showToc, setShowToc] = useState(false)
  const [tocData, setTocData] = useState<TocItem[]>([])
  const [currentTocHref, setCurrentTocHref] = useState<string>()
  const epubViewRef = useRef<FoliateView | null>(null)
  const pendingProgressRef = useRef<PendingProgressUpdate | null>(null)
  const progressFlushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastPersistedProgressRef = useRef<{
    bookId: number
    progress: number
    updatedAt: number
  } | null>(null)

  // Reader settings
  const [readerSettings, setReaderSettings] = useState<ReaderSettings>(() => {
    return readReaderSettings()
  })

  // Load custom background image URL
  useEffect(() => {
    const loadCustomBg = async () => {
      if (!customBgImage || !isDesktop) {
        setCustomBgUrl(null)
        return
      }

      try {
        const url = await window.ipcRenderer.invoke('get-background-image-url', customBgImage)
        setCustomBgUrl(url)
      } catch (err) {
        console.error('Error loading background image URL:', err)
        setCustomBgUrl(null)
      }
    }
    void loadCustomBg()
  }, [customBgImage, isDesktop])

  // Save settings to localStorage
  useEffect(() => {
    safeSetItem(READER_SETTINGS_KEY, readerSettings)
  }, [readerSettings])

  useEffect(() => {
    if (customBgImage) {
      safeSetItem(READER_CUSTOM_BG_KEY, customBgImage)
    } else {
      localStorage.removeItem(READER_CUSTOM_BG_KEY)
    }
  }, [customBgImage])

  const currentTheme: ReaderTheme = useMemo(() => {
    const base = THEMES[themeMode]
    if (themeMode === 'custom' && customBgUrl) {
      return { ...base, customBgImage: customBgUrl }
    }
    return base
  }, [themeMode, customBgUrl])

  const hoverBg = isLightTheme(themeMode) ? 'hover:bg-black/10' : 'hover:bg-white/10'
  const dividerColor = isLightTheme(themeMode) ? '#e5e7eb' : 'rgba(255,255,255,0.12)'
  const toolbarButtonClass = `flex h-9 w-9 items-center justify-center rounded-md transition-colors ${hoverBg}`
  const readerEngine = getReaderEngine(book?.format ?? 'txt')
  const currentBookId = book?.id

  useEffect(() => {
    const loadBook = async () => {
      try {
        let library: Book[] = []
        if (isDesktop) {
          library = await window.ipcRenderer.invoke('get-library')
        } else {
          // Web: get books from localStorage
          library = safeGetItem<Book[]>(WEB_LIBRARY_KEY, [])
        }

        const found = library.find(b => b.id === Number(id))
        if (found) {
          setBook(found)
        } else {
          console.error('Book not found')
          navigate('/')
        }
      } catch (err) {
        console.error('Error loading book:', err)
      } finally {
        setLoading(false)
      }
    }
    loadBook()
  }, [id, navigate, isDesktop])

  useEffect(() => {
    const check = async () => {
      if (!book) return
      try {
        // For web books (blob URLs), they always exist
        if (book.isWebBook) {
          setFileExists(true)
          return
        }

        if (isDesktop) {
          const ok = await window.ipcRenderer.invoke('file-exists', book.path)
          setFileExists(ok)
        } else {
          // Web mode - check if blob URL is valid
          setFileExists(true)
        }
      } catch (err) {
        console.error('Error checking file existence:', err)
        setFileExists(true)
      }
    }
    void check()
  }, [book, isDesktop])

  const clearProgressTimer = useCallback(() => {
    if (!progressFlushTimerRef.current) return
    clearTimeout(progressFlushTimerRef.current)
    progressFlushTimerRef.current = null
  }, [])

  const persistProgressUpdate = useCallback((pending: PendingProgressUpdate) => {
    const progress = pending.update.progress
    const progressLocator = pending.update.locator
    const progressUpdatedAt = pending.update.updatedAt ?? Date.now()

    // For web books, save to localStorage
    if (pending.isWebBook) {
      const webBooks = safeGetItem<Book[]>(WEB_LIBRARY_KEY, [])
      const updatedBooks = webBooks.map((b: Book) =>
        b.id === pending.bookId
          ? { ...b, progress, progressLocator, progressUpdatedAt, updatedAt: new Date().toISOString() }
          : b
      )
      safeSetItem(WEB_LIBRARY_KEY, updatedBooks)
    } else if (isDesktop) {
      // Electron mode
      window.ipcRenderer
        .invoke('update-progress', pending.bookId, progress, progressLocator, progressUpdatedAt)
        .catch(err => {
          console.error('Failed to persist reader progress:', err)
        })
    }

    lastPersistedProgressRef.current = {
      bookId: pending.bookId,
      progress,
      updatedAt: progressUpdatedAt,
    }
  }, [isDesktop])

  const flushPendingProgress = useCallback(() => {
    clearProgressTimer()
    const pending = pendingProgressRef.current
    if (!pending) return
    pendingProgressRef.current = null
    persistProgressUpdate(pending)
  }, [clearProgressTimer, persistProgressUpdate])

  useEffect(() => {
    return () => {
      flushPendingProgress()
    }
  }, [flushPendingProgress])

  useEffect(() => {
    if (currentBookId == null) return
    flushPendingProgress()
  }, [currentBookId, flushPendingProgress])

  const handleProgressUpdate = useCallback((update: ReaderProgressUpdate) => {
    if (!book) return

    const normalizedUpdate: ReaderProgressUpdate = {
      ...update,
      updatedAt: update.updatedAt ?? Date.now(),
    }

    const lastPersisted = lastPersistedProgressRef.current
    const isTinyUpdate = lastPersisted != null
      && lastPersisted.bookId === book.id
      && Math.abs(normalizedUpdate.progress - lastPersisted.progress) < PROGRESS_SKIP_DELTA
      && (normalizedUpdate.updatedAt ?? 0) - lastPersisted.updatedAt < PROGRESS_FLUSH_INTERVAL_MS
    if (isTinyUpdate) {
      return
    }

    const shouldFlushImmediately = normalizedUpdate.progress <= 0 || normalizedUpdate.progress >= 0.999
    const pendingProgress = pendingProgressRef.current
    const isTinyQueuedUpdate = pendingProgress != null
      && !shouldFlushImmediately
      && pendingProgress.bookId === book.id
      && Math.abs(normalizedUpdate.progress - pendingProgress.update.progress) < PROGRESS_SKIP_DELTA
      && (normalizedUpdate.updatedAt ?? 0) - (pendingProgress.update.updatedAt ?? 0) < PROGRESS_FLUSH_INTERVAL_MS
    if (isTinyQueuedUpdate) {
      pendingProgressRef.current = {
        ...pendingProgress,
        update: normalizedUpdate,
      }

      if (!progressFlushTimerRef.current) {
        progressFlushTimerRef.current = setTimeout(() => {
          flushPendingProgress()
        }, PROGRESS_FLUSH_INTERVAL_MS)
      }
      return
    }

    setBook(prev => prev
      ? {
          ...prev,
          progress: normalizedUpdate.progress,
          progressLocator: normalizedUpdate.locator,
          progressUpdatedAt: normalizedUpdate.updatedAt,
        }
      : prev
    )

    pendingProgressRef.current = {
      bookId: book.id,
      isWebBook: !!book.isWebBook,
      update: normalizedUpdate,
    }

    if (shouldFlushImmediately) {
      flushPendingProgress()
      return
    }

    if (!progressFlushTimerRef.current) {
      progressFlushTimerRef.current = setTimeout(() => {
        flushPendingProgress()
      }, PROGRESS_FLUSH_INTERVAL_MS)
    }
  }, [book, flushPendingProgress])

  const handleThemeChange = (mode: ThemeMode) => {
    setThemeMode(mode)
    safeSetItem(READER_THEME_KEY, mode)
  }

  const handleFontSizeChange = (delta: number) => {
    setReaderSettings(prev => ({
      ...prev,
      fontSize: Math.min(Math.max(12, prev.fontSize + delta), 32)
    }))
  }

  const handleLineHeightChange = (delta: number) => {
    setReaderSettings(prev => ({
      ...prev,
      lineHeight: Math.min(Math.max(1.2, prev.lineHeight + delta), 2.5)
    }))
  }

  const handlePageModeChange = (mode: PageMode) => {
    setReaderSettings(prev => ({ ...prev, pageMode: mode }))
  }

  const handleFontFamilyChange = (fontFamily: string) => {
    setReaderSettings(prev => ({ ...prev, fontFamily }))
  }

  const handleSelectBackgroundImage = async () => {
    if (!isDesktop) return
    const imagePath = await window.ipcRenderer.invoke('select-background-image')
    if (imagePath) {
      setCustomBgImage(imagePath)
      setThemeMode('custom')
      safeSetItem(READER_THEME_KEY, 'custom')
    }
  }

  const handleClearBackgroundImage = () => {
    setCustomBgImage(null)
    if (themeMode === 'custom') {
      setThemeMode('light')
      safeSetItem(READER_THEME_KEY, 'light')
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-slate-500">
        正在打开书籍...
      </div>
    )
  }
  if (!book) return <div className="p-8 text-sm text-slate-500">Book not found</div>
  if (fileExists === false) {
    return (
      <div className="h-full flex flex-col">
        <div
          className="flex h-14 shrink-0 items-center gap-3 border-b px-4"
          style={{ backgroundColor: currentTheme.ui, color: currentTheme.text, borderColor: dividerColor }}
        >
          <button 
            onClick={() => navigate('/')}
            className={toolbarButtonClass}
            style={{ color: currentTheme.text }}
            title="返回书库"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-sm font-semibold" style={{ color: currentTheme.text }}>
              {book.title}
            </h1>
            <div className="text-xs opacity-60">{book.format.toUpperCase()}</div>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-xl rounded-md border p-6 shadow-sm" style={{ backgroundColor: currentTheme.ui, borderColor: dividerColor, color: currentTheme.text }}>
            <h2 className="text-lg font-semibold mb-2">文件找不到</h2>
            <p className="text-sm mb-4 break-all" style={{ opacity: 0.85 }}>
              {book.path}
            </p>
            <div className="flex gap-3">
              <button
                onClick={async () => {
                  if (!isDesktop) return
                  const imported = await window.ipcRenderer.invoke('open-file-dialog')
                  if (imported) navigate(`/reader/${imported.id}`)
                }}
                className="rounded-md bg-[#20332e] px-4 py-2 text-white transition hover:bg-[#2b433b]"
              >
                重新导入
              </button>
              <button
                onClick={async () => {
                  if (!isDesktop) return
                  await window.ipcRenderer.invoke('delete-book', book.id)
                  navigate('/')
                }}
                className="rounded-md bg-red-600 px-4 py-2 text-white transition hover:bg-red-700"
              >
                从书库移除
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div
        className="relative z-50 flex h-16 shrink-0 items-center gap-3 border-b px-4 shadow-sm"
        style={{ backgroundColor: currentTheme.ui, color: currentTheme.text, borderColor: dividerColor }}
      >
        <button 
          onClick={() => navigate('/')}
          className={toolbarButtonClass}
          style={{ color: currentTheme.text }}
          title="返回书库"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-sm font-semibold" style={{ color: currentTheme.text }}>
            {book.title}
          </h1>
          <div className="mt-0.5 flex items-center gap-2 text-xs opacity-65">
            <span>{book.format.toUpperCase()}</span>
            {book.progress > 0 && (
              <>
                <span>·</span>
                <span>已阅读 {Math.round(book.progress * 100)}%</span>
              </>
            )}
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowToc(!showToc)}
            className={toolbarButtonClass}
            style={{
              color: showToc ? '#637a68' : currentTheme.text,
              backgroundColor: showToc ? 'rgba(99,122,104,0.14)' : undefined,
            }}
            title="目录"
          >
            <List className="h-5 w-5" />
          </button>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowQA(!showQA)}
            className={toolbarButtonClass}
            style={{
              color: showQA ? '#b47a35' : currentTheme.text,
              backgroundColor: showQA ? 'rgba(180,122,53,0.14)' : undefined,
            }}
            title="AI 问答"
          >
            <MessageSquare className="h-5 w-5" />
          </button>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowSettingsMenu(!showSettingsMenu)}
            className={toolbarButtonClass}
            style={{ color: currentTheme.text }}
            title="阅读设置"
          >
            <Settings className="h-5 w-5" />
          </button>

          {showSettingsMenu && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowSettingsMenu(false)}
              />
              <div
                className="absolute right-0 z-20 mt-2 max-h-[80vh] w-80 overflow-y-auto rounded-md border py-2 shadow-xl"
                style={{ backgroundColor: currentTheme.ui, color: currentTheme.text, borderColor: dividerColor }}
              >
                {/* Theme Section */}
                <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider flex items-center gap-2" style={{ opacity: 0.7 }}>
                  <BookOpen className="w-3.5 h-3.5" />
                  主题
                </div>
                <div className="grid grid-cols-3 gap-2 px-3 py-2">
                  {(Object.keys(THEMES) as ThemeMode[]).filter(m => m !== 'custom').map((mode) => (
                    <button
                      key={mode}
                      onClick={() => handleThemeChange(mode)}
                      className={`
                        flex flex-col items-center gap-1 p-2 rounded-md border text-xs transition-all
                        ${themeMode === mode 
                          ? 'border-[#637a68] bg-[#637a68]/15' 
                          : 'hover:border-gray-300'}
                      `}
                      style={{
                        borderColor: themeMode === mode ? '#637a68' : dividerColor,
                        backgroundColor: themeMode === mode ? 'rgba(99,122,104,0.14)' : 'transparent',
                        color: themeMode === mode ? '#637a68' : currentTheme.text,
                      }}
                    >
                      <div 
                        className="w-full h-6 rounded shadow-sm border border-black/5" 
                        style={{ backgroundColor: THEMES[mode].bg }}
                      />
                      <span className="capitalize text-[10px]">{mode === 'light' ? '明亮' : mode === 'dark' ? '暗黑' : mode === 'sepia' ? '护眼' : '灰色'}</span>
                    </button>
                  ))}
                </div>

                <div className="h-px mx-3 my-2" style={{ backgroundColor: dividerColor }} />

                {/* Font Size Section */}
                <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider flex items-center gap-2" style={{ opacity: 0.7 }}>
                  <Type className="w-3.5 h-3.5" />
                  字体设置
                </div>
                <div className="px-3 py-2 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">字体大小</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleFontSizeChange(-1)}
                        className={`p-1 rounded ${hoverBg}`}
                        style={{ color: currentTheme.text }}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-10 text-center text-sm font-mono">{readerSettings.fontSize}px</span>
                      <button
                        onClick={() => handleFontSizeChange(1)}
                        className={`p-1 rounded ${hoverBg}`}
                        style={{ color: currentTheme.text }}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm">行高</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleLineHeightChange(-0.1)}
                        className={`p-1 rounded ${hoverBg}`}
                        style={{ color: currentTheme.text }}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-10 text-center text-sm font-mono">{readerSettings.lineHeight.toFixed(1)}</span>
                      <button
                        onClick={() => handleLineHeightChange(0.1)}
                        className={`p-1 rounded ${hoverBg}`}
                        style={{ color: currentTheme.text }}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="text-sm block mb-2">字体</span>
                    <select
                      value={readerSettings.fontFamily}
                      onChange={(e) => handleFontFamilyChange(e.target.value)}
                      className="w-full px-2 py-1.5 rounded border text-sm"
                      style={{ 
                        backgroundColor: currentTheme.bg, 
                        color: currentTheme.text, 
                        borderColor: dividerColor 
                      }}
                    >
                      {FONT_FAMILIES.map(f => (
                        <option key={f.value} value={f.value}>{f.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="h-px mx-3 my-2" style={{ backgroundColor: dividerColor }} />

                {/* Page Mode Section */}
                <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider" style={{ opacity: 0.7 }}>
                  翻页模式
                </div>
                <div className="px-3 py-2 flex gap-2">
                  {([
                    { mode: 'scroll' as PageMode, label: '滚动' },
                    { mode: 'paginated' as PageMode, label: '分页' },
                    { mode: 'single' as PageMode, label: '单页' },
                  ]).map(({ mode, label }) => (
                    <button
                      key={mode}
                      onClick={() => handlePageModeChange(mode)}
                      className={`
                        flex-1 py-1.5 rounded-md border text-xs transition-all
                        ${readerSettings.pageMode === mode 
                          ? 'border-[#637a68] bg-[#637a68]/15 text-[#637a68]' 
                          : 'hover:border-gray-300'}
                      `}
                      style={{
                        borderColor: readerSettings.pageMode === mode ? '#637a68' : dividerColor,
                        backgroundColor: readerSettings.pageMode === mode ? 'rgba(99,122,104,0.14)' : 'transparent',
                        color: readerSettings.pageMode === mode ? '#637a68' : currentTheme.text,
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <div className="h-px mx-3 my-2" style={{ backgroundColor: dividerColor }} />

                {/* Background Image Section */}
                <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider flex items-center gap-2" style={{ opacity: 0.7 }}>
                  <Image className="w-3.5 h-3.5" />
                  自定义背景
                </div>
                <div className="px-3 py-2">
                  {customBgUrl ? (
                    <div className="space-y-2">
                      <div 
                        className="w-full h-20 rounded-md border bg-cover bg-center"
                        style={{ 
                          backgroundImage: `url(${customBgUrl})`,
                          borderColor: dividerColor
                        }}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleSelectBackgroundImage}
                          className="flex-1 py-1.5 text-xs rounded border hover:bg-black/5"
                          style={{ borderColor: dividerColor, color: currentTheme.text }}
                        >
                          更换图片
                        </button>
                        <button
                          onClick={handleClearBackgroundImage}
                          className="flex-1 py-1.5 text-xs rounded border text-red-500 hover:bg-red-50"
                          style={{ borderColor: dividerColor }}
                        >
                          移除背景
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={handleSelectBackgroundImage}
                      className="w-full py-2 text-sm rounded border border-dashed hover:bg-black/5 flex items-center justify-center gap-2"
                      style={{ borderColor: dividerColor, color: currentTheme.text }}
                    >
                      <Image className="w-4 h-4" />
                      选择本地图片
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className={`flex-1 overflow-hidden relative flex`}>
        {/* TOC Panel */}
        {showToc && (
          <div className="w-64 h-full border-r flex-shrink-0" style={{ borderColor: dividerColor }}>
            <Suspense fallback={<ReaderFallback label="正在加载目录..." />}>
              <TocPanel
                toc={tocData}
                currentHref={currentTocHref}
                onNavigate={(href) => {
                  // Navigate in EPUB reader
                  if (epubViewRef.current && typeof epubViewRef.current.goTo === 'function') {
                    setCurrentTocHref(href)
                    epubViewRef.current.goTo(href).catch((e: Error) => console.error('TOC navigation error:', e))
                  }
                }}
                onClose={() => setShowToc(false)}
                theme={currentTheme}
              />
            </Suspense>
          </div>
        )}

        {/* Reader */}
        <div className="flex-1 h-full overflow-hidden">
          <Suspense fallback={<ReaderFallback label="正在加载阅读器..." />}>
            {readerEngine === 'pdf' && (
              <PdfReader
                filePath={book.path}
                bookId={book.id}
                initialProgress={book.progress}
                initialLocator={book.progressLocator}
                onProgressUpdate={handleProgressUpdate}
                theme={currentTheme}
                readerSettings={readerSettings}
              />
            )}

            {readerEngine === 'markdown' && (
              <MarkdownReader
                filePath={book.path}
                format={book.format === 'md' ? 'md' : 'txt'}
                theme={currentTheme}
                readerSettings={readerSettings}
              />
            )}

            {readerEngine === 'epub' && (
              <EpubReader
                filePath={book.path}
                bookId={book.id}
                format={book.format === 'epub' ? 'epub' : book.format === 'mobi' ? 'mobi' : 'azw3'}
                initialProgress={book.progress}
                initialLocator={book.progressLocator}
                onProgressUpdate={handleProgressUpdate}
                onTocLoad={(toc) => setTocData(toc)}
                onViewReady={(view) => {
                  epubViewRef.current = view
                }}
                theme={currentTheme}
                readerSettings={readerSettings}
              />
            )}

            {readerEngine === 'unsupported' && (
              <div className="flex items-center justify-center h-full text-gray-500">
                Format .{book.format} viewer not implemented yet
              </div>
            )}
          </Suspense>
        </div>

        {/* QA Panel */}
        {showQA && (
          <div className="w-96 h-full border-l flex-shrink-0" style={{ borderColor: dividerColor }}>
            <Suspense fallback={<ReaderFallback label="正在加载问答助手..." />}>
              <QAChat
                bookPath={book.path}
                bookFormat={book.format}
                bookTitle={book.title}
                isOpen={showQA}
                onToggle={() => setShowQA(false)}
              />
            </Suspense>
          </div>
        )}
      </div>
    </div>
  )
}
