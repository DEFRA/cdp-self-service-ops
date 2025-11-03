import { adminOnlyEnvironments, scopes } from '@defra/cdp-validation-kit'
import { getEntity } from '../../../helpers/portal-backend/get-entity.js'

/**
 * Does user have permission to manage secrets for this service in this environment?
 * @param {string} service
 * @param {string} env
 * @param {string[]} scope
 * @param {import('pino').Logger} logger
 * @returns {Promise<boolean>}
 */
export async function canManageSecretInEnv(service, env, scope, logger) {
  if (scope.includes(scopes.admin)) {
    return true
  }
  if (adminOnlyEnvironments.includes(env)) {
    return false
  }

  const entity = await getEntity(service, logger)
  return entity?.teams?.some((team) => scope.includes(`team:${team.teamId}`))
}
