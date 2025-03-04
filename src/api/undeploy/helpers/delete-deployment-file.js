import { featureToggles } from '~/src/helpers/feature-toggle/feature-toggles.js'
import { isFeatureEnabled } from '~/src/helpers/feature-toggle/is-feature-enabled.js'
import { removeDeployment } from '~/src/helpers/remove/workflows/remove-deployment.js'

/**
 * @param {string} serviceName
 * @param {import("pino").Logger} logger
 */
export async function deleteDeploymentFiles(serviceName, logger) {
  logger.info(`Deleting deployment files for ${serviceName}`)

  if (
    !isFeatureEnabled(featureToggles.decommissionService) ||
    !isFeatureEnabled(featureToggles.undeploy.deleteDeploymentFiles)
  ) {
    logger.info('Deleting deployment file feature is disabled')
    return
  }

  await removeDeployment(serviceName, logger)
}
