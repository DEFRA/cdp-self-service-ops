import { scopes } from '@defra/cdp-validation-kit'

import { environments } from '../../../config/index.js'

function isAllowedTerminalEnvironment({ userScopes, environment, teamIds }) {
  const adminEnvs = [environments.infraDev, environments.management]
  const userHasUserBreakGlass = userScopes.includes(scopes.breakGlass)
  const userHasTeamBasedBreakGlass = teamIds.some((teamId) =>
    userScopes.includes(`${scopes.breakGlass}:team:${teamId}`)
  )

  if (
    (userHasUserBreakGlass || userHasTeamBasedBreakGlass) &&
    environment === environments.prod
  ) {
    return true
  }

  // Non-admin can't run shells in admin environments.
  if (adminEnvs.includes(environment) && !userScopes.includes(scopes.admin)) {
    return false
  }

  // admin can run shells in admin environments.
  if (adminEnvs.includes(environment) && userScopes.includes(scopes.admin)) {
    return true
  }

  return false
}

export { isAllowedTerminalEnvironment }
