import { useEffect, useMemo, useState } from 'react'
import { FolderOpen, ExternalLink } from 'lucide-react'
import { clsx } from 'clsx'
import type { ThemeMode } from '../types'
import { THEMES } from '../types'

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

  useEffect(() => {
    localStorage.setItem('open-external-links', String(openExternalLinks))
  }, [openExternalLinks])

  useEffect(() => {
    localStorage.setItem('reader-theme', defaultTheme)
  }, [defaultTheme])

  const themeModes = useMemo(() => Object.keys(THEMES) as ThemeMode[], [])

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Settings</h1>

      <div className="space-y-6">
        <section className="bg-white border rounded-lg p-5">
          <h2 className="font-semibold text-gray-900 mb-3">Reading</h2>

          <div className="mb-4">
            <div className="text-sm font-medium text-gray-700 mb-2">Default theme</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {themeModes.map((mode) => {
                const t = THEMES[mode]
                const selected = defaultTheme === mode
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
                    <div className="mt-2 text-xs font-medium text-gray-700 capitalize">{mode}</div>
                  </button>
                )
              })}
            </div>
            <div className="mt-2 text-xs text-gray-500">
              Used for new sessions. You can still switch theme in the Reader header.
            </div>
          </div>

          <label className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-medium text-gray-700">Open links externally</div>
              <div className="text-xs text-gray-500">
                Markdown/PDF hyperlinks open in your system browser.
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

        <section className="bg-white border rounded-lg p-5">
          <h2 className="font-semibold text-gray-900 mb-3">Storage</h2>

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
            Open app data folder
            <ExternalLink className="w-4 h-4 opacity-70" />
          </button>

          <div className="mt-2 text-xs text-gray-500">
            Contains the library database and imported book copies.
          </div>
        </section>
      </div>
    </div>
  )
}
