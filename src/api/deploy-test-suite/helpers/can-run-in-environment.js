import { config, environments } from '~/src/config/index.js'

/**
 * Is a user allowed to run a test suite in given environment.
 * @param {string} environment
 * @param {string[]} scope
 * @param {string} adminGroup
 * @return {boolean}
 */
function canRunInEnvironment(
  environment,
  scope,
  adminGroup = config.get('oidc.adminGroupId')
) {
  if (scope.includes(adminGroup)) {
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
