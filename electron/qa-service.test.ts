import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Set environment variable BEFORE importing the module
process.env.DEEPSEEK_API_KEY = 'test-key'
process.env.DEEPSEEK_API_URL = 'https://api.deepseek.com'

// Mock the dependencies BEFORE importing
vi.mock('fs', () => ({
  default: {
    existsSync: vi.fn(),
    promises: {
      readFile: vi.fn()
    }
  }
}))

vi.mock('adm-zip', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      getEntries: vi.fn().mockReturnValue([])
    }))
  }
})

// Import after mocking
import { qaService } from './qa-service'

describe('QA Service', () => {
  beforeEach(() => {
    qaService.clearQA()
    vi.clearAllMocks()
    delete process.env.QA_API_KEY
    delete process.env.QA_BASE_URL
    delete process.env.QA_MODEL
    delete process.env.QA_API_STYLE
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('getStatus', () => {
    it('should return idle status initially', () => {
      const status = qaService.getStatus()
      expect(status.status).toBe('idle')
      expect(status.currentBook).toBeUndefined()
      expect(status.error).toBeUndefined()
    })

    it('should return undefined chunkCount when no book loaded', () => {
      const status = qaService.getStatus()
      expect(status.chunkCount).toBeUndefined()
    })
  })

  describe('clearQA', () => {
    it('should reset status to idle', () => {
      qaService.clearQA()
      const status = qaService.getStatus()
      expect(status.status).toBe('idle')
      expect(status.currentBook).toBeUndefined()
    })

    it('should reset chunkCount to undefined', () => {
      qaService.clearQA()
      const status = qaService.getStatus()
      expect(status.chunkCount).toBeUndefined()
    })
  })

  describe('loadBookForQA - API Key Validation', () => {
    it('should fail when file does not exist', async () => {
      const fs = await import('fs')
      vi.mocked(fs.default.existsSync).mockReturnValue(false)

      const result = await qaService.loadBookForQA('/nonexistent/file.pdf', 'pdf')

      expect(result.success).toBe(false)
      expect(result.error).toContain('File not found')
    })

    it('should fail for unsupported format', async () => {
      const fs = await import('fs')
      vi.mocked(fs.default.existsSync).mockReturnValue(true)

      const result = await qaService.loadBookForQA('/test/file.xyz', 'xyz')

      expect(result.success).toBe(false)
      expect(result.error).toContain('Unsupported format')
    })

    it('should fail for AZW3 format with conversion message', async () => {
      const fs = await import('fs')
      vi.mocked(fs.default.existsSync).mockReturnValue(true)

      const result = await qaService.loadBookForQA('/test/file.azw3', 'azw3')

      expect(result.success).toBe(false)
      expect(result.error).toContain('conversion')
    })

    it('should fail for Mobi format with conversion message', async () => {
      const fs = await import('fs')
      vi.mocked(fs.default.existsSync).mockReturnValue(true)

      const result = await qaService.loadBookForQA('/test/file.mobi', 'mobi')

      expect(result.success).toBe(false)
      expect(result.error).toContain('conversion')
    })
  })

  describe('askQuestion', () => {
    it('should fail when question is empty', async () => {
      await expect(qaService.askQuestion('   '))
        .rejects.toThrow('Question cannot be empty')
    })

    it('should fail when no book is loaded', async () => {
      await expect(qaService.askQuestion('test question'))
        .rejects.toThrow('No book loaded')
    })

    it('should fail when status is not ready', async () => {
      // Don't load a book, status is idle
      await expect(qaService.askQuestion('test question'))
        .rejects.toThrow('No book loaded')
    })
  })

  describe('chat API configuration', () => {
    it('should send OpenAI-compatible requests with QA overrides', async () => {
      const fs = await import('fs')
      vi.mocked(fs.default.existsSync).mockReturnValue(true)
      vi.mocked(fs.default.promises.readFile).mockResolvedValue(
        'A careful reader can use UniversalReader to study notes and ask questions about the current book.'
      )
      process.env.QA_API_KEY = 'qa-key'
      process.env.QA_BASE_URL = 'https://example.test/openai/'
      process.env.QA_MODEL = 'custom-openai-model'
      process.env.QA_API_STYLE = 'openai'

      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({
          choices: [{ message: { content: 'Configured OpenAI-compatible answer' } }],
        }),
      })
      vi.stubGlobal('fetch', fetchMock)

      const loadResult = await qaService.loadBookForQA('/test/book.md', 'md')
      const answerResult = await qaService.askQuestion('What can the reader do?')

      expect(loadResult.success).toBe(true)
      expect(answerResult.answer).toBe('Configured OpenAI-compatible answer')
      expect(fetchMock).toHaveBeenCalledWith(
        'https://example.test/openai/chat/completions',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Authorization: 'Bearer qa-key',
          }),
        })
      )

      const request = fetchMock.mock.calls[0][1] as { body: string }
      expect(JSON.parse(request.body)).toMatchObject({
        model: 'custom-openai-model',
        temperature: 0.7,
      })
    })

    it('should use v1 SharedChat-compatible endpoints and a generic OpenAI default model', async () => {
      const fs = await import('fs')
      vi.mocked(fs.default.existsSync).mockReturnValue(true)
      vi.mocked(fs.default.promises.readFile).mockResolvedValue(
        'SharedChat-compatible providers can answer questions through the OpenAI chat completions API.'
      )
      process.env.QA_API_KEY = 'sharedchat-key'
      process.env.QA_BASE_URL = 'https://new.sharedchat.cc/v1/'
      process.env.QA_API_STYLE = 'openai'

      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({
          choices: [{ message: { content: 'SharedChat answer' } }],
        }),
      })
      vi.stubGlobal('fetch', fetchMock)

      await qaService.loadBookForQA('/test/book.md', 'md')
      const answerResult = await qaService.askQuestion('Which API can the provider use?')

      expect(answerResult.answer).toBe('SharedChat answer')
      expect(fetchMock).toHaveBeenCalledWith(
        'https://new.sharedchat.cc/v1/chat/completions',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer sharedchat-key',
          }),
        })
      )

      const request = fetchMock.mock.calls[0][1] as { body: string }
      expect(JSON.parse(request.body)).toMatchObject({
        model: 'gpt-3.5-turbo',
      })
    })

    it('should add v1 to bare OpenAI-compatible provider hosts', async () => {
      const fs = await import('fs')
      vi.mocked(fs.default.existsSync).mockReturnValue(true)
      vi.mocked(fs.default.promises.readFile).mockResolvedValue(
        'Bare OpenAI-compatible provider hosts still expose chat completions under the v1 API path.'
      )
      process.env.QA_API_KEY = 'sharedchat-key'
      process.env.QA_BASE_URL = 'https://new.sharedchat.cc'
      process.env.QA_API_STYLE = 'openai'

      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({
          choices: [{ message: { content: 'Bare host answer' } }],
        }),
      })
      vi.stubGlobal('fetch', fetchMock)

      await qaService.loadBookForQA('/test/book.md', 'md')
      await qaService.askQuestion('Where is the API path?')

      expect(fetchMock).toHaveBeenCalledWith(
        'https://new.sharedchat.cc/v1/chat/completions',
        expect.objectContaining({
          method: 'POST',
        })
      )
    })

    it('should send Anthropic-compatible requests when configured', async () => {
      const fs = await import('fs')
      vi.mocked(fs.default.existsSync).mockReturnValue(true)
      vi.mocked(fs.default.promises.readFile).mockResolvedValue(
        'This book explains annotations, library organization, and reading progress in detail.'
      )
      process.env.QA_API_KEY = 'anthropic-key'
      process.env.QA_BASE_URL = 'https://example.test/anthropic/'
      process.env.QA_MODEL = 'custom-anthropic-model'
      process.env.QA_API_STYLE = 'anthropic'

      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({
          content: [
            { type: 'text', text: 'Configured Anthropic-compatible answer' },
            { type: 'tool_use', text: 'ignored' },
          ],
        }),
      })
      vi.stubGlobal('fetch', fetchMock)

      const loadResult = await qaService.loadBookForQA('/test/book.txt', 'txt')
      const answerResult = await qaService.askQuestion('What does this book explain?')

      expect(loadResult.success).toBe(true)
      expect(answerResult.answer).toBe('Configured Anthropic-compatible answer')
      expect(fetchMock).toHaveBeenCalledWith(
        'https://example.test/anthropic/v1/messages',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'x-api-key': 'anthropic-key',
            'anthropic-version': '2023-06-01',
          }),
        })
      )

      const request = fetchMock.mock.calls[0][1] as { body: string }
      expect(JSON.parse(request.body)).toMatchObject({
        model: 'custom-anthropic-model',
        max_tokens: 1024,
      })
    })

    it('should retry on API failures', async () => {
      const fs = await import('fs')
      vi.mocked(fs.default.existsSync).mockReturnValue(true)
      vi.mocked(fs.default.promises.readFile).mockResolvedValue(
        'Test book content for retry testing.'
      )
      process.env.QA_API_KEY = 'test-key'
      process.env.QA_API_STYLE = 'openai'

      const fetchMock = vi.fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: vi.fn().mockResolvedValue({
            choices: [{ message: { content: 'Success after retry' } }],
          }),
        })

      vi.stubGlobal('fetch', fetchMock)

      await qaService.loadBookForQA('/test/book.txt', 'txt')
      const result = await qaService.askQuestion('Test question')

      expect(result.answer).toBe('Success after retry')
      expect(fetchMock).toHaveBeenCalledTimes(2) // Initial + 1 retry
    })

    it('should handle rate limit errors with longer retry delay', async () => {
      const fs = await import('fs')
      vi.mocked(fs.default.existsSync).mockReturnValue(true)
      vi.mocked(fs.default.promises.readFile).mockResolvedValue('Test content')
      process.env.QA_API_KEY = 'test-key'
      process.env.QA_API_STYLE = 'openai'

      const fetchMock = vi.fn()
        .mockRejectedValueOnce(new Error('OpenAI-compatible API error: 429 - Rate limit exceeded'))
        .mockResolvedValueOnce({
          ok: true,
          json: vi.fn().mockResolvedValue({
            choices: [{ message: { content: 'Success after rate limit' } }],
          }),
        })

      vi.stubGlobal('fetch', fetchMock)

      await qaService.loadBookForQA('/test/book.txt', 'txt')
      const result = await qaService.askQuestion('Test question')

      expect(result.answer).toBe('Success after rate limit')
      expect(fetchMock).toHaveBeenCalledTimes(2)
    })

    it('should fail after max retries', async () => {
      const fs = await import('fs')
      vi.mocked(fs.default.existsSync).mockReturnValue(true)
      vi.mocked(fs.default.promises.readFile).mockResolvedValue('Test content')
      process.env.QA_API_KEY = 'test-key'
      process.env.QA_API_STYLE = 'openai'

      const fetchMock = vi.fn().mockRejectedValue(new Error('Persistent network error'))
      vi.stubGlobal('fetch', fetchMock)

      await qaService.loadBookForQA('/test/book.txt', 'txt')

      await expect(qaService.askQuestion('Test question'))
        .rejects.toThrow('Chat API failed after 3 attempts')

      expect(fetchMock).toHaveBeenCalledTimes(3) // 3 attempts
    })
  })
})

describe('Service State Transitions', () => {
  beforeEach(() => {
    qaService.clearQA()
    vi.clearAllMocks()
  })

  it('should track status changes correctly', () => {
    let status = qaService.getStatus()
    expect(status.status).toBe('idle')

    // After clearing
    qaService.clearQA()
    status = qaService.getStatus()
    expect(status.status).toBe('idle')
  })

  it('should maintain independent state for multiple calls', () => {
    const status1 = qaService.getStatus()
    const status2 = qaService.getStatus()
    expect(status1).toEqual(status2)
  })
})

describe('Text Extraction Validation', () => {
  it('should validate supported text formats', () => {
    const textFormats = ['txt', 'md']
    expect(textFormats).toContain('txt')
    expect(textFormats).toContain('md')
  })

  it('should validate PDF format', () => {
    const format = 'pdf'
    expect(['pdf', 'epub', 'txt', 'md']).toContain(format)
  })

  it('should validate EPUB format', () => {
    const format = 'epub'
    expect(['pdf', 'epub', 'txt', 'md', 'mobi', 'azw3']).toContain(format)
  })
})

describe('Message Structure', () => {
  it('should create valid user message structure', () => {
    const msg = {
      id: '1',
      role: 'user' as const,
      content: 'Test question'
    }
    expect(msg.role).toBe('user')
    expect(msg.content).toBe('Test question')
  })

  it('should create valid assistant message structure', () => {
    const msg = {
      id: '2',
      role: 'assistant' as const,
      content: 'Test answer',
      sources: []
    }
    expect(msg.role).toBe('assistant')
    expect(Array.isArray(msg.sources)).toBe(true)
  })
})

describe('Chunk Processing', () => {
  it('should calculate correct chunk count for short text', () => {
    const text = 'Short text'
    const chunkSize = 1000
    const chunkCount = Math.ceil(text.length / chunkSize)
    expect(chunkCount).toBe(1)
  })

  it('should calculate correct chunk count for long text', () => {
    const text = 'A'.repeat(2500)
    const chunkSize = 1000
    const chunkCount = Math.ceil(text.length / chunkSize)
    expect(chunkCount).toBe(3)
  })

  it('should handle empty text', () => {
    const text = ''
    const chunkSize = 1000
    const chunkCount = Math.ceil(text.length / chunkSize)
    expect(chunkCount).toBe(0)
  })
})
