import { isOwnerOfSuite } from './is-owner-of-suite.js'
import { getRepoTeams } from '../../deploy/helpers/get-repo-teams.js'
import { scopes } from '@defra/cdp-validation-kit'

vi.mock('../../deploy/helpers/get-repo-teams.js', () => ({
  getRepoTeams: vi.fn()
}))

describe('#isOwnerOfSuite', () => {
  test('Should return true if the scope includes admin', async () => {
    const result = await isOwnerOfSuite('test-suite', [scopes.admin])

    expect(result).toBe(true)
  })

  test('Should return false if the scope is empty and does not include admin', async () => {
    getRepoTeams.mockResolvedValue([{ teamId: 'team-1' }])
    const result = await isOwnerOfSuite('test-suite', [])

    expect(result).toBe(false)
  })

  test('Should return true if the user is part of a team owning the suite', async () => {
    getRepoTeams.mockResolvedValue([{ teamId: 'team-1' }])
    const result = await isOwnerOfSuite('test-suite', ['team:team-1'])

    expect(result).toBe(true)
  })

  test('Should return false if the user is not part of any team owning the suite', async () => {
    getRepoTeams.mockResolvedValue([{ teamId: 'team-1' }])
    const result = await isOwnerOfSuite('test-suite', ['team:team-2'])

    expect(result).toBe(false)
  })

  test('Should return false if no teams are associated with the suite', async () => {
    getRepoTeams.mockResolvedValue([])
    const result = await isOwnerOfSuite('test-suite', ['team:team-1'])

    expect(result).toBe(false)
  })
})
