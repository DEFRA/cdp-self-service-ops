import { config, environments } from '~/src/config'

/**
 * Is a user allowed to run a test suite in given environment.
 *
 * @param {string} environment
 * @param {string[]} scope
 * @param {string} adminGroup
 * @return {boolean}
 */
export function canRunShellInEnvironment(
  environment,
  scope,
  adminGroup = config.get('oidcAdminGroupId')
) {
  if (environment === environments.prod) {
    // At some point we might want to provide a break-glass for this
    return false
  }

  if (scope.includes(adminGroup)) {
    return true
  }

  switch (environment) {
    case environments.infraDev:
    case environments.management:
    case environments.prod:
      return false
    default:
      return true
  }
}
