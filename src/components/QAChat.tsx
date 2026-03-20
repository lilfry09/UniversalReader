import { useState, useRef, useEffect, useCallback } from 'react'
import { Send, X, BookOpen, Trash2, Loader2 } from 'lucide-react'
import type { SourceChunk, QAStatus } from '../types'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  sources?: SourceChunk[]
}

interface QAChatProps {
  bookPath?: string
  bookFormat?: string
  bookTitle?: string
  isOpen: boolean
  onToggle: () => void
}

export default function QAChat({ bookPath, bookFormat, bookTitle, isOpen, onToggle }: QAChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [qaStatus, setQaStatus] = useState<QAStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Load book when opened with book info
  const loadBook = useCallback(async () => {
    if (!bookPath || !bookFormat) return
    
    setIsLoading(true)
    setError(null)
    setQaStatus('loading')
    
    try {
      const result = await window.ipcRenderer.invoke('qa-load-book', bookPath, bookFormat)
      if (result.success) {
        setQaStatus('ready')
        setMessages([{
          id: '1',
          role: 'assistant',
          content: `我已经加载了"${bookTitle || '这本书'}"。你可以问我关于内容的问题，我会根据原文回答你。`
        }])
      } else {
        setQaStatus('error')
        setError(result.error || '加载书籍失败')
      }
    } catch (e) {
      setQaStatus('error')
      setError(String(e))
    } finally {
      setIsLoading(false)
    }
  }, [bookPath, bookFormat, bookTitle])

  useEffect(() => {
    if (bookPath && bookFormat && isOpen && qaStatus === 'idle') {
      loadBook()
    }
  }, [bookPath, bookFormat, isOpen, qaStatus, loadBook])

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || isLoading || qaStatus !== 'ready') return
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim()
    }
    
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    
    try {
      const result = await window.ipcRenderer.invoke('qa-ask', userMessage.content)
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.answer,
        sources: result.sources
      }
      
      setMessages(prev => [...prev, assistantMessage])
    } catch (e) {
      setError(String(e))
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const clearChat = () => {
    setMessages([])
    window.ipcRenderer.invoke('qa-clear')
    setQaStatus('idle')
    setError(null)
  }

  if (!isOpen) return null

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-500" />
          <span className="font-medium text-gray-900 dark:text-white">AI 问答助手</span>
          {qaStatus === 'loading' && <Loader2 className="w-4 h-4 animate-spin text-blue-500" />}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={clearChat}
            className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
            title="清空对话"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={onToggle}
            className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mx-4 mt-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg">
          {error}
        </div>
      )}

      {/* Status bar */}
      {qaStatus === 'ready' && (
        <div className="mx-4 mt-2 p-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-sm rounded-lg flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
          已加载 "{bookTitle || '书籍'}"，可以开始提问
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && qaStatus === 'ready' && (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>关于这本书，你想知道什么？</p>
          </div>
        )}
        
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-lg px-4 py-2 ${
              msg.role === 'user'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
            }`}>
              <div className="whitespace-pre-wrap">{msg.content}</div>
              
              {/* Sources */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs opacity-75 mb-1">参考来源：</p>
                  <div className="space-y-1">
                    {msg.sources.map((source, idx) => (
                      <div key={idx} className="text-xs opacity-75 bg-black/10 dark:bg-white/10 p-2 rounded">
                        {source.page !== undefined && <span className="font-medium">第{source.page}页: </span>}
                        {source.content.slice(0, 150)}...
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-2">
              <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={qaStatus === 'ready' ? "输入问题..." : "加载书籍中..."}
            disabled={isLoading || qaStatus !== 'ready'}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !input.trim() || qaStatus !== 'ready'}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
