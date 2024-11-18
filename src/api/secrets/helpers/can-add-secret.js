import { config, environments } from '~/src/config'
import { getRepoTeams } from '~/src/api/deploy/helpers/get-repo-teams'

/**
 * Does a given scope own a test suite.
 *
 * @param {string} service
 * @param {string} env
 * @param {string[]} scope
 * @return {Promise<boolean>}
 */
export async function canAddSecretInEnv(service, env, scope) {
  if (scope.includes(config.get('oidcAdminGroupId'))) return true
  if ([environments.infraDev, environments.management].includes(env))
    return false
  const repoTeams = await getRepoTeams(service)
  return repoTeams.some((team) => scope.includes(team.teamId))
}
