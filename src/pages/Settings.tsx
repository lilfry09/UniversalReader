import { useEffect, useMemo, useState } from 'react'
import { FolderOpen, ExternalLink, Type, Minus, Plus, Image } from 'lucide-react'
import { clsx } from 'clsx'
import type { ThemeMode, ReaderSettings } from '../types'
import { THEMES, DEFAULT_READER_SETTINGS, FONT_FAMILIES } from '../types'

function readBool(key: string, defaultValue: boolean) {
  const raw = localStorage.getItem(key)
  if (raw == null) return defaultValue
  return raw === 'true'
}

export default function Settings() {
  const [openExternalLinks, setOpenExternalLinks] = useState<boolean>(() =>
    readBool('open-external-links', true)
  )

  const [defaultTheme, setDefaultTheme] = useState<ThemeMode>(() => {
    return (localStorage.getItem('reader-theme') as ThemeMode) || 'light'
  })

  const [readerSettings, setReaderSettings] = useState<ReaderSettings>(() => {
    const saved = localStorage.getItem('reader-settings')
    return saved ? { ...DEFAULT_READER_SETTINGS, ...JSON.parse(saved) } : DEFAULT_READER_SETTINGS
  })

  const [customBgImage, setCustomBgImage] = useState<string | null>(() => {
    return localStorage.getItem('reader-custom-bg') || null
  })

  const [customBgUrl, setCustomBgUrl] = useState<string | null>(null)

  // Load custom background URL
  useEffect(() => {
    const loadBgUrl = async () => {
      if (customBgImage) {
        const url = await window.ipcRenderer.invoke('get-background-image-url', customBgImage)
        setCustomBgUrl(url)
      } else {
        setCustomBgUrl(null)
      }
    }
    loadBgUrl()
  }, [customBgImage])

  useEffect(() => {
    localStorage.setItem('open-external-links', String(openExternalLinks))
  }, [openExternalLinks])

  useEffect(() => {
    localStorage.setItem('reader-theme', defaultTheme)
  }, [defaultTheme])

  useEffect(() => {
    localStorage.setItem('reader-settings', JSON.stringify(readerSettings))
  }, [readerSettings])

  const themeModes = useMemo(() => (Object.keys(THEMES) as ThemeMode[]).filter(m => m !== 'custom'), [])

  const handleSelectBackgroundImage = async () => {
    const imagePath = await window.ipcRenderer.invoke('select-background-image')
    if (imagePath) {
      setCustomBgImage(imagePath)
      localStorage.setItem('reader-custom-bg', imagePath)
    }
  }

  const handleClearBackgroundImage = () => {
    setCustomBgImage(null)
    localStorage.removeItem('reader-custom-bg')
    if (defaultTheme === 'custom') {
      setDefaultTheme('light')
    }
  }

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">设置</h1>

      <div className="space-y-6">
        <section className="bg-white border rounded-lg p-5">
          <h2 className="font-semibold text-gray-900 mb-3">阅读</h2>

          <div className="mb-4">
            <div className="text-sm font-medium text-gray-700 mb-2">默认主题</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {themeModes.map((mode) => {
                const t = THEMES[mode]
                const selected = defaultTheme === mode
                const labels: Record<string, string> = {
                  light: '明亮',
                  dark: '暗黑',
                  sepia: '护眼',
                  gray: '灰色'
                }
                return (
                  <button
                    key={mode}
                    onClick={() => setDefaultTheme(mode)}
                    className={clsx(
                      'rounded-lg border p-3 text-left transition',
                      selected
                        ? 'border-blue-500 ring-2 ring-blue-200'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <div
                      className="h-10 rounded-md border border-black/5 shadow-sm"
                      style={{ backgroundColor: t.bg }}
                    />
                    <div className="mt-2 text-xs font-medium text-gray-700">{labels[mode] || mode}</div>
                  </button>
                )
              })}
            </div>
            <div className="mt-2 text-xs text-gray-500">
              用于新会话。您仍然可以在阅读器标题栏切换主题。
            </div>
          </div>

          <label className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-medium text-gray-700">在外部打开链接</div>
              <div className="text-xs text-gray-500">
                Markdown/PDF 超链接在系统浏览器中打开。
              </div>
            </div>
            <input
              type="checkbox"
              checked={openExternalLinks}
              onChange={(e) => setOpenExternalLinks(e.target.checked)}
              className="h-4 w-4"
            />
          </label>
        </section>

        {/* Font Settings Section */}
        <section className="bg-white border rounded-lg p-5">
          <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Type className="w-4 h-4" />
            字体设置
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">字体大小</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setReaderSettings(prev => ({ ...prev, fontSize: Math.max(12, prev.fontSize - 1) }))}
                  className="p-1 rounded hover:bg-gray-100"
                  title="减小字体"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center text-sm font-mono">{readerSettings.fontSize}px</span>
                <button
                  onClick={() => setReaderSettings(prev => ({ ...prev, fontSize: Math.min(32, prev.fontSize + 1) }))}
                  className="p-1 rounded hover:bg-gray-100"
                  title="增大字体"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">行高</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setReaderSettings(prev => ({ ...prev, lineHeight: Math.max(1.2, prev.lineHeight - 0.1) }))}
                  className="p-1 rounded hover:bg-gray-100"
                  title="减小行高"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center text-sm font-mono">{readerSettings.lineHeight.toFixed(1)}</span>
                <button
                  onClick={() => setReaderSettings(prev => ({ ...prev, lineHeight: Math.min(2.5, prev.lineHeight + 0.1) }))}
                  className="p-1 rounded hover:bg-gray-100"
                  title="增大行高"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">字体</label>
              <select
                value={readerSettings.fontFamily}
                onChange={(e) => setReaderSettings(prev => ({ ...prev, fontFamily: e.target.value }))}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                title="选择字体"
              >
                {FONT_FAMILIES.map(f => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">翻页模式</label>
              <div className="flex gap-2">
                {[
                  { mode: 'scroll', label: '滚动' },
                  { mode: 'paginated', label: '分页' },
                  { mode: 'single', label: '单页' },
                ].map(({ mode, label }) => (
                  <button
                    key={mode}
                    onClick={() => setReaderSettings(prev => ({ ...prev, pageMode: mode as ReaderSettings['pageMode'] }))}
                    className={clsx(
                      'flex-1 py-2 rounded-md border text-sm transition',
                      readerSettings.pageMode === mode
                        ? 'border-blue-500 bg-blue-50 text-blue-600'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Background Image Section */}
        <section className="bg-white border rounded-lg p-5">
          <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Image className="w-4 h-4" />
            自定义背景
          </h2>

          {customBgUrl ? (
            <div className="space-y-3">
              <div 
                className="w-full h-32 rounded-lg border bg-cover bg-center"
                style={{ backgroundImage: `url(${customBgUrl})` }}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSelectBackgroundImage}
                  className="flex-1 py-2 text-sm rounded border border-gray-200 hover:bg-gray-50"
                >
                  更换图片
                </button>
                <button
                  onClick={handleClearBackgroundImage}
                  className="flex-1 py-2 text-sm rounded border border-gray-200 text-red-500 hover:bg-red-50"
                >
                  移除背景
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={handleSelectBackgroundImage}
              className="w-full py-4 text-sm rounded-lg border-2 border-dashed border-gray-200 hover:border-gray-300 hover:bg-gray-50 flex items-center justify-center gap-2"
            >
              <Image className="w-5 h-5 text-gray-400" />
              <span className="text-gray-600">选择本地图片作为阅读背景</span>
            </button>
          )}
          <div className="mt-2 text-xs text-gray-500">
            选择图片后，将在阅读时自动使用自定义主题。
          </div>
        </section>

        <section className="bg-white border rounded-lg p-5">
          <h2 className="font-semibold text-gray-900 mb-3">存储</h2>

          <button
            onClick={async () => {
              try {
                await window.ipcRenderer.invoke('open-user-data-folder')
              } catch (err) {
                console.error('Failed to open user data folder:', err)
              }
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800"
          >
            <FolderOpen className="w-4 h-4" />
            打开应用数据文件夹
            <ExternalLink className="w-4 h-4 opacity-70" />
          </button>

          <div className="mt-2 text-xs text-gray-500">
            包含书库数据库和导入的书籍副本。
          </div>
        </section>
      </div>
    </div>
  )
}
