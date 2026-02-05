import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Settings, Type, Image, BookOpen, Minus, Plus } from 'lucide-react'
import type { Book, ThemeMode, ReaderSettings, PageMode, ReaderTheme } from '../types'
import { THEMES, DEFAULT_READER_SETTINGS, FONT_FAMILIES } from '../types'
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
  const [showSettingsMenu, setShowSettingsMenu] = useState(false)
  const [customBgImage, setCustomBgImage] = useState<string | null>(() => {
    return localStorage.getItem('reader-custom-bg') || null
  })
  const [customBgUrl, setCustomBgUrl] = useState<string | null>(null)

  // Reader settings
  const [readerSettings, setReaderSettings] = useState<ReaderSettings>(() => {
    const saved = localStorage.getItem('reader-settings')
    return saved ? { ...DEFAULT_READER_SETTINGS, ...JSON.parse(saved) } : DEFAULT_READER_SETTINGS
  })

  // Load custom background image URL
  useEffect(() => {
    const loadCustomBg = async () => {
      if (customBgImage) {
        const url = await window.ipcRenderer.invoke('get-background-image-url', customBgImage)
        setCustomBgUrl(url)
      } else {
        setCustomBgUrl(null)
      }
    }
    loadCustomBg()
  }, [customBgImage])

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('reader-settings', JSON.stringify(readerSettings))
  }, [readerSettings])

  useEffect(() => {
    if (customBgImage) {
      localStorage.setItem('reader-custom-bg', customBgImage)
    } else {
      localStorage.removeItem('reader-custom-bg')
    }
  }, [customBgImage])

  const currentTheme: ReaderTheme = useMemo(() => {
    const base = THEMES[themeMode]
    if (themeMode === 'custom' && customBgUrl) {
      return { ...base, customBgImage: customBgUrl }
    }
    return base
  }, [themeMode, customBgUrl])

  const hoverBg = themeMode === 'light' || themeMode === 'sepia' || themeMode === 'custom' ? 'hover:bg-black/10' : 'hover:bg-white/10'
  const dividerColor = themeMode === 'light' || themeMode === 'sepia' || themeMode === 'custom' ? '#e5e7eb' : 'rgba(255,255,255,0.12)'

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
    const imagePath = await window.ipcRenderer.invoke('select-background-image')
    if (imagePath) {
      setCustomBgImage(imagePath)
      setThemeMode('custom')
      localStorage.setItem('reader-theme', 'custom')
    }
  }

  const handleClearBackgroundImage = () => {
    setCustomBgImage(null)
    if (themeMode === 'custom') {
      setThemeMode('light')
      localStorage.setItem('reader-theme', 'light')
    }
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
            onClick={() => setShowSettingsMenu(!showSettingsMenu)}
            className={`p-1.5 rounded transition-colors ${hoverBg}`}
            style={{ color: currentTheme.text }}
            title="阅读设置"
          >
            <Settings className="w-5 h-5" />
          </button>

          {showSettingsMenu && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowSettingsMenu(false)}
              />
              <div
                className="absolute right-0 mt-2 w-80 rounded-lg shadow-xl border py-2 z-20 max-h-[80vh] overflow-y-auto"
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
                          ? 'border-blue-500 bg-blue-600/15' 
                          : 'hover:border-gray-300'}
                      `}
                      style={{
                        borderColor: themeMode === mode ? '#3b82f6' : dividerColor,
                        backgroundColor: themeMode === mode ? 'rgba(59,130,246,0.12)' : 'transparent',
                        color: themeMode === mode ? '#3b82f6' : currentTheme.text,
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
                          ? 'border-blue-500 bg-blue-600/15 text-blue-500' 
                          : 'hover:border-gray-300'}
                      `}
                      style={{
                        borderColor: readerSettings.pageMode === mode ? '#3b82f6' : dividerColor,
                        backgroundColor: readerSettings.pageMode === mode ? 'rgba(59,130,246,0.12)' : 'transparent',
                        color: readerSettings.pageMode === mode ? '#3b82f6' : currentTheme.text,
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
      <div className="flex-1 overflow-hidden relative">
        {book.format === 'pdf' && (
          <PdfReader 
            filePath={book.path}
            bookId={book.id}
            initialProgress={book.progress}
            onProgressUpdate={handleProgressUpdate}
            theme={currentTheme}
            readerSettings={readerSettings}
          />
        )}
        
        {(book.format === 'md' || book.format === 'txt') && (
          <MarkdownReader 
            filePath={book.path}
            format={book.format}
            theme={currentTheme}
            readerSettings={readerSettings}
          />
        )}

        {(book.format === 'epub' || book.format === 'mobi' || book.format === 'azw3') && (
          <EpubReader 
            filePath={book.path}
            bookId={book.id}
            initialProgress={book.progress}
            onProgressUpdate={handleProgressUpdate}
            theme={currentTheme}
            readerSettings={readerSettings}
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
