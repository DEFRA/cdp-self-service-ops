import { environments } from '../../../config/index.js'
import { scopes } from '@defra/cdp-validation-kit/src/constants/scopes.js'

export function canRunTerminalInEnvironment(environment, scope) {
  if (!scope.includes('breakGlass') && environment === environments.prod) {
    return false
  }

  // Admins can run in all other environments
  if (scope.includes(scopes.admin)) {
    return true
  }

  // Non-admin can't run shells in prod or admin environments.
  return !(
    environment === environments.infraDev ||
    environment === environments.management
  )
}
