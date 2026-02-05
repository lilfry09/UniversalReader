import { useState, useEffect } from 'react'
import Markdown from 'react-markdown'
import type { ReaderTheme, ReaderSettings } from '../../types'
import { DEFAULT_READER_SETTINGS } from '../../types'
import { clsx } from 'clsx'

function shouldOpenExternal(href: string) {
  try {
    const url = new URL(href)
    return url.protocol === 'http:' || url.protocol === 'https:' || url.protocol === 'mailto:'
  } catch {
    return false
  }
}

function isExternalLinksEnabled() {
  const raw = localStorage.getItem('open-external-links')
  return raw == null ? true : raw === 'true'
}

interface MarkdownReaderProps {
  filePath: string
  format: 'md' | 'txt'
  theme: ReaderTheme
  readerSettings?: ReaderSettings
}

export default function MarkdownReader({ 
  filePath, 
  format, 
  theme,
  readerSettings = DEFAULT_READER_SETTINGS 
}: MarkdownReaderProps) {
  const [content, setContent] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadContent = async () => {
      try {
        setLoading(true)
        const buffer = await window.ipcRenderer.invoke('read-file', filePath)
        const text = new TextDecoder().decode(buffer)
        setContent(text)
      } catch (err) {
        console.error('Failed to load markdown/text file:', err)
        setContent('Error loading file.')
      } finally {
        setLoading(false)
      }
    }
    loadContent()
  }, [filePath])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        Loading content...
      </div>
    )
  }

  // Compute background style for custom background image
  const backgroundStyle: React.CSSProperties = theme.customBgImage
    ? {
        backgroundImage: `url(${theme.customBgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
        color: theme.text,
      }
    : { backgroundColor: theme.bg, color: theme.text }

  // Compute content styles based on reader settings
  const contentStyle: React.CSSProperties = {
    fontSize: `${readerSettings.fontSize}px`,
    lineHeight: readerSettings.lineHeight,
    fontFamily: readerSettings.fontFamily,
  }

  return (
    <div 
      className="h-full overflow-auto transition-colors duration-200" 
      style={backgroundStyle}
    >
      <div className="max-w-3xl mx-auto px-8 py-12" style={contentStyle}>
        {format === 'md' ? (
          <article className={clsx(
            "prose lg:prose-lg max-w-none transition-colors duration-200",
            (theme.mode === 'dark' || theme.mode === 'gray') ? "prose-invert" : "prose-slate"
          )}
          style={{ 
            '--tw-prose-body': theme.text,
            fontSize: 'inherit',
            lineHeight: 'inherit',
            fontFamily: 'inherit',
          } as React.CSSProperties}
          >
            <Markdown
              components={{
                a: ({ href, children, ...props }) => {
                  const safeHref = href || ''
                  const external = isExternalLinksEnabled() && shouldOpenExternal(safeHref)

                  return (
                    <a
                      {...props}
                      href={safeHref}
                      onClick={async (e) => {
                        if (!safeHref) return
                        if (!external) return
                        e.preventDefault()
                        try {
                          await window.ipcRenderer.invoke('open-external', safeHref)
                        } catch (err) {
                          console.error('Failed to open external link:', err)
                        }
                      }}
                      rel={external ? 'noreferrer' : props.rel}
                    >
                      {children}
                    </a>
                  )
                },
              }}
            >
              {content}
            </Markdown>
          </article>
        ) : (
          <pre 
            className="whitespace-pre-wrap font-mono leading-relaxed p-4 rounded-lg border transition-colors duration-200"
            style={{ 
              backgroundColor: theme.customBgImage ? 'rgba(255,255,255,0.85)' : theme.ui, 
              color: theme.text,
              borderColor: theme.mode === 'light' || theme.mode === 'custom' ? '#e5e7eb' : 'transparent',
              fontSize: `${readerSettings.fontSize}px`,
              lineHeight: readerSettings.lineHeight,
            }}
          >
            {content}
          </pre>
        )}
      </div>
    </div>
  )
}
