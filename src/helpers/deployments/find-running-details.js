import { fetchRunningServices } from '~/src/helpers/deployments/fetch-running-services.js'

/**
 * Finds running/deployment details for service in an environment.
 * @param {string} serviceName
 * @param {string} environment
 */
async function findRunningDetails(serviceName, environment) {
  const details = await fetchRunningServices(serviceName)
  return details.find((detail) => detail.environment === environment)
}

export { findRunningDetails }
