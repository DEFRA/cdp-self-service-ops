import { scopes } from '@defra/cdp-validation-kit'
import { getEntity } from '../../../helpers/portal-backend/get-entity.js'

/**
 * Does a given scope own a test suite.
 * @param {string} testSuite
 * @param {string[]} scope
 * @param {import('pino').Logger} logger
 * @returns {Promise<boolean>}
 */
async function isOwnerOfSuite(testSuite, scope, logger) {
  if (scope.includes(scopes.admin)) {
    return true
  }
  const entity = await getEntity(testSuite, logger)
  return entity?.teams?.some((team) => scope.includes(`team:${team.teamId}`))
}

export { isOwnerOfSuite }
