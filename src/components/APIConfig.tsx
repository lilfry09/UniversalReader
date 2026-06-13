import { useCallback, useEffect, useState } from 'react'
import { Key, Save, Trash2, Eye, EyeOff } from 'lucide-react'
import { clsx } from 'clsx'
import { isElectron } from '../utils'

export default function APIConfig() {
  const [apiKey, setApiKey] = useState('')
  const [baseUrl, setBaseUrl] = useState('')
  const [model, setModel] = useState('')
  const [apiStyle, setApiStyle] = useState<'openai' | 'anthropic'>('openai')
  const [showApiKey, setShowApiKey] = useState(false)
  const [hasCredentials, setHasCredentials] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const loadCredentials = useCallback(async () => {
    if (!isElectron()) return

    try {
      const hasCreds = await window.ipcRenderer.invoke('credentials-has')
      setHasCredentials(hasCreds)

      const creds = await window.ipcRenderer.invoke('credentials-load')
      if (creds) {
        setApiKey('')
        setHasCredentials(hasCreds || creds.hasApiKey)
        setBaseUrl(creds.qaBaseUrl || '')
        setModel(creds.qaModel || '')
        setApiStyle(creds.qaApiStyle || 'openai')
      }
    } catch (err) {
      console.error('Failed to load credentials:', err)
    }
  }, [])

  useEffect(() => {
    queueMicrotask(() => {
      void loadCredentials()
    })
  }, [loadCredentials])

  const handleSave = async () => {
    if (!isElectron()) return
    if (!apiKey.trim() && !hasCredentials) {
      setErrorMessage('API Key 不能为空')
      setSaveStatus('error')
      return
    }

    setSaveStatus('saving')
    setErrorMessage('')

    try {
      const result = await window.ipcRenderer.invoke('credentials-save', {
        qaApiKey: apiKey.trim() || undefined,
        qaBaseUrl: baseUrl.trim() || undefined,
        qaModel: model.trim() || undefined,
        qaApiStyle: apiStyle,
      })

      if (result.success) {
        setSaveStatus('success')
        setHasCredentials(true)
        setApiKey('')
        setTimeout(() => setSaveStatus('idle'), 2000)
      } else {
        setSaveStatus('error')
        setErrorMessage(result.error || '保存失败')
      }
    } catch (err) {
      setSaveStatus('error')
      setErrorMessage(err instanceof Error ? err.message : '保存失败')
    }
  }

  const handleClear = async () => {
    if (!isElectron()) return
    if (!confirm('确定要清除所有 API 配置吗？')) return

    try {
      await window.ipcRenderer.invoke('credentials-clear')
      setApiKey('')
      setBaseUrl('')
      setModel('')
      setApiStyle('openai')
      setHasCredentials(false)
      setSaveStatus('idle')
    } catch (err) {
      console.error('Failed to clear credentials:', err)
    }
  }

  const inputClass = 'w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-[#637a68]/10'
  const buttonClass = 'inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition'

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2">
        <Key className="w-5 h-5 text-slate-400 mt-2" />
        <div className="flex-1">
          <p className="text-sm text-slate-600 mb-3">
            配置 AI 问答服务的 API 凭证。支持 OpenAI 兼容和 Anthropic 兼容的 API。
          </p>

          {/* API Style Selection */}
          <div className="mb-3">
            <label className="text-sm font-medium text-slate-800 block mb-2">API 类型</label>
            <div className="flex gap-2">
              <button
                onClick={() => setApiStyle('openai')}
                className={clsx(
                  'flex-1 py-2 rounded-md border text-sm transition',
                  apiStyle === 'openai'
                    ? 'border-[#637a68] bg-[#e4ebe6] text-[#20332e]'
                    : 'border-slate-200 hover:border-slate-300'
                )}
              >
                OpenAI 兼容
              </button>
              <button
                onClick={() => setApiStyle('anthropic')}
                className={clsx(
                  'flex-1 py-2 rounded-md border text-sm transition',
                  apiStyle === 'anthropic'
                    ? 'border-[#637a68] bg-[#e4ebe6] text-[#20332e]'
                    : 'border-slate-200 hover:border-slate-300'
                )}
              >
                Anthropic 兼容
              </button>
            </div>
          </div>

          {/* API Key */}
          <div className="mb-3">
            <label className="text-sm font-medium text-slate-800 block mb-2">API Key *</label>
            <div className="relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={hasCredentials ? '已保存；留空保持不变' : 'sk-...'}
                className={inputClass}
              />
              <button
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                title={showApiKey ? '隐藏' : '显示'}
              >
                {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Base URL */}
          <div className="mb-3">
            <label className="text-sm font-medium text-slate-800 block mb-2">
              Base URL <span className="text-slate-400 font-normal">(可选)</span>
            </label>
            <input
              type="text"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder={apiStyle === 'openai' ? 'https://api.openai.com/v1' : 'https://api.anthropic.com'}
              className={inputClass}
            />
            <div className="mt-1 text-xs text-slate-500">
              留空使用默认 URL。支持 OpenRouter、DeepSeek 等兼容服务。
            </div>
          </div>

          {/* Model */}
          <div className="mb-4">
            <label className="text-sm font-medium text-slate-800 block mb-2">
              Model <span className="text-slate-400 font-normal">(可选)</span>
            </label>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder={apiStyle === 'openai' ? 'gpt-3.5-turbo' : 'claude-3-5-sonnet-20241022'}
              className={inputClass}
            />
            <div className="mt-1 text-xs text-slate-500">
              留空使用默认模型。
            </div>
          </div>

          {/* Error Message */}
          {saveStatus === 'error' && errorMessage && (
            <div className="mb-3 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
              {errorMessage}
            </div>
          )}

          {/* Success Message */}
          {saveStatus === 'success' && (
            <div className="mb-3 rounded-md bg-green-50 border border-green-200 px-3 py-2 text-sm text-green-700">
              配置已保存
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saveStatus === 'saving'}
              className={clsx(
                buttonClass,
                'bg-[#20332e] text-white hover:bg-[#2b433b] disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              <Save className="w-4 h-4" />
              {saveStatus === 'saving' ? '保存中...' : '保存配置'}
            </button>

            {hasCredentials && (
              <button
                onClick={handleClear}
                disabled={saveStatus === 'saving'}
                className={clsx(
                  buttonClass,
                  'border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-50'
                )}
              >
                <Trash2 className="w-4 h-4" />
                清除
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
