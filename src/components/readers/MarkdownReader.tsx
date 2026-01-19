import { useState, useEffect } from 'react'
import Markdown from 'react-markdown'
import { ReaderTheme } from '../types'
import { clsx } from 'clsx'

interface MarkdownReaderProps {
  filePath: string
  format: 'md' | 'txt'
  theme: ReaderTheme
}

export default function MarkdownReader({ filePath, format, theme }: MarkdownReaderProps) {
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

  return (
    <div 
      className="h-full overflow-auto transition-colors duration-200" 
      style={{ backgroundColor: theme.bg, color: theme.text }}
    >
      <div className="max-w-3xl mx-auto px-8 py-12">
        {format === 'md' ? (
          <article className={clsx(
            "prose lg:prose-lg max-w-none transition-colors duration-200",
            (theme.mode === 'dark' || theme.mode === 'gray') ? "prose-invert" : "prose-slate"
          )}
          style={{ '--tw-prose-body': theme.text } as any}
          >
            <Markdown>{content}</Markdown>
          </article>
        ) : (
          <pre 
            className="whitespace-pre-wrap font-mono text-sm leading-relaxed p-4 rounded-lg border transition-colors duration-200"
            style={{ 
              backgroundColor: theme.ui, 
              color: theme.text,
              borderColor: theme.mode === 'light' ? '#e5e7eb' : 'transparent'
            }}
          >
            {content}
          </pre>
        )}
      </div>
    </div>
  )
}
