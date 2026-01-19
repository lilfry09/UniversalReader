import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Palette } from 'lucide-react'
import type { Book, ThemeMode } from '../types'
import { THEMES } from '../types'
import PdfReader from '../components/readers/PdfReader'
import MarkdownReader from '../components/readers/MarkdownReader'
import EpubReader from '../components/readers/EpubReader'

export default function Reader() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [book, setBook] = useState<Book | null>(null)
  const [loading, setLoading] = useState(true)
  const [fileExists, setFileExists] = useState<boolean | null>(null)
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    return (localStorage.getItem('reader-theme') as ThemeMode) || 'light'
  })
  const [showThemeMenu, setShowThemeMenu] = useState(false)

  const currentTheme = THEMES[themeMode]
  const hoverBg = themeMode === 'light' || themeMode === 'sepia' ? 'hover:bg-black/10' : 'hover:bg-white/10'
  const dividerColor = themeMode === 'light' || themeMode === 'sepia' ? '#e5e7eb' : 'rgba(255,255,255,0.12)'

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

  useEffect(() => {
    const check = async () => {
      if (!book) return
      try {
        const ok = await window.ipcRenderer.invoke('file-exists', book.path)
        setFileExists(ok)
      } catch (err) {
        console.error('Error checking file existence:', err)
        setFileExists(true)
      }
    }
    void check()
  }, [book])

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
  if (fileExists === false) {
    return (
      <div className="h-full flex flex-col">
        <div
          className="h-12 border-b flex items-center px-4 gap-4 shrink-0"
          style={{ backgroundColor: currentTheme.ui, color: currentTheme.text, borderColor: dividerColor }}
        >
          <button 
            onClick={() => navigate('/')}
            className={`p-1 rounded transition-colors ${hoverBg}`}
            style={{ color: currentTheme.text }}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-medium truncate flex-1" style={{ color: currentTheme.text }}>
            {book.title}
          </h1>
        </div>

        <div className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-xl w-full border rounded-lg p-6 shadow-sm" style={{ backgroundColor: currentTheme.ui, borderColor: dividerColor, color: currentTheme.text }}>
            <h2 className="text-lg font-semibold mb-2">文件找不到</h2>
            <p className="text-sm mb-4 break-all" style={{ opacity: 0.85 }}>
              {book.path}
            </p>
            <div className="flex gap-3">
              <button
                onClick={async () => {
                  const imported = await window.ipcRenderer.invoke('open-file-dialog')
                  if (imported) navigate(`/reader/${imported.id}`)
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                重新导入
              </button>
              <button
                onClick={async () => {
                  await window.ipcRenderer.invoke('delete-book', book.id)
                  navigate('/')
                }}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
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
    <div className="h-full flex flex-col">
      {/* Header */}
      <div
        className="h-12 border-b flex items-center px-4 gap-4 shrink-0 relative z-50"
        style={{ backgroundColor: currentTheme.ui, color: currentTheme.text, borderColor: dividerColor }}
      >
        <button 
          onClick={() => navigate('/')}
          className={`p-1 rounded transition-colors ${hoverBg}`}
          style={{ color: currentTheme.text }}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-medium truncate flex-1" style={{ color: currentTheme.text }}>
          {book.title}
        </h1>
        
        <div className="relative">
          <button
            onClick={() => setShowThemeMenu(!showThemeMenu)}
            className={`p-1.5 rounded transition-colors ${hoverBg}`}
            style={{ color: currentTheme.text }}
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
              <div
                className="absolute right-0 mt-2 w-56 rounded-lg shadow-xl border py-2 z-20"
                style={{ backgroundColor: currentTheme.ui, color: currentTheme.text, borderColor: dividerColor }}
              >
                <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider" style={{ opacity: 0.7 }}>
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
                          ? 'border-blue-500 bg-blue-600/15 text-blue-500' 
                          : 'hover:border-gray-300'}
                      `}
                      style={{
                        borderColor: themeMode === mode ? '#3b82f6' : dividerColor,
                        backgroundColor: themeMode === mode ? 'rgba(59,130,246,0.12)' : (themeMode === 'light' || themeMode === 'sepia') ? '#f9fafb' : 'rgba(255,255,255,0.06)',
                        color: themeMode === mode ? '#3b82f6' : currentTheme.text,
                      }}
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
