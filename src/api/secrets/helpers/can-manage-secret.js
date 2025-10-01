import { getRepoTeams } from '../../deploy/helpers/get-repo-teams.js'
import { scopes, adminOnlyEnvironments } from '@defra/cdp-validation-kit'

/**
 * Does user have permission to manage secrets for this service in this environment?
 * @param {string} service
 * @param {string} env
 * @param {string[]} scope
 * @returns {Promise<boolean>}
 */
export async function canManageSecretInEnv(service, env, scope) {
  if (scope.includes(scopes.admin)) {
    return true
  }
  if (adminOnlyEnvironments.includes(env)) {
    return false
  }
  const repoTeams = await getRepoTeams(service)
  return repoTeams.some((team) => scope.includes(`team:${team.teamId}`))
}
