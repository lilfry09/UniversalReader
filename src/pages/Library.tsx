import { useState, useEffect, useCallback, useMemo } from 'react'
import { Plus, Book as BookIcon, Trash2, Search, X, ImageOff } from 'lucide-react'
import type { Book } from '../types'
import { useNavigate } from 'react-router-dom'

export default function Library() {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [coverUrls, setCoverUrls] = useState<Record<number, string>>({})
  const [coverLoading, setCoverLoading] = useState<Record<number, boolean>>({})
  const [coverErrors, setCoverErrors] = useState<Record<number, boolean>>({})
  const navigate = useNavigate()

  const loadBooks = useCallback(async () => {
    try {
      setLoading(true)
      const library = await window.ipcRenderer.invoke('get-library')
      setBooks(library)
      
      // Initialize cover loading states
      const loadingStates: Record<number, boolean> = {}
      library.forEach((book: Book) => {
        if (book.coverPath) loadingStates[book.id] = true
      })
      setCoverLoading(loadingStates)
      
      // Load cover URLs in parallel
      const coverPromises = library.map(async (book: Book) => {
        if (book.coverPath) {
          try {
            const url = await window.ipcRenderer.invoke('get-cover-url', book.coverPath)
            return { id: book.id, url }
          } catch {
            return { id: book.id, url: null, error: true }
          }
        }
        return null
      })
      
      const results = await Promise.all(coverPromises)
      const urls: Record<number, string> = {}
      const errors: Record<number, boolean> = {}
      
      results.forEach(result => {
        if (result) {
          if (result.url) urls[result.id] = result.url
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
  }, [])

  useEffect(() => {
    loadBooks()
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

  const handleImport = async () => {
    try {
      const book = await window.ipcRenderer.invoke('open-file-dialog')
      if (book) {
        await loadBooks()
      }
    } catch (err) {
      console.error('Failed to import book:', err)
    }
  }

  const handleDelete = async (e: React.MouseEvent, bookId: number) => {
    e.stopPropagation()
    if (confirm('确定要从书库中删除这本书吗？')) {
      try {
        const success = await window.ipcRenderer.invoke('delete-book', bookId)
        if (success) {
          await loadBooks()
        }
      } catch (err) {
        console.error('Failed to delete book:', err)
      }
    }
  }

  const handleOpenBook = (book: Book) => {
    navigate(`/reader/${book.id}`)
  }

  if (loading) {
    return <div className="p-8 text-gray-500">正在加载书库...</div>
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">我的书库</h1>
        <button
          onClick={handleImport}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          导入书籍
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="按标题或作者搜索..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
            title="清除搜索"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>

      {/* Search Results Info */}
      {searchQuery && (
        <div className="mb-4 text-sm text-gray-500">
          找到 {filteredBooks.length} 本匹配 "{searchQuery}" 的书籍
        </div>
      )}

      {filteredBooks.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <BookIcon className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p>{searchQuery ? '没有找到匹配的书籍。' : '书库是空的，导入一本书开始阅读吧！'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredBooks.map((book) => (
            <div
              key={book.id}
              onClick={() => handleOpenBook(book)}
              className="group cursor-pointer"
            >
              <div className="aspect-[2/3] bg-gray-200 rounded-lg shadow-sm mb-3 overflow-hidden group-hover:shadow-md transition-shadow relative">
                {coverLoading[book.id] ? (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse">
                    <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
                  </div>
                ) : coverUrls[book.id] ? (
                  <img
                    src={coverUrls[book.id]}
                    alt={book.title}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    onError={() => {
                      setCoverErrors(prev => ({ ...prev, [book.id]: true }))
                      setCoverUrls(prev => {
                        const newUrls = { ...prev }
                        delete newUrls[book.id]
                        return newUrls
                      })
                    }}
                  />
                ) : coverErrors[book.id] ? (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-gray-400">
                    <ImageOff className="w-8 h-8 mb-2 opacity-40" />
                    <span className="text-xs opacity-50">封面加载失败</span>
                  </div>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-gray-400">
                    <BookIcon className="w-12 h-12 mb-2 opacity-20" />
                    <span className="text-2xl font-serif font-bold opacity-30">
                      {book.format.toUpperCase()}
                    </span>
                  </div>
                )}
                
                {/* Format badge */}
                <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 text-white text-xs rounded uppercase backdrop-blur-sm">
                  {book.format}
                </div>
                
                {/* Delete button */}
                <button
                  onClick={(e) => handleDelete(e, book.id)}
                  className="absolute bottom-2 right-2 p-2 bg-red-600/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                  title="删除书籍"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                {/* Progress Bar */}
                {book.progress > 0 && (
                  <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/20">
                    <div 
                      className="h-full bg-blue-500 transition-all duration-300"
                      style={{ width: `${Math.min(book.progress * 100, 100)}%` }}
                    />
                  </div>
                )}
              </div>
              
              <h3 className="font-medium text-gray-900 truncate" title={book.title}>
                {book.title}
              </h3>
              <p className="text-sm text-gray-500 truncate">
                {book.author || '未知作者'}
              </p>
              
              {/* Progress Text */}
              {book.progress > 0 && (
                <p className="text-xs text-blue-600 mt-1">
                  已阅读 {Math.round(book.progress * 100)}%
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
