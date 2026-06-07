/**
 * Secure credential storage using Electron's safeStorage API
 * Falls back to environment variables for development/testing
 */
import { safeStorage, app } from 'electron'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'node:url'

// ESM __dirname fix
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

interface SecureCredentials {
  qaApiKey?: string
  qaBaseUrl?: string
  qaModel?: string
  qaApiStyle?: 'openai' | 'anthropic'
}

// Get credentials file path - handle test environment
function getCredentialsPath(): string {
  if (process.env.NODE_ENV === 'test') {
    return path.join(__dirname, '../tmp-test-credentials.enc')
  }
  return path.join(app.getPath('userData'), 'credentials.enc')
}

/**
 * Save API credentials securely
 */
export async function saveCredentials(credentials: SecureCredentials): Promise<void> {
  if (!safeStorage.isEncryptionAvailable()) {
    console.warn('[SecureStore] Encryption not available, credentials will not be saved')
    throw new Error('Encryption not available on this system')
  }

  try {
    const json = JSON.stringify(credentials)
    const encrypted = safeStorage.encryptString(json)
    fs.writeFileSync(getCredentialsPath(), encrypted)
    console.log('[SecureStore] Credentials saved securely')
  } catch (error) {
    console.error('[SecureStore] Failed to save credentials:', error)
    throw new Error('Failed to save credentials securely')
  }
}

/**
 * Load API credentials securely
 */
export function loadCredentials(): SecureCredentials | null {
  const credentialsFile = getCredentialsPath()

  // First try to load from secure storage
  if (fs.existsSync(credentialsFile)) {
    try {
      if (!safeStorage.isEncryptionAvailable()) {
        console.warn('[SecureStore] Encryption not available, cannot decrypt credentials')
        return null
      }

      const encrypted = fs.readFileSync(credentialsFile)
      const decrypted = safeStorage.decryptString(encrypted)
      const credentials = JSON.parse(decrypted) as SecureCredentials
      console.log('[SecureStore] Credentials loaded from secure storage')
      return credentials
    } catch (error) {
      console.error('[SecureStore] Failed to load credentials:', error)
      return null
    }
  }

  return null
}

/**
 * Get API key with fallback to environment variables
 */
export function getApiKey(): string {
  // Try secure storage first
  const credentials = loadCredentials()
  if (credentials?.qaApiKey) {
    return credentials.qaApiKey
  }

  // Fallback to environment variables (for development)
  return (
    process.env.QA_API_KEY ||
    process.env.OPENROUTER_API_KEY ||
    process.env.DEEPSEEK_API_KEY ||
    ''
  )
}

/**
 * Get base URL with fallback to environment variables
 */
export function getBaseUrl(apiStyle: 'openai' | 'anthropic'): string {
  const credentials = loadCredentials()
  if (credentials?.qaBaseUrl) {
    return credentials.qaBaseUrl
  }

  // Fallback to environment variables
  if (process.env.QA_BASE_URL) return process.env.QA_BASE_URL
  if (process.env.OPENROUTER_BASE_URL) return process.env.OPENROUTER_BASE_URL

  // Default URLs based on API style
  return apiStyle === 'anthropic'
    ? 'https://api.minimax.io/anthropic'
    : 'https://openrouter.ai/api/v1'
}

/**
 * Get chat model with fallback to environment variables
 */
function getDefaultChatModel(apiStyle: 'openai' | 'anthropic', baseUrl?: string): string {
  if (apiStyle === 'anthropic') {
    return 'MiniMax-M2.7'
  }

  return baseUrl?.includes('openrouter.ai')
    ? 'google/gemini-2.0-flash-thinking-exp:free'
    : 'gpt-3.5-turbo'
}

export function getChatModel(apiStyle: 'openai' | 'anthropic'): string {
  const credentials = loadCredentials()
  if (credentials?.qaModel) {
    return credentials.qaModel
  }

  // Fallback to environment variable
  if (process.env.QA_MODEL) return process.env.QA_MODEL

  const baseUrl = credentials?.qaBaseUrl || getBaseUrl(apiStyle)
  return getDefaultChatModel(apiStyle, baseUrl)
}

/**
 * Get API style preference
 */
export function getApiStyle(): 'openai' | 'anthropic' {
  const credentials = loadCredentials()
  if (credentials?.qaApiStyle) {
    return credentials.qaApiStyle
  }

  // Fallback to environment variable
  const envStyle = (process.env.QA_API_STYLE || '').toLowerCase()
  return envStyle === 'anthropic' ? 'anthropic' : 'openai'
}

/**
 * Clear all stored credentials
 */
export function clearCredentials(): void {
  try {
    const credentialsFile = getCredentialsPath()
    if (fs.existsSync(credentialsFile)) {
      fs.unlinkSync(credentialsFile)
      console.log('[SecureStore] Credentials cleared')
    }
  } catch (error) {
    console.error('[SecureStore] Failed to clear credentials:', error)
  }
}

/**
 * Check if credentials are available (either stored or in env)
 */
export function hasCredentials(): boolean {
  const apiKey = getApiKey()
  return apiKey.length > 0
}
