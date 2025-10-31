import { canRunInEnvironment } from './can-run-in-environment.js'
import { environments } from '../../../config/index.js'
import { scopes } from '@defra/cdp-validation-kit'

describe('#can-run-in-environment', () => {
  test('Admin can run everywhere', () => {
    Object.values(environments).forEach((env) => {
      expect(canRunInEnvironment(env, [scopes.admin])).toBe(true)
    })
  })

  test('Non-admin cannot run in admin envs or ext-test', () => {
    const nonAdmin = [
      environments.prod,
      environments.perfTest,
      environments.test,
      environments.dev
    ]
    const admin = [
      environments.infraDev,
      environments.management,
      environments.extTest
    ]

    nonAdmin.forEach((env) => {
      expect(canRunInEnvironment(env, [scopes.tenant])).toBe(true)
    })

    admin.forEach((env) => {
      expect(canRunInEnvironment(env, [scopes.tenant])).toBe(false)
    })
  })

  test('Non-admin with ext-test permission can run ext-test', () => {
    const nonAdmin = [
      environments.prod,
      environments.perfTest,
      environments.test,
      environments.dev,
      environments.extTest
    ]
    const admin = [environments.infraDev, environments.management]

    nonAdmin.forEach((env) => {
      expect(
        canRunInEnvironment(env, [scopes.tenant, scopes.externalTest])
      ).toBe(true)
    })

    admin.forEach((env) => {
      expect(
        canRunInEnvironment(env, [scopes.tenant, scopes.externalTest])
      ).toBe(false)
    })
  })
})
