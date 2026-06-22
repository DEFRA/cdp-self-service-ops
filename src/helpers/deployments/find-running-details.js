import { fetchRunningServices } from './fetch-running-services.js'

/**
 * Finds running/deployment details for service in an environment.
 * @param {string} serviceName
 * @param {string} environment
 * @return {Promise<{cdpDeploymentId: string, environment: string, service: string, version: string, cpu: string, memory: string, instanceCount: number, configVersion: string, status: string}|null>}
 */
async function findRunningDetails(serviceName, environment) {
  const details = await fetchRunningServices(serviceName)
  return details.find((detail) => detail.environment === environment)
}

export { findRunningDetails }
