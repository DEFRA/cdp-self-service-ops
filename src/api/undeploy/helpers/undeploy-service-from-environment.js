import { registerUndeployment } from '~/src/api/undeploy/helpers/register-undeployment.js'
import { scaleEcsToZero } from '~/src/api/undeploy/helpers/scale-ecs-to-zero.js'
import { isFeatureEnabled } from '~/src/helpers/feature-toggle/is-feature-enabled.js'
import { featureToggles } from '~/src/helpers/feature-toggle/feature-toggles.js'
import { getEntity } from '~/src/helpers/portal-backend/get-entity.js'
import { lookupTenantService } from '~/src/helpers/portal-backend/lookup-tenant-service.js'

/**
 * @param {string} repositoryName
 * @param {string} environment
 * @param {{id: string, displayName: string}} user
 * @param {import("pino").Logger} logger
 * @returns {Promise<string>}
 */
export async function undeployServiceFromEnvironment(
  repositoryName,
  environment,
  user,
  logger
) {
  logger.info(`Undeploying ${repositoryName} from ${environment} in progress`)

  const undeploymentId = crypto.randomUUID()

  const entity = await getEntity(repositoryName, logger)
  const isTestSuite = entity?.type === 'TestSuite'
  if (isTestSuite) {
    logger.info(`${repositoryName} is a test suite, nothing to undeploy`)
    return undeploymentId
  }

  const tenantService = await lookupTenantService(
    repositoryName,
    environment,
    logger
  )

  if (!tenantService?.zone) {
    logger.warn(
      `Unable to find zone for [${repositoryName}] in ${environment}.`
    )
    return
  }

  await registerUndeployment(repositoryName, environment, user, undeploymentId)

  if (isFeatureEnabled(featureToggles.scaleEcsToZero)) {
    await scaleEcsToZero(
      repositoryName,
      environment,
      tenantService?.zone,
      user,
      undeploymentId,
      logger
    )
  } else {
    logger.info('Scale ECS Service to 0 feature is disabled')
  }
  return undeploymentId
}
