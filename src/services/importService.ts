import {
  CONVERTIBLE_IMPORT_EXTENSIONS,
  getDocumentKind,
  getImportCapability,
  isSupportedImportExtension,
  normalizeExtension,
  SUPPORTED_IMPORT_EXTENSIONS,
} from '../domain/document'
import type {
  ConvertibleImportExtension,
  DocumentFormat,
  DocumentKind,
  ImportExtension,
  SupportedImportExtension,
} from '../domain/document'

export type IngestStatus = 'ready' | 'converted'

export interface ImportPlan {
  capability: 'supported' | 'convertible' | 'unsupported'
  sourceFormat: ImportExtension | string
  targetFormat?: DocumentFormat
  documentKind?: DocumentKind
  ingestStatus?: IngestStatus
  requiresConversion: boolean
  reason?: string
}

export function getAllowedImportExtensions(): readonly string[] {
  return [...SUPPORTED_IMPORT_EXTENSIONS, ...CONVERTIBLE_IMPORT_EXTENSIONS]
}

export function toSupportedFormat(sourceFormat: SupportedImportExtension | ConvertibleImportExtension): DocumentFormat {
  if (sourceFormat === 'docx') return 'md'
  return sourceFormat
}

export function buildImportPlan(extension: string): ImportPlan {
  const sourceFormat = normalizeExtension(extension)
  const capability = getImportCapability(sourceFormat)

  if (capability === 'unsupported') {
    return {
      capability,
      sourceFormat,
      requiresConversion: false,
      reason: 'unsupported_format',
    }
  }

  if (isSupportedImportExtension(sourceFormat)) {
    const targetFormat = toSupportedFormat(sourceFormat)
    return {
      capability,
      sourceFormat,
      targetFormat,
      documentKind: getDocumentKind(targetFormat),
      ingestStatus: 'ready',
      requiresConversion: false,
    }
  }

  const targetFormat = toSupportedFormat(sourceFormat as ConvertibleImportExtension)
  return {
    capability,
    sourceFormat,
    targetFormat,
    documentKind: getDocumentKind(targetFormat),
    ingestStatus: 'converted',
    requiresConversion: true,
  }
}
