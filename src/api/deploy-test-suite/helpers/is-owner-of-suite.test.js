import { isOwnerOfSuite } from './is-owner-of-suite.js'
import { scopes } from '@defra/cdp-validation-kit'
import { getEntity } from '../../../helpers/portal-backend/get-entity.js'

vi.mock('../../../helpers/portal-backend/get-entity.js', () => ({
  getEntity: vi.fn()
}))

describe('#isOwnerOfSuite', () => {
  test('Should return true if the scope includes admin', async () => {
    const result = await isOwnerOfSuite('test-suite', [scopes.admin])

    expect(result).toBe(true)
  })

  test('Should return false if the scope is empty and does not include admin', async () => {
    getEntity.mockResolvedValue({ teams: [{ teamId: 'team-1' }] })
    const result = await isOwnerOfSuite('test-suite', [])

    expect(result).toBe(false)
  })

  test('Should return true if the user is part of a team owning the suite', async () => {
    getEntity.mockResolvedValue({ teams: [{ teamId: 'team-1' }] })
    const result = await isOwnerOfSuite('test-suite', ['team:team-1'])

    expect(result).toBe(true)
  })

  test('Should return false if the user is not part of any team owning the suite', async () => {
    getEntity.mockResolvedValue({ teams: [{ teamId: 'team-1' }] })
    const result = await isOwnerOfSuite('test-suite', ['team:team-2'])

    expect(result).toBe(false)
  })

  test('Should return false if no teams are associated with the suite', async () => {
    getEntity.mockResolvedValue({ teams: [] })
    const result = await isOwnerOfSuite('test-suite', ['team:team-1'])

    expect(result).toBe(false)
  })
})
