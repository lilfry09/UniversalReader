import { describe, it, expect } from 'vitest'
import type { SourceChunk, QAServiceStatus, QAStatus } from './types'

describe('Types', () => {
  describe('SourceChunk', () => {
    it('should accept valid SourceChunk', () => {
      const chunk: SourceChunk = {
        content: 'Test content',
        source: 'test.pdf'
      }
      expect(chunk.content).toBe('Test content')
      expect(chunk.source).toBe('test.pdf')
    })

    it('should accept SourceChunk with optional page', () => {
      const chunk: SourceChunk = {
        content: 'Test content',
        source: 'test.pdf',
        page: 42
      }
      expect(chunk.page).toBe(42)
    })
  })

  describe('QAStatus', () => {
    it('should accept idle status', () => {
      const status: QAStatus = 'idle'
      expect(status).toBe('idle')
    })

    it('should accept loading status', () => {
      const status: QAStatus = 'loading'
      expect(status).toBe('loading')
    })

    it('should accept ready status', () => {
      const status: QAStatus = 'ready'
      expect(status).toBe('ready')
    })

    it('should accept error status', () => {
      const status: QAStatus = 'error'
      expect(status).toBe('error')
    })
  })

  describe('QAServiceStatus', () => {
    it('should accept minimal status', () => {
      const status: QAServiceStatus = { status: 'idle' }
      expect(status.status).toBe('idle')
    })

    it('should accept status with currentBook', () => {
      const status: QAServiceStatus = {
        status: 'ready',
        currentBook: '/path/to/book.pdf'
      }
      expect(status.currentBook).toBe('/path/to/book.pdf')
    })

    it('should accept status with error', () => {
      const status: QAServiceStatus = {
        status: 'error',
        error: 'Something went wrong'
      }
      expect(status.error).toBe('Something went wrong')
    })

    it('should accept status with chunkCount', () => {
      const status: QAServiceStatus = {
        status: 'ready',
        chunkCount: 100
      }
      expect(status.chunkCount).toBe(100)
    })

    it('should accept full status object', () => {
      const status: QAServiceStatus = {
        status: 'ready',
        currentBook: '/path/to/book.pdf',
        error: undefined,
        chunkCount: 50
      }
      expect(status.status).toBe('ready')
      expect(status.currentBook).toBe('/path/to/book.pdf')
      expect(status.chunkCount).toBe(50)
    })
  })
})
