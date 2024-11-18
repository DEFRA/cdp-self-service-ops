import { canAddSecretInEnv } from '~/src/api/secrets/helpers/can-add-secret'
import { config } from '~/src/config'

jest.mock('~/src/api/deploy/helpers/get-repo-teams', () => ({
  getRepoTeams: jest
    .fn()
    .mockResolvedValue([
      { teamId: 'tenant-scope', name: 'Tenant Team', github: '' }
    ])
}))

describe('#canAddSecret', () => {
  it('should return true when user is admin', async () => {
    config.get = jest.fn().mockReturnValue('admin-scope')
    expect(await canAddSecretInEnv('foo', 'dev', ['admin-scope'])).toBe(true)
  })

  test('should return false if no-admin deploys to admin envs', async () => {
    config.get = jest.fn().mockReturnValue('admin-scope')
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
