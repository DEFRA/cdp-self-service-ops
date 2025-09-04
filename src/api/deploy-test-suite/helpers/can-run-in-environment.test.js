import { describe, expect, test } from 'vitest'
import { canRunInEnvironment } from './can-run-in-environment.js'
import { environments } from '../../../config/index.js'
import { scopes } from '@defra/cdp-validation-kit'

describe('#can-run-in-environment', () => {
  test('Admin can run everywhere', () => {
    Object.values(environments).forEach((env) => {
      expect(canRunInEnvironment(env, [scopes.admin])).toBe(true)
    })
  })

  test('Non-admin cannot run in admin envs', () => {
    const nonAdmin = [
      environments.prod,
      environments.perfTest,
      environments.test,
      environments.dev
    ]
    const admin = [environments.infraDev, environments.management]

    nonAdmin.forEach((env) => {
      expect(canRunInEnvironment(env, ['not-admin'])).toBe(true)
    })

    admin.forEach((env) => {
      expect(canRunInEnvironment(env, ['not-admin'])).toBe(false)
    })
  })
})
