import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { Plus, Book as BookIcon, Trash2, Search, X, ImageOff, Clock, Layers3, Sparkles } from 'lucide-react'
import type { Book } from '../types'
import { useNavigate } from 'react-router-dom'
import { buildImportPlan, getAllowedImportExtensions } from '../services/importService'
import { normalizeExtension } from '../domain/document'
import { safeGetItem, safeSetItem, WEB_LIBRARY_KEY } from '../utils'

export default function Library() {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [coverUrls, setCoverUrls] = useState<Record<number, string>>({})
  const [coverLoading, setCoverLoading] = useState<Record<number, boolean>>({})
  const [coverErrors, setCoverErrors] = useState<Record<number, boolean>>({})
  const coverUrlCacheRef = useRef<Record<number, string>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  // Check if we're running in Electron (has ipcRenderer)
  const isElectron = typeof window !== 'undefined' && window.ipcRenderer != null

  const loadBooks = useCallback(async () => {
    try {
      setLoading(true)
      let library: Book[] = []

      if (isElectron) {
        // Electron: get books from SQLite via IPC
        library = await window.ipcRenderer.invoke('get-library')
      } else {
        // Web: get books from localStorage
        library = safeGetItem<Book[]>(WEB_LIBRARY_KEY, [])
      }

      setBooks(library)
      const activeIds = new Set(library.map(b => b.id))
      Object.keys(coverUrlCacheRef.current).forEach((idStr) => {
        const id = Number(idStr)
        if (!activeIds.has(id)) {
          delete coverUrlCacheRef.current[id]
        }
      })

      // Initialize cover loading states
      const loadingStates: Record<number, boolean> = {}
      const cachedUrls: Record<number, string> = {}
      const pendingCoverBooks = library.filter(book => {
        if (!book.coverPath) return false
        const cached = coverUrlCacheRef.current[book.id]
        if (cached) {
          cachedUrls[book.id] = cached
          return false
        }
        loadingStates[book.id] = true
        return true
      })
      setCoverLoading(loadingStates)

      // Load uncached cover URLs in parallel
      const coverPromises = pendingCoverBooks.map(async (book: Book) => {
        if (book.coverPath) {
          try {
            if (isElectron) {
              const url = await window.ipcRenderer.invoke('get-cover-url', book.coverPath)
              return { id: book.id, url }
            } else {
              // Web books may have blob URLs as cover
              return { id: book.id, url: book.coverPath }
            }
          } catch {
            return { id: book.id, url: null, error: true }
          }
        }
        return null
      })

      const results = await Promise.all(coverPromises)
      const urls: Record<number, string> = { ...cachedUrls }
      const errors: Record<number, boolean> = {}

      results.forEach(result => {
        if (result) {
          if (result.url) {
            urls[result.id] = result.url
            coverUrlCacheRef.current[result.id] = result.url
          }
          if ('error' in result && result.error) errors[result.id] = true
        }
      })

      setCoverUrls(urls)
      setCoverErrors(errors)
      setCoverLoading({})
    } catch (err) {
      console.error('Failed to load library:', err)
    } finally {
      setLoading(false)
    }
  }, [isElectron])

  useEffect(() => {
    const loadTimer = window.setTimeout(() => {
      void loadBooks()
    }, 0)

    return () => window.clearTimeout(loadTimer)
  }, [loadBooks])

  // Filter books based on search query
  const filteredBooks = useMemo(() => {
    if (!searchQuery.trim()) return books
    const query = searchQuery.toLowerCase()
    return books.filter(book => 
      book.title.toLowerCase().includes(query) ||
      (book.author && book.author.toLowerCase().includes(query))
    )
  }, [books, searchQuery])

  const libraryStats = useMemo(() => {
    const inProgress = books.filter(book => book.progress > 0 && book.progress < 0.999).length
    const converted = books.filter(book => book.ingestStatus === 'converted').length
    return { total: books.length, inProgress, converted }
  }, [books])

  const handleImport = async () => {
    try {
      if (isElectron) {
        // Electron: use native file dialog
        const book = await window.ipcRenderer.invoke('open-file-dialog')
        if (book) {
          await loadBooks()
        }
      } else {
        // Web: use HTML5 File API
        fileInputRef.current?.click()
      }
    } catch (err) {
      console.error('Failed to import book:', err)
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      // For web, we read the file and store metadata in localStorage
      // The actual file reading is limited due to browser security
      const ext = normalizeExtension(file.name.split('.').pop() || '')

      const plan = buildImportPlan(ext)
      if (plan.capability === 'unsupported') {
        alert(`不支持的文件格式。支持的格式: ${getAllowedImportExtensions().join(', ')}`)
        return
      }

      if (plan.capability === 'convertible') {
        alert('Web 模式暂不支持自动转换该格式，请使用桌面版导入（将自动转为可阅读文本）。')
        return
      }

      // Create a web-compatible book entry
      const webBook: Book = {
        id: Date.now(),
        title: file.name.replace(/\.[^/.]+$/, ''),
        author: '',
        path: URL.createObjectURL(file),
        format: plan.targetFormat || 'txt',
        coverPath: undefined,
        progress: 0,
        documentKind: plan.documentKind,
        ingestStatus: plan.ingestStatus,
        sourceFormat: plan.sourceFormat,
        totalPages: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isWebBook: true // Mark as web book for special handling
      }

      // Store in localStorage
      const existingBooks = safeGetItem<Book[]>(WEB_LIBRARY_KEY, [])
      existingBooks.push(webBook)
      safeSetItem(WEB_LIBRARY_KEY, existingBooks)

      await loadBooks()
    } catch (err) {
      console.error('Failed to import book:', err)
      alert('导入书籍失败')
    }

    // Reset input
    e.target.value = ''
  }

  const handleDelete = async (e: React.MouseEvent, bookId: number) => {
    e.stopPropagation()
    if (confirm('确定要从书库中删除这本书吗？')) {
      try {
        if (isElectron) {
          const success = await window.ipcRenderer.invoke('delete-book', bookId)
          if (success) {
            await loadBooks()
          }
        } else {
          // Web: delete from localStorage
          const webBooks = safeGetItem<Book[]>(WEB_LIBRARY_KEY, [])
          const bookToDelete = webBooks.find((b: Book) => b.id === bookId)
          if (bookToDelete) {
            // Revoke the blob URL to free memory
            URL.revokeObjectURL(bookToDelete.path)
          }
          const updatedBooks = webBooks.filter((b: Book) => b.id !== bookId)
          safeSetItem(WEB_LIBRARY_KEY, updatedBooks)
          await loadBooks()
        }
        delete coverUrlCacheRef.current[bookId]
      } catch (err) {
        console.error('Failed to delete book:', err)
      }
    }
  }

  const handleOpenBook = (book: Book) => {
    navigate(`/reader/${book.id}`)
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-stone-500">
        正在整理书架...
      </div>
    )
  }

  return (
    <div className="min-h-full px-8 py-7">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex flex-col gap-5 border-b border-stone-200/80 pb-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-2xl">
            <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
              <Sparkles className="h-3.5 w-3.5 text-[#b47a35]" />
              Personal library
            </div>
            <h1 className="text-4xl font-semibold leading-tight text-slate-950">我的书库</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              管理本地书籍、转换文档，并从上次阅读的位置继续。
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex h-11 items-center gap-3 rounded-md border border-slate-200 bg-white px-4 text-sm text-slate-700 shadow-sm">
              <BookIcon className="h-4 w-4 text-[#b47a35]" />
              <span className="font-medium">{libraryStats.total}</span>
              <span className="text-slate-500">本藏书</span>
            </div>
            <div className="flex h-11 items-center gap-3 rounded-md border border-slate-200 bg-white px-4 text-sm text-slate-700 shadow-sm">
              <Clock className="h-4 w-4 text-[#637a68]" />
              <span className="font-medium">{libraryStats.inProgress}</span>
              <span className="text-slate-500">本在读</span>
            </div>
            {libraryStats.converted > 0 && (
              <div className="flex h-11 items-center gap-3 rounded-md border border-slate-200 bg-white px-4 text-sm text-slate-700 shadow-sm">
                <Layers3 className="h-4 w-4 text-[#8a6f93]" />
                <span className="font-medium">{libraryStats.converted}</span>
                <span className="text-slate-500">份已转换</span>
              </div>
            )}
          </div>
        </header>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative max-w-2xl flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="搜索标题或作者"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-11 w-full rounded-md border border-slate-200 bg-white pl-10 pr-10 text-sm text-slate-900 shadow-sm outline-none transition focus:border-[#637a68] focus:ring-4 focus:ring-[#637a68]/10"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                title="清除搜索"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Hidden file input for web import */}
            {!isElectron && (
              <input
                ref={fileInputRef}
                type="file"
                accept={getAllowedImportExtensions().map(ext => `.${ext}`).join(',')}
                onChange={handleFileSelect}
                className="hidden"
              />
            )}
            <button
              onClick={handleImport}
              className="inline-flex h-11 items-center gap-2 rounded-md bg-[#20332e] px-4 text-sm font-medium text-white shadow-sm transition hover:bg-[#2b433b] focus:outline-none focus:ring-4 focus:ring-[#20332e]/15"
            >
              <Plus className="w-4 h-4" />
              导入书籍
            </button>
          </div>
        </div>

        {/* Search Results Info */}
        {searchQuery && (
          <div className="text-sm text-slate-500">
            找到 {filteredBooks.length} 本匹配 “{searchQuery}” 的书籍
          </div>
        )}

        {filteredBooks.length === 0 ? (
          <div className="flex min-h-[420px] items-center justify-center rounded-md border border-dashed border-slate-300 bg-white/70 text-center">
            <div className="max-w-sm px-6">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-md bg-[#e4ebe6] text-[#637a68]">
                <BookIcon className="h-7 w-7" />
              </div>
              <h2 className="text-base font-semibold text-slate-800">
                {searchQuery ? '没有找到匹配的书籍' : '书架还空着'}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                {searchQuery ? '换一个关键词试试，或清除搜索查看完整书库。' : '导入 PDF、EPUB、Markdown 或 DOCX，开始建立自己的本地阅读库。'}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-6 gap-y-9 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6">
            {filteredBooks.map((book) => (
              <div
                key={book.id}
                onClick={() => handleOpenBook(book)}
                className="group min-w-0 cursor-pointer"
              >
                <div className="relative mb-3 aspect-[2/3] overflow-hidden rounded-md bg-[#ded7cb] shadow-[0_18px_38px_rgba(74,60,42,0.14),0_2px_5px_rgba(74,60,42,0.10)] transition duration-200 group-hover:-translate-y-1 group-hover:shadow-[0_22px_46px_rgba(74,60,42,0.18),0_3px_8px_rgba(74,60,42,0.12)]">
                  {coverLoading[book.id] ? (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#f5efe4] to-[#ded7cb]">
                      <div className="h-8 w-8 animate-spin rounded-full border-2 border-stone-300 border-t-[#9a6f3d]" />
                    </div>
                  ) : coverUrls[book.id] ? (
                    <img
                      src={coverUrls[book.id]}
                      alt={book.title}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.025]"
                      onError={() => {
                        delete coverUrlCacheRef.current[book.id]
                        setCoverErrors(prev => ({ ...prev, [book.id]: true }))
                        setCoverUrls(prev => {
                          const newUrls = { ...prev }
                          delete newUrls[book.id]
                          return newUrls
                        })
                      }}
                    />
                  ) : coverErrors[book.id] ? (
                    <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#f5efe4] to-[#ded7cb] text-stone-400">
                      <ImageOff className="mb-2 h-8 w-8 opacity-45" />
                      <span className="text-xs opacity-70">封面加载失败</span>
                    </div>
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#f7efe2] via-[#e7dece] to-[#cfc4b2] text-stone-600">
                      <BookIcon className="mb-3 h-12 w-12 opacity-25" />
                      <span className="font-serif text-2xl font-semibold opacity-40">
                        {book.format.toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-black/18 via-black/5 to-transparent" />
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/35 to-transparent opacity-0 transition group-hover:opacity-100" />

                  {/* Format badge */}
                  <div className="absolute right-2 top-2 rounded bg-black/55 px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-white backdrop-blur-sm">
                    {book.format}
                  </div>

                  {/* Kind badge */}
                  <div className="absolute left-2 top-2 rounded bg-[#fffaf2]/90 px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-stone-700 backdrop-blur-sm">
                    {book.documentKind === 'paged' ? 'Paged' : 'Flow'}
                  </div>

                  {/* Converted badge */}
                  {book.ingestStatus === 'converted' && (
                    <div className="absolute left-2 top-9 rounded bg-[#a56f2f]/90 px-2 py-1 text-[10px] font-medium text-white backdrop-blur-sm">
                      已转换
                    </div>
                  )}

                  {/* Delete button */}
                  <button
                    onClick={(e) => handleDelete(e, book.id)}
                    className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-md bg-stone-950/80 text-white opacity-0 backdrop-blur-sm transition hover:bg-red-700 group-hover:opacity-100"
                    title="删除书籍"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>

                  {/* Progress Bar */}
                  {book.progress > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/25">
                      <div
                        className="h-full bg-[#6e8b73] transition-all duration-300"
                        style={{ width: `${Math.min(book.progress * 100, 100)}%` }}
                      />
                    </div>
                  )}
                </div>

                <h3 className="truncate text-sm font-semibold text-slate-900" title={book.title}>
                  {book.title}
                </h3>
                <p className="truncate text-xs text-slate-500">
                  {book.author || '未知作者'}
                </p>

                {/* Progress Text */}
                {book.progress > 0 && (
                  <p className="mt-1 text-xs font-medium text-[#637a68]">
                    已阅读 {Math.round(book.progress * 100)}%
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
