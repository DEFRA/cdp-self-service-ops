import { orderedEnvironments } from '~/src/config/environments.js'
import { undeployServiceFromEnvironment } from '~/src/api/undeploy/helpers/undeploy-service-from-environment.js'

/**
 * @param {string} serviceName
 * @param {{id: string, displayName: string}} user
 * @param {import("pino").Logger} logger
 */
export async function undeployServiceFromAllEnvironments(
  serviceName,
  user,
  logger
) {
  logger.info(`Undeploying ${serviceName} from all environments in progress`)
  for (const environment of orderedEnvironments) {
    await undeployServiceFromEnvironment(serviceName, environment, user, logger)
  }
}
