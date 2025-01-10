import { whatsRunningWhere } from '~/src/helpers/deployments/whats-running-where.js'

/**
 * Finds running/deployment details for service in an environment.
 * @param {string} serviceName
 * @param {string} environment
 */
async function findRunningDetails(serviceName, environment) {
  const details = await whatsRunningWhere(serviceName)
  return details.find((detail) => detail.environment === environment)
}

export { findRunningDetails }
