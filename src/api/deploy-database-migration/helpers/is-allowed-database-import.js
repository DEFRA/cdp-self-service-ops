import { scopes } from '@defra/cdp-validation-kit'
import { environments } from '../../../config/index.js'
import { betaTesterScope } from '../../../constants/scopes.js'

const adminEnvs = [environments.infraDev, environments.management]

export function isAllowedDatabaseImport({ userScopes, teamIds, environment }) {
  if (userScopes.includes(scopes.admin)) {
    return true
  }

  if (adminEnvs.includes(environment)) {
    return false
  }

  const isServiceOwner = teamIds.some((teamId) =>
    userScopes.includes(`${scopes.serviceOwner}:team:${teamId}`)
  )

  return userScopes.includes(betaTesterScope) && isServiceOwner
}
