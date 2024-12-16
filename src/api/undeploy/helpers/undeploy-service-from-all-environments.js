import { environments, orderedEnvironments } from '~/src/config/environments.js'
import { undeployServiceFromEnvironmentWithId } from '~/src/api/undeploy/helpers/undeploy-service-from-environment.js'
import { createLogger } from '~/src/helpers/logging/logger.js'

const logger = createLogger()

/**
 * @param {string} imageName
 * @param {{id: string, displayName: string}} user
 */
async function undeployServiceFromAllEnvironments(imageName, user) {
  await undeployWithId(crypto.randomUUID(), imageName, user)
}

/**
 * @param {string} undeploymentId
 * @param {string} imageName
 * @param {{id: string, displayName: string}} user
 */
async function undeployWithId(undeploymentId, imageName, user) {
  logger.info(`Undeploying ${imageName} from all environments in progress`)
  for (const environment of orderedEnvironments) {
    await undeployServiceFromEnvironmentWithId(
      undeploymentId,
      imageName,
      environments[environment],
      user
    )
  }
}

export { undeployServiceFromAllEnvironments, undeployWithId }
