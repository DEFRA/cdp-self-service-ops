import { scopes } from '@defra/cdp-validation-kit'
import { environments } from '../../../config/index.js'

function isAllowedTerminalEnvironment({ userScopes, environment, teamIds }) {
  const adminEnvs = [environments.infraDev, environments.management]
  const lowerEnvs = [
    environments.dev,
    environments.test,
    environments.perfTest,
    environments.extTest
  ]

  const hasScope = (scope) => userScopes.includes(scope)
  const hasTeamScope = (scope) =>
    teamIds.some((teamId) => hasScope(`${scope}:team:${teamId}`))

  if (
    environment === environments.prod &&
    (hasScope(scopes.breakGlass) || hasTeamScope(scopes.breakGlass))
  ) {
    return true
  }

  if (adminEnvs.includes(environment)) {
    return hasScope(scopes.admin)
  }

  if (lowerEnvs.includes(environment) && hasTeamScope(scopes.serviceOwner)) {
    return true
  }

  return false
}

export { isAllowedTerminalEnvironment }
