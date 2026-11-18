import { scopes } from '@defra/cdp-validation-kit'
import { isAllowedDatabaseImport } from './is-allowed-database-import.js'
import { betaTesterScope } from '../../../constants/scopes.js'

const teamIds = ['team-1']
const ownerScope = `${scopes.serviceOwner}:team:team-1`

describe('#isAllowedDatabaseImport', () => {
  test('Should allow an admin', () => {
    expect(
      isAllowedDatabaseImport({ userScopes: [scopes.admin], teamIds })
    ).toBe(true)
  })

  test('Should allow a beta tester who owns the service', () => {
    expect(
      isAllowedDatabaseImport({
        userScopes: [betaTesterScope, ownerScope],
        teamIds
      })
    ).toBe(true)
  })

  test('Should reject a service owner without beta', () => {
    expect(isAllowedDatabaseImport({ userScopes: [ownerScope], teamIds })).toBe(
      false
    )
  })

  test('Should reject a beta tester who owns a different service', () => {
    expect(
      isAllowedDatabaseImport({
        userScopes: [betaTesterScope, `${scopes.serviceOwner}:team:other`],
        teamIds
      })
    ).toBe(false)
  })

  test('Should reject a beta tester when the service has no teams', () => {
    expect(
      isAllowedDatabaseImport({
        userScopes: [betaTesterScope, ownerScope],
        teamIds: []
      })
    ).toBe(false)
  })
})
