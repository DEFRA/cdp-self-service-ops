import { orderedEnvironments } from '~/src/config/environments.js'
import { undeployServiceFromEnvironmentWithId } from '~/src/api/undeploy/helpers/undeploy-service-from-environment.js'
import { createLogger } from '~/src/helpers/logging/logger.js'

const logger = createLogger()

/**
 * @typedef {import("pino").Logger} Logger
 * @param {string} imageName
 * @param {{id: string, displayName: string}} user
 */
async function undeployServiceFromAllEnvironments(imageName, user) {
  logger.info(`Undeploying ${imageName} from all environments in progress`)
  const undeploymentId = crypto.randomUUID()
  await orderedEnvironments.array.forEach(async (element) => {
    await undeployServiceFromEnvironmentWithId(
      undeploymentId,
      imageName,
      element,
      user
    )
  })
}

export { undeployServiceFromAllEnvironments }
