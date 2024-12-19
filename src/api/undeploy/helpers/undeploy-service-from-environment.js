import { config } from '~/src/config/index.js'
import { registerUndeployment } from '~/src/api/undeploy/helpers/register-undeployment.js'
import { removeDeploymentFile } from '~/src/api/undeploy/helpers/remove-deployment-file.js'
import { lookupTenantService } from '~/src/api/deploy/helpers/lookup-tenant-service.js'
import { isFeatureEnabled } from '~/src/helpers/feature-toggle/is-feature-enabled.js'
import { featureToggles } from '~/src/helpers/feature-toggle/feature-toggles.js'
import { createLogger } from '~/src/helpers/logging/logger.js'

const logger = createLogger()

const deployFromFileEnvironments = config.get('deployFromFileEnvironments')

/**
 * @param {string} imageName
 * @param {string} environment
 * @param {{id: string, displayName: string}} user
 */
async function undeployServiceFromEnvironment(imageName, environment, user) {
  const undeploymentId = crypto.randomUUID()
  return undeployServiceFromEnvironmentWithId(
    undeploymentId,
    imageName,
    environment,
    user
  )
}

/**
 * @param {string} undeploymentId
 * @param {string} imageName
 * @param {string} environment
 * @param {{id: string, displayName: string}} user
 */
async function undeployServiceFromEnvironmentWithId(
  undeploymentId,
  imageName,
  environment,
  user
) {
  logger.info(`Undeploying ${imageName} from ${environment} in progress`)

  if (isFeatureEnabled(featureToggles.undeploy.register)) {
    await registerUndeployment(imageName, environment, user, undeploymentId)
    logger.info('Undeployment registered')
  } else {
    logger.info('Undeployment registration feature is disabled')
  }

  const service = await lookupTenantService(imageName, environment, logger)

  if (!service) {
    const message = `Unable to find deployment zone for [${imageName}] in environment [${environment}].`
    logger.warn(message)
    return
  }

  if (isFeatureEnabled(featureToggles.undeploy.deleteDeploymentFile)) {
    const shouldDeployByFile = deployFromFileEnvironments.includes(environment)
    if (!shouldDeployByFile) {
      logger.info(
        `Undeploying ${imageName} from ${environment} is not file based`
      )
    }

    await removeDeploymentFile(
      undeploymentId,
      imageName,
      environment,
      service.zone,
      user
    )
    logger.info('Deployment file removed')
  } else {
    logger.info('Deployment file remove feature is disabled')
  }
  return undeploymentId
}

export { undeployServiceFromEnvironment, undeployServiceFromEnvironmentWithId }
