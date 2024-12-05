import { environments } from '~/src/config/index.js'
import { getRepoTeams } from '~/src/api/deploy/helpers/get-repo-teams.js'

/**
 * Does a given scope own a test suite.
 * @param {string} service
 * @param {string} env
 * @param {string[]} scope
 * @returns {Promise<boolean>}
 */
export async function canAddSecretInEnv(service, env, scope) {
  if (scope.includes('admin')) return true
  if ([environments.infraDev, environments.management].includes(env))
    return false
  const repoTeams = await getRepoTeams(service)
  return repoTeams.some((team) => scope.includes(team.teamId))
}
