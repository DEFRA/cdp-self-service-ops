import {
  tenantTemplates,
  filterTemplates,
  tenantTemplateLookupSchema
} from './templates.js'
import Joi from 'joi'
import { entitySubTypes, entityTypes, scopes } from '@defra/cdp-validation-kit'

describe('tenantTemplateSchema', () => {
  test('Should validate the template lookup table', () => {
    expect(() =>
      Joi.assert(tenantTemplates, tenantTemplateLookupSchema)
    ).not.toThrow()
  })
})

describe('filterTemplates', () => {
  test('Should filter out restricted templates if user doesnt have required scope', () => {
    const result = filterTemplates({ scopes: [] })
    Object.values(tenantTemplates)
      .filter((t) => t.requiredScope)
      .forEach((t) => expect(result).not.toContainEqual(t))
  })

  test('Should include restricted templates if user has required scope', () => {
    const result = filterTemplates({ scopes: [scopes.restrictedTechPython] })

    expect(result.length).toBe(Object.keys(tenantTemplates).length)
    expect(result).toContain(tenantTemplates['cdp-python-backend-template'])
  })

  test('Should filter by type', () => {
    const result = filterTemplates({ type: entityTypes.microservice })
    expect(result.length).toBeGreaterThan(0)
    expect(result.every((r) => r.entityType === entityTypes.microservice)).toBe(
      true
    )
  })

  test('Should filter by subtype', () => {
    const result = filterTemplates({ subtype: entitySubTypes.performance })
    expect(result.length).toBe(1)
    expect(
      result.every((r) => r.entitySubType === entitySubTypes.performance)
    ).toBe(true)
  })

  test('Should filter on all three', () => {
    const result = filterTemplates({
      scopes: [scopes.restrictedTechPython],
      type: entityTypes.microservice,
      subtype: entitySubTypes.backend
    })
    expect(result.every((r) => r.entityType === entityTypes.microservice)).toBe(
      true
    )
    expect(
      result.every((r) => r.entitySubType === entitySubTypes.backend)
    ).toBe(true)
    expect(
      result.some((r) => r.requiredScope === scopes.restrictedTechPython)
    ).toBe(true)
  })
})
