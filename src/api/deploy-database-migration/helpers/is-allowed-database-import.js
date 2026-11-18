import { scopes } from '@defra/cdp-validation-kit'
import { betaTesterScope } from '../../../constants/scopes.js'

export function isAllowedDatabaseImport({ userScopes, teamIds }) {
  if (userScopes.includes(scopes.admin)) {
    return true
  }

  const isServiceOwner = teamIds.some((teamId) =>
    userScopes.includes(`${scopes.serviceOwner}:team:${teamId}`)
  )

  return userScopes.includes(betaTesterScope) && isServiceOwner
}

