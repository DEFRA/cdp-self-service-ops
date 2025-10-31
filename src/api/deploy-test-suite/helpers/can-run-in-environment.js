import { scopes, environments } from '@defra/cdp-validation-kit'

/**
 * Is a user allowed to run a test suite in given environment.
 * @param {string} environment
 * @param {string[]} scope
 * @returns {boolean}
 */
function canRunInEnvironment(environment, scope) {
  if (scope.includes(scopes.admin)) {
    return true
  }
  switch (environment) {
    case environments.infraDev:
    case environments.management:
      return false
    case environments.extTest:
      return scope.includes(scopes.externalTest)
    default:
      return true
  }
}

export { canRunInEnvironment }
