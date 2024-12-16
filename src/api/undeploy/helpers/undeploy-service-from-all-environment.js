import { orderedEnvironments } from '~/src/config/environments.js'
import { undeployServiceFromEnvironmentWithId } from '~/src/api/undeploy/helpers/undeploy-service-from-environment.js'
import { createLogger } from '~/src/helpers/logging/logger.js'

const logger = createLogger()

/**
 * @param {string} imageName
 * @param {{id: string, displayName: string}} user
 */
async function undeployServiceFromAllEnvironments(imageName, user) {
  await undeployServiceFromAllEnvironmentsWithId(
    crypto.randomUUID(),
    imageName,
    user
  )
}

/**
 * @param {string} undeploymentId
 * @param {string} imageName
 * @param {{id: string, displayName: string}} user
 */
async function undeployServiceFromAllEnvironmentsWithId(
  undeploymentId,
  imageName,
  user
) {
  logger.info(`Undeploying ${imageName} from all environments in progress`)
  await orderedEnvironments.forEach(async (element) => {
    await undeployServiceFromEnvironmentWithId(
      undeploymentId,
      imageName,
      element,
      user
    )
  })
}

export {
  undeployServiceFromAllEnvironments,
  undeployServiceFromAllEnvironmentsWithId
}
