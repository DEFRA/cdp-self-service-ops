import Boom from '@hapi/boom'
import { getScopedUser } from './get-scoped-user.js'
import { getEntity } from '../portal-backend/get-entity.js'

vi.mock('../portal-backend/get-entity.js', () => ({
  getEntity: vi.fn()
}))

const logger = {
  error: () => {}
}

describe('#getScopedUser', () => {
  test('Should return user details for admin users', async () => {
    const auth = {
      credentials: {
        scopeFlags: { isAdmin: true },
        displayName: 'Admin User',
        id: 'admin-id',
        scope: []
      }
    }
    const result = await getScopedUser('service-name', auth, logger)

    expect(result).toEqual({ id: 'admin-id', displayName: 'Admin User' })
  })

  test('Should throw forbidden error if no scope is found for non-admin users', async () => {
    const auth = {
      credentials: {
        scopeFlags: { isAdmin: false },
        displayName: 'Non-Admin User',
        id: 'user-id',
        scope: null
      }
    }

    await expect(
      getScopedUser('service-name', auth, logger)
    ).rejects.toThrowError(Boom.forbidden('No scope found'))
  })

  test('Should throw forbidden error if user is not a team member', async () => {
    getEntity.mockResolvedValue({ teams: [{ teamId: 'team-1' }] })

    const auth = {
      credentials: {
        scopeFlags: { isAdmin: false },
        displayName: 'Non-Team User',
        id: 'user-id',
        scope: ['team:team-2']
      }
    }

    await expect(
      getScopedUser('service-name', auth, logger)
    ).rejects.toThrowError(Boom.forbidden('Insufficient scope'))
  })

  test('Should return user details if user is a team member', async () => {
    getEntity.mockResolvedValue({ teams: [{ teamId: 'team-1' }] })

    const auth = {
      credentials: {
        scopeFlags: { isAdmin: false },
        displayName: 'Team Member',
        id: 'user-id',
        scope: ['team:team-1']
      }
    }

    const result = await getScopedUser('service-name', auth, logger)
    expect(result).toEqual({ id: 'user-id', displayName: 'Team Member' })
  })
})
