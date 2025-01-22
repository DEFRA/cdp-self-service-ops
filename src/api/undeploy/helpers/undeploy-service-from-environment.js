import { config } from '~/src/config/index.js'
import { registerUndeployment } from '~/src/api/undeploy/helpers/register-undeployment.js'
import { scaleEcsToZero } from '~/src/api/undeploy/helpers/scale-ecs-to-zero.js'
import { lookupTenantService } from '~/src/api/deploy/helpers/lookup-tenant-service.js'
import { isFeatureEnabled } from '~/src/helpers/feature-toggle/is-feature-enabled.js'
import { featureToggles } from '~/src/helpers/feature-toggle/feature-toggles.js'
import { createLogger } from '~/src/helpers/logging/logger.js'
import { getRepositoryInfo } from '~/src/helpers/portal-backend/get-repository-info.js'

const deployFromFileConfig = config.get('deployFromFileEnvironments')

/**
 * @param {{serviceName: string, environment: string, user: {id: string, displayName: string}, undeploymentId: string, deployFromFileEnvironments: string[], logger: import('pino').Logger}} options
 * @returns {Promise<string>}
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

  const repositoryInfo = await getRepositoryInfo(serviceName, logger)
  const isTestSuite = repositoryInfo?.repository?.topics?.includes('test-suite')
  if (isTestSuite) {
    logger.info('Service is a test suite, skipping undeployment')
    return undeploymentId
  }

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
