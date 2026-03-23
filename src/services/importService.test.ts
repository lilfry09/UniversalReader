import { describe, expect, it } from 'vitest'
import { buildImportPlan, getAllowedImportExtensions, toSupportedFormat } from './importService'

describe('importService', () => {
  it('returns supported plan for epub', () => {
    const plan = buildImportPlan('epub')
    expect(plan.capability).toBe('supported')
    expect(plan.targetFormat).toBe('epub')
    expect(plan.requiresConversion).toBe(false)
    expect(plan.ingestStatus).toBe('ready')
  })

  it('returns convertible plan for docx', () => {
    const plan = buildImportPlan('docx')
    expect(plan.capability).toBe('convertible')
    expect(plan.targetFormat).toBe('md')
    expect(plan.requiresConversion).toBe(true)
    expect(plan.ingestStatus).toBe('converted')
  })

  it('returns unsupported plan for unknown extension', () => {
    const plan = buildImportPlan('exe')
    expect(plan.capability).toBe('unsupported')
    expect(plan.targetFormat).toBeUndefined()
    expect(plan.reason).toBe('unsupported_format')
  })

  it('normalizes extension before mapping format', () => {
    expect(toSupportedFormat('docx')).toBe('md')
    expect(buildImportPlan('.PDF').targetFormat).toBe('pdf')
  })

  it('includes both supported and convertible import extensions', () => {
    const list = getAllowedImportExtensions()
    expect(list).toContain('epub')
    expect(list).toContain('docx')
  })
})
