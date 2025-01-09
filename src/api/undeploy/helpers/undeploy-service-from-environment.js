import { config } from '~/src/config/index.js'
import { registerUndeployment } from '~/src/api/undeploy/helpers/register-undeployment.js'
import { scaleEcsToZero } from '~/src/api/undeploy/helpers/scale-ecs-to-zero.js'
import { lookupTenantService } from '~/src/api/deploy/helpers/lookup-tenant-service.js'
import { isFeatureEnabled } from '~/src/helpers/feature-toggle/is-feature-enabled.js'
import { featureToggles } from '~/src/helpers/feature-toggle/feature-toggles.js'
import { createLogger } from '~/src/helpers/logging/logger.js'

const deployFromFileConfig = config.get('deployFromFileEnvironments')

/**
 * @param {string} serviceName
 * @param {string} environment
 * @param {{id: string, displayName: string}} user
 * @param {string} undeploymentId
 * @param {string[]} deployFromFileEnvironments
 * @param {import('pino').Logger} logger
 */
export async function undeployServiceFromEnvironment({
  serviceName,
  environment,
  user,
  undeploymentId = crypto.randomUUID(),
  deployFromFileEnvironments = deployFromFileConfig,
  logger = createLogger()
}) {
  logger.info(`Undeploying ${serviceName} from ${environment} in progress`)

  const service = await lookupTenantService(serviceName, environment, logger)

  if (!service) {
    logger.warn(
      `Unable to find deployment zone for [${serviceName}] in environment [${environment}].`
    )
    return
  }

  if (isFeatureEnabled(featureToggles.undeploy.register)) {
    await registerUndeployment(serviceName, environment, user, undeploymentId)
    logger.info('Undeployment registered')
  } else {
    logger.info('Undeployment registration feature is disabled')
  }

  if (isFeatureEnabled(featureToggles.undeploy.scaleEcsToZero)) {
    const shouldDeployByFile = deployFromFileEnvironments.includes(environment)
    if (!shouldDeployByFile) {
      logger.warn(
        `Scaling ${serviceName} to zero in ${environment} not possible as env is not file based`
      )
    } else {
      await scaleEcsToZero({
        serviceName,
        environment,
        zone: service.zone,
        user,
        undeploymentId,
        logger
      })
    }
  } else {
    logger.info('Scale ECS Service to 0 feature is disabled')
  }
  return undeploymentId
}
