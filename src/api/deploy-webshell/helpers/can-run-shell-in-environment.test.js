import { canRunShellInEnvironment } from '~/src/api/deploy-webshell/helpers/can-run-shell-in-environment'
import { environments } from '~/src/config'

describe('#canRunShellInEnvironment', () => {
  test('admins can run in all environments except prod', () => {
    const adminGroup = 'admin-group'
    const scope = [adminGroup, 'other-group']
    Object.values(environments).forEach((env) => {
      expect(canRunShellInEnvironment(env, scope, adminGroup)).toBe(
        env !== environments.prod
      )
    })
  })

  test('non-admins cannot run shells in prod, infra-dev or management', () => {
    const adminGroup = 'admin-group'
    const nonAdmin = ['other-group']

    const restricted = [
      environments.prod,
      environments.management,
      environments.infraDev
    ]
    const allowed = [environments.test, environments.dev, environments.perfTest]

    restricted.forEach((env) => {
      expect(canRunShellInEnvironment(env, nonAdmin, adminGroup)).toBe(false)
    })

    allowed.forEach((env) => {
      expect(canRunShellInEnvironment(env, nonAdmin, adminGroup)).toBe(true)
    })
  })
})
