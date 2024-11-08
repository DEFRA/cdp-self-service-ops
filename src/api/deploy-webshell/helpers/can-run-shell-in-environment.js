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
  adminGroup = config.get('oidc.adminGroupId')
) {
  // No one can run in prod for now.
  if (environment === environments.prod) {
    // At some point we might want to provide a break-glass for this.
    return false
  }

  // Admins can run in all other environments
  if (scope.includes(adminGroup)) {
    return true
  }

  // Non-admin can't run shells in prod or admin environments.
  if (
    environment === environments.infraDev ||
    environment === environments.management
  ) {
    return false
  }

  return true
}
