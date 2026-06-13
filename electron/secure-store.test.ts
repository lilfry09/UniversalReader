import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('electron', () => ({
  app: {
    getPath: vi.fn(() => process.cwd()),
  },
  safeStorage: {
    isEncryptionAvailable: vi.fn(() => true),
    encryptString: vi.fn((value: string) => Buffer.from(value, 'utf-8')),
    decryptString: vi.fn((value: Buffer) => value.toString('utf-8')),
  },
}))

import {
  clearCredentials,
  loadCredentialMetadata,
  loadCredentials,
  saveCredentials,
  validateBaseUrl,
} from './secure-store'

describe('secure-store', () => {
  afterEach(() => {
    clearCredentials()
  })

  it('does not expose stored API keys through public metadata', async () => {
    await saveCredentials({
      qaApiKey: 'sk-test-key',
      qaBaseUrl: 'https://api.example.com/v1/',
      qaModel: 'custom-model',
      qaApiStyle: 'openai',
    })

    const credentials = loadCredentials()
    const metadata = loadCredentialMetadata()

    expect(credentials?.qaApiKey).toBe('sk-test-key')
    expect(metadata).toEqual({
      hasApiKey: true,
      qaBaseUrl: 'https://api.example.com/v1',
      qaModel: 'custom-model',
      qaApiStyle: 'openai',
    })
    expect(metadata).not.toHaveProperty('qaApiKey')
  })

  it('preserves an existing API key when a later save omits it', async () => {
    await saveCredentials({
      qaApiKey: 'sk-existing-key',
      qaBaseUrl: 'https://api.example.com/v1',
      qaApiStyle: 'openai',
    })

    await saveCredentials({
      qaModel: 'updated-model',
      qaApiStyle: 'anthropic',
    })

    expect(loadCredentials()).toMatchObject({
      qaApiKey: 'sk-existing-key',
      qaModel: 'updated-model',
      qaApiStyle: 'anthropic',
    })
  })

  it('rejects insecure or local Base URLs', () => {
    expect(() => validateBaseUrl('http://api.example.com/v1')).toThrow('HTTPS')
    expect(() => validateBaseUrl('https://localhost:11434/v1')).toThrow('not allowed')
    expect(() => validateBaseUrl('https://127.0.0.1/v1')).toThrow('not allowed')
    expect(() => validateBaseUrl('https://192.168.1.2/v1')).toThrow('not allowed')
    expect(validateBaseUrl('https://fca.example.com/v1')).toBe('https://fca.example.com/v1')
  })
})
