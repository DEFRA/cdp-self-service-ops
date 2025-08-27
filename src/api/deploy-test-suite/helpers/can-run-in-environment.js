import { environments } from '../../../config/index.js'
import { scopes } from '@defra/cdp-validation-kit/src/constants/scopes.js'

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
    default:
      return true
  }
}

export { canRunInEnvironment }
