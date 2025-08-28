import { getRepoTeams } from '../../deploy/helpers/get-repo-teams.js'
import { scopes } from '@defra/cdp-validation-kit/src/constants/scopes.js'

/**
 * Does a given scope own a test suite.
 * @param {string} testSuite
 * @param {string[]} scope
 * @returns {Promise<boolean>}
 */
async function isOwnerOfSuite(testSuite, scope) {
  if (scope.includes(scopes.admin)) {
    return true
  }
  const repoTeams = await getRepoTeams(testSuite)
  return repoTeams.some((team) => scope.includes(`team:${team.teamId}`))
}

export { isOwnerOfSuite }
