import { orderedEnvironments } from '~/src/config/environments.js'
import { undeployService } from '~/src/api/undeploy/helpers/undeploy-service-from-environment.js'
import { createLogger } from '~/src/helpers/logging/logger.js'

const logger = createLogger()

/**
 * @param {string} imageName
 * @param {{id: string, displayName: string}} user
 */
async function undeployServiceFromAllEnvironments(imageName, user) {
  await undeployWithId(
    crypto.randomUUID(),
    imageName,
    user,
    orderedEnvironments,
    logger
  )
}

/**
 * @param {string} undeploymentId
 * @param {string} imageName
 * @param {{id: string, displayName: string}} user
 * @param {string[]} orderedEnvironments
 * @param {import("pino").Logger} logger
 */
async function undeployWithId(
  undeploymentId,
  imageName,
  user,
  orderedEnvironments,
  logger
) {
  logger.info(`Undeploying ${imageName} from all environments in progress`)
  for (const environment of orderedEnvironments) {
    await undeployService(undeploymentId, imageName, environment, user, logger)
  }
}

export { undeployServiceFromAllEnvironments, undeployWithId }
