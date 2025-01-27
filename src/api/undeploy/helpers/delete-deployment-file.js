import { createLogger } from '~/src/helpers/logging/logger.js'
import { featureToggles } from '~/src/helpers/feature-toggle/feature-toggles.js'
import { isFeatureEnabled } from '~/src/helpers/feature-toggle/is-feature-enabled.js'
import { removeDeployment } from '~/src/helpers/remove/workflows/remove-deployment.js'

/**
 * @param {{serviceName: string, logger: [import('pino').Logger]}} options
 */
export async function deleteDeploymentFiles({
  serviceName,
  logger = createLogger()
}) {
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
