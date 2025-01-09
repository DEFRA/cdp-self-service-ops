import { config } from '~/src/config/index.js'
import { registerUndeployment } from '~/src/api/undeploy/helpers/register-undeployment.js'
import { scaleEcsToZero } from '~/src/api/undeploy/helpers/scale-ecs-to-zero.js'
import { lookupTenantService } from '~/src/api/deploy/helpers/lookup-tenant-service.js'
import { isFeatureEnabled } from '~/src/helpers/feature-toggle/is-feature-enabled.js'
import { featureToggles } from '~/src/helpers/feature-toggle/feature-toggles.js'
import { createLogger } from '~/src/helpers/logging/logger.js'

const logger = createLogger()
const deployFromFileConfig = config.get('deployFromFileEnvironments')

/**
 * @param {string} imageName
 * @param {string} environment
 * @param {{id: string, displayName: string}} user
 */
async function undeployServiceFromEnvironment(imageName, environment, user) {
  const undeploymentId = crypto.randomUUID()
  return undeployService(
    undeploymentId,
    imageName,
    environment,
    user,
    deployFromFileConfig,
    logger
  )
}

/**
 * @param {string} undeploymentId
 * @param {string} imageName
 * @param {string} environment
 * @param {{id: string, displayName: string}} user
 * @param {string[]} deployFromFileEnvironments
 * @param {import('pino').Logger} logger
 */
async function undeployService(
  undeploymentId,
  imageName,
  environment,
  user,
  deployFromFileEnvironments,
  logger
) {
  logger.info(`Undeploying ${imageName} from ${environment} in progress`)

  const service = await lookupTenantService(imageName, environment, logger)

  if (!service) {
    logger.warn(
      `Unable to find deployment zone for [${imageName}] in environment [${environment}].`
    )
    return
  }

  if (isFeatureEnabled(featureToggles.undeploy.register)) {
    await registerUndeployment(imageName, environment, user, undeploymentId)
    logger.info('Undeployment registered')
  } else {
    logger.info('Undeployment registration feature is disabled')
  }

  if (isFeatureEnabled(featureToggles.undeploy.scaleEcsToZero)) {
    const shouldDeployByFile = deployFromFileEnvironments.includes(environment)
    if (!shouldDeployByFile) {
      logger.warn(
        `Scaling ${imageName} to zero in ${environment} not possible as env is not file based`
      )
    } else {
      await scaleEcsToZero(
        undeploymentId,
        imageName,
        environment,
        service.zone,
        user,
        logger
      )
    }
  } else {
    logger.info('Scale ECS Service to 0 feature is disabled')
  }
  return undeploymentId
}

export { undeployServiceFromEnvironment, undeployService }
