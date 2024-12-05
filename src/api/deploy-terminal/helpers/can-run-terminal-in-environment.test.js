import { environments } from '~/src/config/index.js'
import { canRunTerminalInEnvironment } from '~/src/api/deploy-terminal/helpers/can-run-terminal-in-environment.js'

describe('#canRunTerminalInEnvironment', () => {
  test('admins can run in all environments except prod', () => {
    const scope = ['admin', 'other-group']
    Object.values(environments).forEach((env) => {
      expect(canRunTerminalInEnvironment(env, scope)).toBe(
        env !== environments.prod
      )
    })
  })

  test('users with breakglass can run in prod', () => {
    const scope = ['breakglass', 'other-group']
    expect(canRunTerminalInEnvironment(environments.prod, scope)).toBe(true)
  })

  test('non-admins cannot run shells in prod, infra-dev or management', () => {
    const nonAdmin = ['other-group']

    const restricted = [
      environments.prod,
      environments.management,
      environments.infraDev
    ]
    const allowed = [environments.test, environments.dev, environments.perfTest]

    restricted.forEach((env) => {
      expect(canRunTerminalInEnvironment(env, nonAdmin)).toBe(false)
    })

    allowed.forEach((env) => {
      expect(canRunTerminalInEnvironment(env, nonAdmin)).toBe(true)
    })
  })
})
