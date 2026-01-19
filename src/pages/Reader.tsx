import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Palette } from 'lucide-react'
import { Book, THEMES, ThemeMode } from '../types'
import PdfReader from '../components/readers/PdfReader'
import MarkdownReader from '../components/readers/MarkdownReader'
import EpubReader from '../components/readers/EpubReader'

export default function Reader() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [book, setBook] = useState<Book | null>(null)
  const [loading, setLoading] = useState(true)
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    return (localStorage.getItem('reader-theme') as ThemeMode) || 'light'
  })
  const [showThemeMenu, setShowThemeMenu] = useState(false)

  const currentTheme = THEMES[themeMode]

  useEffect(() => {
    const loadBook = async () => {
      try {
        const library = await window.ipcRenderer.invoke('get-library')
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
  }, [id, navigate])

  const handleProgressUpdate = (progress: number) => {
    if (book) {
      window.ipcRenderer.invoke('update-progress', book.id, progress)
    }
  }

  const handleThemeChange = (mode: ThemeMode) => {
    setThemeMode(mode)
    localStorage.setItem('reader-theme', mode)
    setShowThemeMenu(false)
  }

  if (loading) return <div className="p-8">Loading...</div>
  if (!book) return <div className="p-8">Book not found</div>

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="h-12 bg-white border-b flex items-center px-4 gap-4 shrink-0 relative z-50">
        <button 
          onClick={() => navigate('/')}
          className="p-1 hover:bg-gray-100 rounded text-gray-600"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-medium text-gray-800 truncate flex-1">{book.title}</h1>
        
        <div className="relative">
          <button
            onClick={() => setShowThemeMenu(!showThemeMenu)}
            className="p-1.5 hover:bg-gray-100 rounded text-gray-600 transition-colors"
            title="Appearance"
          >
            <Palette className="w-5 h-5" />
          </button>

          {showThemeMenu && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowThemeMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 py-2 z-20">
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Theme
                </div>
                <div className="grid grid-cols-2 gap-2 px-3 py-2">
                  {(Object.keys(THEMES) as ThemeMode[]).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => handleThemeChange(mode)}
                      className={`
                        flex flex-col items-center gap-1.5 p-2 rounded-md border text-xs transition-all
                        ${themeMode === mode 
                          ? 'border-blue-500 bg-blue-50 text-blue-700' 
                          : 'border-gray-200 hover:border-gray-300 bg-gray-50 text-gray-600'}
                      `}
                    >
                      <div 
                        className="w-full h-8 rounded shadow-sm border border-black/5" 
                        style={{ backgroundColor: THEMES[mode].bg }}
                      />
                      <span className="capitalize">{mode}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden relative">
        {book.format === 'pdf' && (
          <PdfReader 
            filePath={book.path} 
            initialProgress={book.progress}
            onProgressUpdate={handleProgressUpdate}
            theme={currentTheme}
          />
        )}
        
        {(book.format === 'md' || book.format === 'txt') && (
          <MarkdownReader 
            filePath={book.path}
            format={book.format}
            theme={currentTheme}
          />
        )}

        {(book.format === 'epub' || book.format === 'mobi' || book.format === 'azw3') && (
          <EpubReader 
            filePath={book.path}
            initialProgress={book.progress}
            onProgressUpdate={handleProgressUpdate}
            theme={currentTheme}
          />
        )}

        {book.format !== 'pdf' && book.format !== 'md' && book.format !== 'txt' && book.format !== 'epub' && book.format !== 'mobi' && book.format !== 'azw3' && (
          <div className="flex items-center justify-center h-full text-gray-500">
            Format .{book.format} viewer not implemented yet
          </div>
        )}
      </div>
    </div>
  )
}
