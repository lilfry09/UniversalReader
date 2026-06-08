import { useEffect, useMemo, useState } from 'react'
import { FolderOpen, ExternalLink, Type, Minus, Plus, Image } from 'lucide-react'
import { clsx } from 'clsx'
import type { ThemeMode, ReaderSettings } from '../types'
import { THEMES, DEFAULT_READER_SETTINGS, FONT_FAMILIES } from '../types'
import {
  isElectron,
  OPEN_EXTERNAL_LINKS_KEY,
  READER_CUSTOM_BG_KEY,
  READER_SETTINGS_KEY,
  READER_THEME_KEY,
  safeGetItem,
  safeSetItem
} from '../utils'
import APIConfig from '../components/APIConfig'

function readBool(key: string, defaultValue: boolean) {
  const raw = localStorage.getItem(key)
  if (raw == null) return defaultValue
  return raw === 'true'
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

export default function Settings() {
  const isDesktop = isElectron()
  const [openExternalLinks, setOpenExternalLinks] = useState<boolean>(() =>
    readBool(OPEN_EXTERNAL_LINKS_KEY, true)
  )

  const [defaultTheme, setDefaultTheme] = useState<ThemeMode>(() => {
    return readThemeMode()
  })

  const [readerSettings, setReaderSettings] = useState<ReaderSettings>(() => {
    return readReaderSettings()
  })

  const [customBgImage, setCustomBgImage] = useState<string | null>(() => {
    return safeGetItem<string | null>(READER_CUSTOM_BG_KEY, null)
  })

  const [customBgUrl, setCustomBgUrl] = useState<string | null>(null)

  // Load custom background URL
  useEffect(() => {
    const loadBgUrl = async () => {
      if (!customBgImage || !isDesktop) {
        setCustomBgUrl(null)
        return
      }

      try {
        const url = await window.ipcRenderer.invoke('get-background-image-url', customBgImage)
        setCustomBgUrl(url)
      } catch (err) {
        console.error('Failed to load custom background URL:', err)
        setCustomBgUrl(null)
      }
    }
    void loadBgUrl()
  }, [customBgImage, isDesktop])

  useEffect(() => {
    localStorage.setItem(OPEN_EXTERNAL_LINKS_KEY, String(openExternalLinks))
  }, [openExternalLinks])

  useEffect(() => {
    safeSetItem(READER_THEME_KEY, defaultTheme)
  }, [defaultTheme])

  useEffect(() => {
    safeSetItem(READER_SETTINGS_KEY, readerSettings)
  }, [readerSettings])

  const themeModes = useMemo(() => (Object.keys(THEMES) as ThemeMode[]).filter(m => m !== 'custom'), [])

  const handleSelectBackgroundImage = async () => {
    if (!isDesktop) return
    const imagePath = await window.ipcRenderer.invoke('select-background-image')
    if (imagePath) {
      setCustomBgImage(imagePath)
      safeSetItem(READER_CUSTOM_BG_KEY, imagePath)
    }
  }

  const handleClearBackgroundImage = () => {
    setCustomBgImage(null)
    localStorage.removeItem(READER_CUSTOM_BG_KEY)
    if (defaultTheme === 'custom') {
      setDefaultTheme('light')
    }
  }

  const settingCardClass = 'rounded-md border border-slate-200 bg-white p-5 shadow-sm'
  const iconButtonClass = 'flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-900'

  return (
    <div className="min-h-full px-8 py-7">
      <div className="mx-auto grid max-w-6xl gap-8 xl:grid-cols-[280px_1fr]">
        <aside className="pt-1">
          <div className="sticky top-7">
            <div className="mb-2 text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
              Preferences
            </div>
            <h1 className="text-4xl font-semibold leading-tight text-slate-950">设置</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              调整默认阅读体验、外部链接行为和本地存储入口。
            </p>
          </div>
        </aside>

        <div className="space-y-5">
          <section className={settingCardClass}>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.08em] text-slate-500">阅读体验</h2>

          <div className="mb-4">
            <div className="mb-2 text-sm font-medium text-slate-800">默认主题</div>
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
                      'rounded-md border p-3 text-left transition',
                      selected
                        ? 'border-[#637a68] ring-4 ring-[#637a68]/10'
                        : 'border-slate-200 hover:border-slate-300'
                    )}
                  >
                    <div
                      className="h-10 rounded-md border border-black/5 shadow-sm"
                      style={{ backgroundColor: t.bg }}
                    />
                    <div className="mt-2 text-xs font-medium text-slate-700">{labels[mode] || mode}</div>
                  </button>
                )
              })}
            </div>
            <div className="mt-2 text-xs text-slate-500">
              用于新会话。您仍然可以在阅读器标题栏切换主题。
            </div>
          </div>

          <label className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-medium text-slate-800">在外部打开链接</div>
              <div className="text-xs text-slate-500">
                Markdown/PDF 超链接在系统浏览器中打开。
              </div>
            </div>
            <input
              type="checkbox"
              checked={openExternalLinks}
              onChange={(e) => setOpenExternalLinks(e.target.checked)}
              className="h-4 w-4 accent-[#637a68]"
            />
          </label>
        </section>

        {/* Font Settings Section */}
        <section className={settingCardClass}>
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.08em] text-slate-500">
            <Type className="w-4 h-4" />
            字体设置
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-800">字体大小</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setReaderSettings(prev => ({ ...prev, fontSize: Math.max(12, prev.fontSize - 1) }))}
                  className={iconButtonClass}
                  title="减小字体"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center text-sm font-mono">{readerSettings.fontSize}px</span>
                <button
                  onClick={() => setReaderSettings(prev => ({ ...prev, fontSize: Math.min(32, prev.fontSize + 1) }))}
                  className={iconButtonClass}
                  title="增大字体"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-800">行高</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setReaderSettings(prev => ({ ...prev, lineHeight: Math.max(1.2, prev.lineHeight - 0.1) }))}
                  className={iconButtonClass}
                  title="减小行高"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center text-sm font-mono">{readerSettings.lineHeight.toFixed(1)}</span>
                <button
                  onClick={() => setReaderSettings(prev => ({ ...prev, lineHeight: Math.min(2.5, prev.lineHeight + 0.1) }))}
                  className={iconButtonClass}
                  title="增大行高"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-800 block mb-2">字体</label>
              <select
                value={readerSettings.fontFamily}
                onChange={(e) => setReaderSettings(prev => ({ ...prev, fontFamily: e.target.value }))}
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-4 focus:ring-[#637a68]/10"
                title="选择字体"
              >
                {FONT_FAMILIES.map(f => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-800 block mb-2">翻页模式</label>
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
                        ? 'border-[#637a68] bg-[#e4ebe6] text-[#20332e]'
                        : 'border-slate-200 hover:border-slate-300'
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
        <section className={settingCardClass}>
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.08em] text-slate-500">
            <Image className="w-4 h-4" />
            自定义背景
          </h2>

          {!isDesktop ? (
            <div className="text-sm text-slate-500">
              当前为 Web 模式，暂不支持本地背景图片选择。
            </div>
          ) : customBgUrl ? (
            <div className="space-y-3">
              <div 
                className="h-32 w-full rounded-md border bg-cover bg-center"
                style={{ backgroundImage: `url(${customBgUrl})` }}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSelectBackgroundImage}
                  className="flex-1 rounded-md border border-slate-200 py-2 text-sm hover:bg-slate-50"
                >
                  更换图片
                </button>
                <button
                  onClick={handleClearBackgroundImage}
                  className="flex-1 rounded-md border border-slate-200 py-2 text-sm text-red-500 hover:bg-red-50"
                >
                  移除背景
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={handleSelectBackgroundImage}
              className="flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-slate-300 py-4 text-sm hover:border-slate-400 hover:bg-slate-50"
            >
              <Image className="w-5 h-5 text-slate-400" />
              <span className="text-slate-600">选择本地图片作为阅读背景</span>
            </button>
          )}
          <div className="mt-2 text-xs text-slate-500">
            选择图片后，将在阅读时自动使用自定义主题。
          </div>
          </section>

        {/* AI QA API Configuration */}
        {isDesktop && (
          <section className={settingCardClass}>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.08em] text-slate-500">AI 问答配置</h2>

            <APIConfig />
          </section>
        )}

        <section className={settingCardClass}>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.08em] text-slate-500">存储</h2>

          <button
            onClick={async () => {
              if (!isDesktop) return
              try {
                await window.ipcRenderer.invoke('open-user-data-folder')
              } catch (err) {
                console.error('Failed to open user data folder:', err)
              }
            }}
            className="inline-flex items-center gap-2 rounded-md bg-[#20332e] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#2b433b] disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!isDesktop}
          >
            <FolderOpen className="w-4 h-4" />
            打开应用数据文件夹
            <ExternalLink className="w-4 h-4 opacity-70" />
          </button>

          <div className="mt-2 text-xs text-slate-500">
            包含书库数据库和导入的书籍副本。
          </div>
        </section>
        </div>
      </div>
    </div>
  )
}
