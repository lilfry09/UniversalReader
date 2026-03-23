export type DocumentKind = 'flow' | 'paged'

export type DocumentFormat = 'pdf' | 'epub' | 'mobi' | 'azw3' | 'txt' | 'md'

export type SupportedImportExtension = DocumentFormat

export type ConvertibleImportExtension = 'docx'

export type ImportExtension = SupportedImportExtension | ConvertibleImportExtension

export type ReaderEngine = 'pdf' | 'markdown' | 'epub' | 'unsupported'

export const SUPPORTED_IMPORT_EXTENSIONS: readonly SupportedImportExtension[] = [
  'pdf',
  'epub',
  'mobi',
  'azw3',
  'txt',
  'md',
]

export const CONVERTIBLE_IMPORT_EXTENSIONS: readonly ConvertibleImportExtension[] = ['docx']

const FLOW_FORMATS = new Set<DocumentFormat>(['epub', 'mobi', 'azw3', 'txt', 'md'])

export function normalizeExtension(extension: string): string {
  return extension.trim().toLowerCase().replace(/^\./, '')
}

export function isSupportedImportExtension(extension: string): extension is SupportedImportExtension {
  const normalized = normalizeExtension(extension)
  return (SUPPORTED_IMPORT_EXTENSIONS as readonly string[]).includes(normalized)
}

export function isConvertibleImportExtension(extension: string): extension is ConvertibleImportExtension {
  const normalized = normalizeExtension(extension)
  return (CONVERTIBLE_IMPORT_EXTENSIONS as readonly string[]).includes(normalized)
}

export function getImportCapability(extension: string): 'supported' | 'convertible' | 'unsupported' {
  if (isSupportedImportExtension(extension)) return 'supported'
  if (isConvertibleImportExtension(extension)) return 'convertible'
  return 'unsupported'
}

export function getDocumentKind(format: DocumentFormat): DocumentKind {
  return FLOW_FORMATS.has(format) ? 'flow' : 'paged'
}

export function getReaderEngine(format: DocumentFormat): ReaderEngine {
  if (format === 'pdf') return 'pdf'
  if (format === 'md' || format === 'txt') return 'markdown'
  if (format === 'epub' || format === 'mobi' || format === 'azw3') return 'epub'
  return 'unsupported'
}
