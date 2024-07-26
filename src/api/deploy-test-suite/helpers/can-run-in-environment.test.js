import { canRunInEnvironment } from '~/src/api/deploy-test-suite/helpers/can-run-in-environment'
import { environments } from '~/src/config'

describe('#can-run-in-environment', () => {
  test('Admin can run everywhere', () => {
    Object.values(environments).forEach((env) => {
      expect(canRunInEnvironment(env, ['1234'], '1234')).toBe(true)
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
      expect(canRunInEnvironment(env, ['0000'], '1234')).toBe(true)
    })

    admin.forEach((env) => {
      expect(canRunInEnvironment(env, ['0000'], '1234')).toBe(false)
    })
  })
})
