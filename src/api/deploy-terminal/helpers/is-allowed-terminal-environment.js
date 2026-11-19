import { scopes } from '@defra/cdp-validation-kit'
import { environments } from '../../../config/index.js'
import { toolConfig } from './tool-config.js'

function hasBreakGlassScope({ userScopes, teamIds }) {
  return (
    userScopes.includes(scopes.breakGlass) ||
    teamIds.some((teamId) =>
      userScopes.includes(`${scopes.breakGlass}:team:${teamId}`)
    )
  )
}

function isAllowedTerminalEnvironment({
  userScopes,
  environment,
  teamIds,
  tool
}) {
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

  if (hasScope(scopes.admin)) {
    return true
  }

  if (environment === environments.prod) {
    if (hasBreakGlassScope({ userScopes, teamIds })) {
      return true
    }

    return (
      toolConfig[tool]?.allowInProdWithoutBreakGlass === true &&
      hasTeamScope(scopes.serviceOwner)
    )
  }

  if (adminEnvs.includes(environment)) {
    return hasScope(scopes.admin)
  }

  if (lowerEnvs.includes(environment) && hasTeamScope(scopes.serviceOwner)) {
    return true
  }

  return false
}

export { isAllowedTerminalEnvironment, hasBreakGlassScope }
