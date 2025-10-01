import { environments, scopes } from '@defra/cdp-validation-kit'

import { canAddEphemeralKey } from './can-add-ephemeral-key.js'

describe('#canAddEphemeralKey', () => {
  test('Should allow adding ephemeral key in production with break glass scope', () => {
    const result = canAddEphemeralKey(environments.prod, [
      `${scopes.breakGlass}:team:platform`
    ])
    expect(result).toBe(true)
  })

  test('Should deny adding ephemeral key in production without break glass scope', () => {
    const result = canAddEphemeralKey(environments.prod, [scopes.admin])
    expect(result).toBe(false)
  })

  test('Should allow adding ephemeral key in non-admin environment with tenant scope', () => {
    const result = canAddEphemeralKey(environments.dev, [scopes.tenant])
    expect(result).toBe(true)
  })

  test('Should deny adding ephemeral key in admin-only environment without admin scope', () => {
    const result = canAddEphemeralKey(environments.management, [scopes.tenant])
    expect(result).toBe(false)
  })

  test('Should sllow adding ephemeral key in admin-only environment with admin scope', () => {
    const result = canAddEphemeralKey(environments.infraDev, [scopes.admin])
    expect(result).toBe(true)
  })

  test('Should deny adding ephemeral key in non-admin environment without tenant scope', () => {
    const result = canAddEphemeralKey(environments.dev, [])
    expect(result).toBe(false)
  })
})
