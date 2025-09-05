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
  const userHasUserBreakGlass = userScopes.includes(scopes.breakGlass)
  const userHasTeamBasedBreakGlass = teamIds.some((teamId) =>
    userScopes.includes(`${scopes.breakGlass}:team:${teamId}`)
  )
  const hasServiceOwnerBasedScope = teamIds.some((teamId) =>
    userScopes.includes(`${scopes.serviceOwner}:team:${teamId}`)
  )

  // Prod env and user or member has break glass
  if (
    environment === environments.prod &&
    (userHasUserBreakGlass || userHasTeamBasedBreakGlass)
  ) {
    return true
  }

  // Non-admin can't run shells in admin environments
  if (!userScopes.includes(scopes.admin) && adminEnvs.includes(environment)) {
    return false
  }

  // admin can run shells in admin environments
  if (userScopes.includes(scopes.admin) && adminEnvs.includes(environment)) {
    return true
  }

  // service owners can run shells in lower environments
  if (lowerEnvs.includes(environment) && hasServiceOwnerBasedScope) {
    return true
  }

  return false
}

export { isAllowedTerminalEnvironment }
