import { canAddSecretInEnv } from './can-add-secret.js'
import { vi } from 'vitest'
import { scopes } from '@defra/cdp-validation-kit/src/constants/scopes.js'

vi.mock('../../deploy/helpers/get-repo-teams', () => ({
  getRepoTeams: vi
    .fn()
    .mockResolvedValue([
      { teamId: 'tenant-team', name: 'Tenant Team', github: '' }
    ])
}))

describe('#canAddSecret', () => {
  it('should return true when user is admin', async () => {
    expect(await canAddSecretInEnv('foo', 'dev', [scopes.admin])).toBe(true)
  })

  test('should return false if no-admin deploys to admin envs', async () => {
    expect(await canAddSecretInEnv('foo', 'management', ['tenant-team'])).toBe(
      false
    )
    expect(await canAddSecretInEnv('foo', 'infra-dev', ['tenant-team'])).toBe(
      false
    )
  })

  test('should return true if tenant owns the service', async () => {
    expect(await canAddSecretInEnv('foo', 'dev', ['team:tenant-team'])).toBe(
      true
    )
  })
})
