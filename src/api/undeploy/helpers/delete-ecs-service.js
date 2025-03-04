import { featureToggles } from '~/src/helpers/feature-toggle/feature-toggles.js'
import { isFeatureEnabled } from '~/src/helpers/feature-toggle/is-feature-enabled.js'
import { removeEcsService } from '~/src/helpers/remove/workflows/remove-ecs-service.js'

/**
 * @param {string} serviceName
 * @param {import("pino").Logger} logger
 */
async function deleteEcsService(serviceName, logger) {
  if (
    !isFeatureEnabled(featureToggles.decommissionService) ||
    !isFeatureEnabled(featureToggles.undeploy.deleteEcsService)
  ) {
    logger.info('Deleting ECS service feature is disabled')
    return
  }

  await removeEcsService(serviceName, logger)
}

export { deleteEcsService }
