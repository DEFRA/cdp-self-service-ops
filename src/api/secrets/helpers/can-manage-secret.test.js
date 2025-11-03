import { scopes } from '@defra/cdp-validation-kit'
import { canManageSecretInEnv } from './can-manage-secret.js'

vi.mock('../../../helpers/portal-backend/get-entity.js', () => ({
  getEntity: vi.fn().mockResolvedValue({ teams: [{ teamId: 'tenant-team' }] })
}))

const logger = {
  error: () => {}
}

describe('#canManageSecret', () => {
  test('should return true when user is admin', async () => {
    expect(
      await canManageSecretInEnv('foo', 'dev', [scopes.admin], logger)
    ).toBe(true)
  })

  test('should return false if no-admin deploys to admin envs', async () => {
    expect(
      await canManageSecretInEnv(
        'foo',
        'management',
        ['team:tenant-team'],
        logger
      )
    ).toBe(false)
    expect(
      await canManageSecretInEnv('foo', 'infra-dev', ['team:tenant-team'])
    ).toBe(false)
  })

  test('should return true if tenant owns the service', async () => {
    expect(
      await canManageSecretInEnv('foo', 'dev', ['team:tenant-team'], logger)
    ).toBe(true)
  })
})
