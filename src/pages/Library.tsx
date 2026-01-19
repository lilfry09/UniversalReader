import { useState, useEffect } from 'react'
import { Plus, Book as BookIcon, Trash2 } from 'lucide-react'
import type { Book } from '../types'
import { useNavigate } from 'react-router-dom'

export default function Library() {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const loadBooks = async () => {
    try {
      setLoading(true)
      const library = await window.ipcRenderer.invoke('get-library')
      setBooks(library)
    } catch (err) {
      console.error('Failed to load library:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBooks()
  }, [])

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
    e.stopPropagation() // Prevent opening the book
    if (confirm('Are you sure you want to delete this book from your library?')) {
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
    return <div className="p-8 text-gray-500">Loading library...</div>
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">My Library</h1>
        <button
          onClick={handleImport}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Import Book
        </button>
      </div>

      {books.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <BookIcon className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p>No books yet. Import one to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {books.map((book) => (
            <div
              key={book.id}
              onClick={() => handleOpenBook(book)}
              className="group cursor-pointer"
            >
              <div className="aspect-[2/3] bg-gray-200 rounded-lg shadow-sm mb-3 overflow-hidden group-hover:shadow-md transition-shadow relative">
                {book.coverPath ? (
                  <img
                    src={book.coverPath}
                    alt={book.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                    <span className="text-4xl font-serif font-bold opacity-20">
                      {book.format.toUpperCase()}
                    </span>
                  </div>
                )}
                {/* Format badge */}
                <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 text-white text-xs rounded uppercase backdrop-blur-sm">
                  {book.format}
                </div>
                
                {/* Delete button (hidden by default, shown on hover) */}
                <button
                  onClick={(e) => handleDelete(e, book.id)}
                  className="absolute bottom-2 right-2 p-2 bg-red-600/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                  title="Delete book"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <h3 className="font-medium text-gray-900 truncate" title={book.title}>
                {book.title}
              </h3>
              <p className="text-sm text-gray-500 truncate">
                {book.author || 'Unknown Author'}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
