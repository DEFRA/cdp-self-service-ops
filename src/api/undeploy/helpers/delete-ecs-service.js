import { createLogger } from '~/src/helpers/logging/logger.js'
import { orderedEnvironments } from '~/src/config/environments.js'
import { featureToggles } from '~/src/helpers/feature-toggle/feature-toggles.js'
import { isFeatureEnabled } from '~/src/helpers/feature-toggle/is-feature-enabled.js'
import { removeEcsService } from '~/src/helpers/remove/workflows/remove-ecs-service.js'

/**
 * @param {string} serviceName
 * @param {string} environment
 * @param {import("pino").Logger} logger
 */
async function deleteEcsService(
  serviceName,
  environment,
  logger = createLogger()
) {
  logger.info(`Deleting ECS service for ${serviceName} in env ${environment}`)

  if (
    !isFeatureEnabled(featureToggles.decommissionService) ||
    !isFeatureEnabled(featureToggles.undeploy.deleteEcsService)
  ) {
    logger.info('Deleting ECS service feature is disabled')
    return
  }

  await removeEcsService(serviceName, environment, logger)
}

/**
 * @param {string} serviceName
 * @param {import("pino").Logger} logger
 */
async function deleteAllEcsServices(serviceName, logger = createLogger()) {
  for (const environment of orderedEnvironments) {
    await deleteEcsService(serviceName, environment, logger)
  }
}

export { deleteEcsService, deleteAllEcsServices }
