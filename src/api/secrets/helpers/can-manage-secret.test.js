import { scopes } from '@defra/cdp-validation-kit'

import { canManageSecretInEnv } from './can-manage-secret.js'

vi.mock('../../deploy/helpers/get-repo-teams', () => ({
  getRepoTeams: vi
    .fn()
    .mockResolvedValue([
      { teamId: 'tenant-team', name: 'Tenant Team', github: '' }
    ])
}))

describe('#canManageSecret', () => {
  test('should return true when user is admin', async () => {
    expect(await canManageSecretInEnv('foo', 'dev', [scopes.admin])).toBe(true)
  })

  test('should return false if no-admin deploys to admin envs', async () => {
    expect(
      await canManageSecretInEnv('foo', 'management', ['team:tenant-team'])
    ).toBe(false)
    expect(
      await canManageSecretInEnv('foo', 'infra-dev', ['team:tenant-team'])
    ).toBe(false)
  })

  test('should return true if tenant owns the service', async () => {
    expect(await canManageSecretInEnv('foo', 'dev', ['team:tenant-team'])).toBe(
      true
    )
  })
})
