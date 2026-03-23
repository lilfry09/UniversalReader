import { describe, expect, it } from 'vitest'
import {
  getDocumentKind,
  getImportCapability,
  getReaderEngine,
  isSupportedImportExtension,
  normalizeExtension,
} from './document'

describe('document domain helpers', () => {
  it('normalizes extension values', () => {
    expect(normalizeExtension('.EPUB')).toBe('epub')
    expect(normalizeExtension('  PDF ')).toBe('pdf')
  })

  it('classifies import support correctly', () => {
    expect(getImportCapability('epub')).toBe('supported')
    expect(getImportCapability('docx')).toBe('convertible')
    expect(getImportCapability('exe')).toBe('unsupported')
  })

  it('checks supported extension guard', () => {
    expect(isSupportedImportExtension('mobi')).toBe(true)
    expect(isSupportedImportExtension('docx')).toBe(false)
  })

  it('maps document kinds', () => {
    expect(getDocumentKind('pdf')).toBe('paged')
    expect(getDocumentKind('epub')).toBe('flow')
  })

  it('maps reader engines', () => {
    expect(getReaderEngine('pdf')).toBe('pdf')
    expect(getReaderEngine('md')).toBe('markdown')
    expect(getReaderEngine('azw3')).toBe('epub')
  })
})
