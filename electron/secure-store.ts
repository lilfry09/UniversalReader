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

export type ApiStyle = 'openai' | 'anthropic'

export interface SecureCredentials {
  qaApiKey?: string
  qaBaseUrl?: string
  qaModel?: string
  qaApiStyle?: ApiStyle
}

export interface CredentialUpdate {
  qaApiKey?: unknown
  qaBaseUrl?: unknown
  qaModel?: unknown
  qaApiStyle?: unknown
}

export interface PublicCredentials {
  hasApiKey: boolean
  qaBaseUrl?: string
  qaModel?: string
  qaApiStyle?: ApiStyle
}

const MAX_API_KEY_LENGTH = 4096
const MAX_BASE_URL_LENGTH = 2048
const MAX_MODEL_LENGTH = 200

// Get credentials file path - handle test environment
function getCredentialsPath(): string {
  if (process.env.NODE_ENV === 'test') {
    return path.join(__dirname, '../tmp-test-credentials.enc')
  }
  return path.join(app.getPath('userData'), 'credentials.enc')
}

function hasControlCharacters(value: string): boolean {
  return Array.from(value).some(character => {
    const codePoint = character.codePointAt(0)
    return codePoint !== undefined && (codePoint <= 31 || codePoint === 127)
  })
}

function normalizeApiStyle(value: unknown): ApiStyle {
  if (value === undefined || value === null) return 'openai'
  if (value === 'openai' || value === 'anthropic') return value
  throw new Error('Invalid API style')
}

function coerceStoredApiStyle(value: unknown): ApiStyle {
  return value === 'anthropic' ? 'anthropic' : 'openai'
}

function normalizeOptionalString(value: unknown, label: string, maxLength: number): string | undefined {
  if (value === undefined || value === null) return undefined
  if (typeof value !== 'string') {
    throw new Error(`Invalid ${label}`)
  }

  const trimmed = value.trim()
  if (!trimmed) return undefined
  if (trimmed.length > maxLength || hasControlCharacters(trimmed)) {
    throw new Error(`Invalid ${label}`)
  }
  return trimmed
}

function normalizeApiKey(value: unknown): string | undefined {
  const apiKey = normalizeOptionalString(value, 'API key', MAX_API_KEY_LENGTH)
  if (apiKey && /\s/.test(apiKey)) {
    throw new Error('Invalid API key')
  }
  return apiKey
}

function normalizeHostname(hostname: string): string {
  return hostname.toLowerCase().replace(/^\[/, '').replace(/\]$/, '')
}

function isPrivateIpv4(hostname: string): boolean {
  const parts = hostname.split('.')
  if (parts.length !== 4) return false

  const octets = parts.map(part => Number(part))
  if (octets.some(octet => !Number.isInteger(octet) || octet < 0 || octet > 255)) {
    return false
  }

  const [first, second] = octets
  return first === 10
    || first === 127
    || (first === 172 && second >= 16 && second <= 31)
    || (first === 192 && second === 168)
    || (first === 169 && second === 254)
    || (first === 0)
}

function isBlockedHostname(hostname: string): boolean {
  const normalized = normalizeHostname(hostname)
  const isIpv6 = normalized.includes(':')
  return normalized === 'localhost'
    || normalized.endsWith('.localhost')
    || normalized === '::'
    || normalized === '::1'
    || (isIpv6 && normalized.startsWith('fe80:'))
    || (isIpv6 && normalized.startsWith('fc'))
    || (isIpv6 && normalized.startsWith('fd'))
    || isPrivateIpv4(normalized)
}

export function validateBaseUrl(rawUrl: string): string {
  const trimmed = rawUrl.trim()
  if (!trimmed || trimmed.length > MAX_BASE_URL_LENGTH || hasControlCharacters(trimmed)) {
    throw new Error('Invalid Base URL')
  }

  let parsed: URL
  try {
    parsed = new URL(trimmed)
  } catch {
    throw new Error('Invalid Base URL')
  }

  if (parsed.protocol !== 'https:') {
    throw new Error('Base URL must use HTTPS')
  }
  if (parsed.username || parsed.password || parsed.search || parsed.hash) {
    throw new Error('Invalid Base URL')
  }
  if (isBlockedHostname(parsed.hostname)) {
    throw new Error('Base URL host is not allowed')
  }

  return parsed.toString().replace(/\/+$/g, '')
}

function normalizeBaseUrl(value: unknown): string | undefined {
  const baseUrl = normalizeOptionalString(value, 'Base URL', MAX_BASE_URL_LENGTH)
  return baseUrl ? validateBaseUrl(baseUrl) : undefined
}

function normalizeModel(value: unknown): string | undefined {
  return normalizeOptionalString(value, 'model', MAX_MODEL_LENGTH)
}

function buildCredentialsForStorage(update: CredentialUpdate): SecureCredentials {
  if (!update || typeof update !== 'object') {
    throw new Error('Invalid credentials')
  }

  const existingCredentials = loadCredentials()
  const qaApiKey = normalizeApiKey(update.qaApiKey) || existingCredentials?.qaApiKey
  if (!qaApiKey) {
    throw new Error('API Key is required')
  }

  return {
    qaApiKey,
    qaBaseUrl: normalizeBaseUrl(update.qaBaseUrl),
    qaModel: normalizeModel(update.qaModel),
    qaApiStyle: normalizeApiStyle(update.qaApiStyle),
  }
}

/**
 * Save API credentials securely
 */
export async function saveCredentials(update: CredentialUpdate): Promise<void> {
  if (!safeStorage.isEncryptionAvailable()) {
    console.warn('[SecureStore] Encryption not available, credentials will not be saved')
    throw new Error('Encryption not available on this system')
  }

  const credentials = buildCredentialsForStorage(update)

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

export function loadCredentialMetadata(): PublicCredentials | null {
  const credentials = loadCredentials()
  if (!credentials) return null

  return {
    hasApiKey: Boolean(credentials.qaApiKey),
    qaBaseUrl: credentials.qaBaseUrl,
    qaModel: credentials.qaModel,
    qaApiStyle: coerceStoredApiStyle(credentials.qaApiStyle),
  }
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
export function getBaseUrl(apiStyle: ApiStyle): string {
  const credentials = loadCredentials()
  if (credentials?.qaBaseUrl) {
    return validateBaseUrl(credentials.qaBaseUrl)
  }

  // Fallback to environment variables
  if (process.env.QA_BASE_URL) return validateBaseUrl(process.env.QA_BASE_URL)
  if (process.env.OPENROUTER_BASE_URL) return validateBaseUrl(process.env.OPENROUTER_BASE_URL)

  // Default URLs based on API style
  const defaultUrl = apiStyle === 'anthropic'
    ? 'https://api.minimax.io/anthropic'
    : 'https://openrouter.ai/api/v1'
  return validateBaseUrl(defaultUrl)
}

/**
 * Get chat model with fallback to environment variables
 */
function getDefaultChatModel(apiStyle: ApiStyle, baseUrl?: string): string {
  if (apiStyle === 'anthropic') {
    return 'MiniMax-M2.7'
  }

  return baseUrl?.includes('openrouter.ai')
    ? 'google/gemini-2.0-flash-thinking-exp:free'
    : 'gpt-3.5-turbo'
}

export function getChatModel(apiStyle: ApiStyle): string {
  const credentials = loadCredentials()
  if (credentials?.qaModel) {
    return credentials.qaModel
  }

  // Fallback to environment variable
  if (process.env.QA_MODEL) return process.env.QA_MODEL

  const baseUrl = getBaseUrl(apiStyle)
  return getDefaultChatModel(apiStyle, baseUrl)
}

/**
 * Get API style preference
 */
export function getApiStyle(): ApiStyle {
  const credentials = loadCredentials()
  if (credentials?.qaApiStyle) {
    return coerceStoredApiStyle(credentials.qaApiStyle)
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
