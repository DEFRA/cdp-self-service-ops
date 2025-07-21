import { canAddSecretInEnv } from './can-add-secret.js'
import { vi } from 'vitest'

vi.mock('../../deploy/helpers/get-repo-teams', () => ({
  getRepoTeams: vi
    .fn()
    .mockResolvedValue([
      { teamId: 'tenant-scope', name: 'Tenant Team', github: '' }
    ])
}))

describe('#canAddSecret', () => {
  it('should return true when user is admin', async () => {
    expect(await canAddSecretInEnv('foo', 'dev', ['admin'])).toBe(true)
  })

  test('should return false if no-admin deploys to admin envs', async () => {
    expect(await canAddSecretInEnv('foo', 'management', ['tenant-scope'])).toBe(
      false
    )
    expect(await canAddSecretInEnv('foo', 'infra-dev', ['tenant-scope'])).toBe(
      false
    )
  })

  test('should return true if tenant owns the service', async () => {
    expect(await canAddSecretInEnv('foo', 'dev', ['tenant-scope'])).toBe(true)
  })
})
