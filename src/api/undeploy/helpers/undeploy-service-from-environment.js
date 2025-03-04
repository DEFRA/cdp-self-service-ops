import { registerUndeployment } from '~/src/api/undeploy/helpers/register-undeployment.js'
import { scaleEcsToZero } from '~/src/api/undeploy/helpers/scale-ecs-to-zero.js'
import { lookupServiceInEnvironment } from '~/src/helpers/portal-backend/lookup-tenant-service.js'
import { isFeatureEnabled } from '~/src/helpers/feature-toggle/is-feature-enabled.js'
import { featureToggles } from '~/src/helpers/feature-toggle/feature-toggles.js'
import { getRepositoryInfo } from '~/src/helpers/portal-backend/get-repository-info.js'

/**
 * @param {string} serviceName
 * @param {string} environment
 * @param {{id: string, displayName: string}} user
 * @param {import("pino").Logger} logger
 * @returns {Promise<string>}
 */
export async function undeployServiceFromEnvironment(
  serviceName,
  environment,
  user,
  logger
) {
  logger.info(`Undeploying ${serviceName} from ${environment} in progress`)

  const undeploymentId = crypto.randomUUID()

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
    await scaleEcsToZero(
      serviceName,
      environment,
      zone,
      user,
      undeploymentId,
      logger
    )
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
