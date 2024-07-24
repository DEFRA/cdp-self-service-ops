import { config } from '~/src/config'
import { getRepoTeams } from '~/src/api/deploy/helpers/get-repo-teams'

/**
 * Does a given scope own a test suite.
 *
 * @param {string} testSuite
 * @param {string[]} scope
 * @return {Promise<boolean>}
 */
async function isOwnerOfSuite(testSuite, scope) {
  if (scope.includes(config.get('oidcAdminGroupId'))) return true
  const repoTeams = await getRepoTeams(testSuite)
  return repoTeams.some((team) => scope.includes(team.teamId))
}

export { isOwnerOfSuite }
