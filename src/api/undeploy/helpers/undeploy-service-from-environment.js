import { registerUndeployment } from '~/src/api/undeploy/helpers/register-undeployment.js'
import { scaleEcsToZero } from '~/src/api/undeploy/helpers/scale-ecs-to-zero.js'
import { lookupServiceInEnvironment } from '~/src/helpers/portal-backend/lookup-tenant-service.js'
import { isFeatureEnabled } from '~/src/helpers/feature-toggle/is-feature-enabled.js'
import { featureToggles } from '~/src/helpers/feature-toggle/feature-toggles.js'
import { createLogger } from '~/src/helpers/logging/logger.js'
import { getRepositoryInfo } from '~/src/helpers/portal-backend/get-repository-info.js'

/**
 * @param {{serviceName: string, environment: string, user: {id: string, displayName: string}, undeploymentId: string, logger: import('pino').Logger}} options
 * @returns {Promise<string>}
 */
export async function undeployServiceFromEnvironment({
  serviceName,
  environment,
  user,
  undeploymentId = crypto.randomUUID(),
  logger = createLogger()
}) {
  logger.info(`Undeploying ${serviceName} from ${environment} in progress`)

  const repositoryInfo = await getRepositoryInfo(serviceName, logger)
  const isTestSuite = repositoryInfo?.repository?.topics?.includes('test-suite')
  if (isTestSuite) {
    logger.info('Service is a test suite, skipping undeployment')
    return undeploymentId
  }

  const zone = await lookupZone(serviceName, environment)

  if (!zone) {
    logger.warn(
      `Unable to find deployment zone for [${serviceName}] in environment [${environment}].`
    )
    return
  }

  await registerUndeployment(serviceName, environment, user, undeploymentId)

  if (isFeatureEnabled(featureToggles.scaleEcsToZero)) {
    await scaleEcsToZero({
      serviceName,
      environment,
      zone,
      user,
      undeploymentId,
      logger
    })
  } else {
    logger.info('Scale ECS Service to 0 feature is disabled')
  }
  return undeploymentId
}

async function lookupZone(serviceName, environment) {
  const { serviceJson } = await lookupServiceInEnvironment(
    serviceName,
    environment
  )
  return serviceJson?.zone
}
