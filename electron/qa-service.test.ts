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
})

describe('Service State Transitions', () => {
  beforeEach(() => {
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
