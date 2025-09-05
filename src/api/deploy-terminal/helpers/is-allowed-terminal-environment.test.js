import { scopes } from '@defra/cdp-validation-kit'

import { isAllowedTerminalEnvironment } from './is-allowed-terminal-environment.js'
import { environments } from '../../../config/index.js'

describe('#isAllowedTerminalEnvironment', () => {
  test('Should allow access to production with user break glass scope', () => {
    const result = isAllowedTerminalEnvironment({
      userScopes: [scopes.breakGlass],
      environment: environments.prod,
      teamIds: []
    })

    expect(result).toBe(true)
  })

  test('Should allow access to production with team-based break glass scope', () => {
    const result = isAllowedTerminalEnvironment({
      userScopes: [`${scopes.breakGlass}:team:platform`],
      environment: environments.prod,
      teamIds: ['platform']
    })

    expect(result).toBe(true)
  })

  test('Should deny access to production without break glass scope', () => {
    const result = isAllowedTerminalEnvironment({
      userScopes: [],
      environment: environments.prod,
      teamIds: []
    })

    expect(result).toBe(false)
  })

  test('Should deny access to admin environments without admin scope', () => {
    const result = isAllowedTerminalEnvironment({
      userScopes: [],
      environment: environments.infraDev,
      teamIds: []
    })

    expect(result).toBe(false)
  })

  test('Should allow access to admin environments with admin scope', () => {
    const result = isAllowedTerminalEnvironment({
      userScopes: [scopes.admin],
      environment: environments.management,
      teamIds: []
    })

    expect(result).toBe(true)
  })

  test('Should deny access to admin environments with unrelated scopes', () => {
    const result = isAllowedTerminalEnvironment({
      userScopes: [scopes.breakGlass],
      environment: environments.management,
      teamIds: []
    })

    expect(result).toBe(false)
  })

  test('Should allow access to lower environments', () => {
    const result = isAllowedTerminalEnvironment({
      userScopes: [
        'permission:serviceOwner:team:forms',
        'team:forms',
        'user:01b99595-27b5-4ab0-9807-f104c09d2cd0'
      ],
      environment: environments.dev,
      teamIds: ['forms']
    })

    expect(result).toBe(true)
  })

  test('Should not allow access to lower environments for non service owner', () => {
    const result = isAllowedTerminalEnvironment({
      userScopes: [
        'permission:serviceOwner:team:forms',
        'team:forms',
        'user:01b99595-27b5-4ab0-9807-f104c09d2cd0'
      ],
      environment: environments.dev,
      teamIds: ['platform']
    })

    expect(result).toBe(false)
  })
})
