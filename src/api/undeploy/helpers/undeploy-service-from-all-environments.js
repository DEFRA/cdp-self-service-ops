import { orderedEnvironments } from '~/src/config/environments.js'
import { undeployServiceFromEnvironment } from '~/src/api/undeploy/helpers/undeploy-service-from-environment.js'
import { createLogger } from '~/src/helpers/logging/logger.js'

/**
 * @param {string} serviceName
 * @param {{id: string, displayName: string}} user
 * @param {string} undeploymentId
 * @param {string[]} environments
 * @param {import("pino").Logger} logger
 */
export async function undeployServiceFromAllEnvironments({
  serviceName,
  user,
  undeploymentId = crypto.randomUUID(),
  environments = orderedEnvironments,
  logger = createLogger()
}) {
  logger.info(`Undeploying ${serviceName} from all environments in progress`)
  for (const environment of environments) {
    await undeployServiceFromEnvironment({
      serviceName,
      environment,
      user,
      undeploymentId,
      logger
    })
  }
}
