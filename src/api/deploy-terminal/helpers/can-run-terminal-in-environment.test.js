import { describe, expect, test } from 'vitest'
import { environments } from '../../../config/index.js'
import { canRunTerminalInEnvironment } from './can-run-terminal-in-environment.js'

describe('#canRunTerminalInEnvironment', () => {
  test('admins can run in all environments except prod', () => {
    const scope = ['admin', 'otherGroup']
    Object.values(environments).forEach((env) => {
      expect(canRunTerminalInEnvironment(env, scope)).toBe(
        env !== environments.prod
      )
    })
  })

  test('users with break glass can run in prod', () => {
    const scope = ['breakGlass', 'otherGroup']
    expect(canRunTerminalInEnvironment(environments.prod, scope)).toBe(true)
  })

  test('non-admins cannot run shells in prod, infra-dev or management', () => {
    const nonAdmin = ['otherGroup']

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
