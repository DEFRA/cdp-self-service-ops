import { scaleEcsToZero } from './scale-ecs-to-zero.js'
import { getEntity } from '../../../helpers/portal-backend/get-entity.js'
import { lookupTenantService } from '../../../helpers/portal-backend/lookup-tenant-service.js'
import { entityTypes } from '@defra/cdp-validation-kit'

/**
 * @param {string} repositoryName
 * @param {string} environment
 * @param {{id: string, displayName: string}} user
 * @param {import("pino").Logger} logger
 * @returns {Promise<string>}
 */
export async function scaleEcsToZeroInEnvironment(
  repositoryName,
  environment,
  user,
  logger
) {
  logger.info(
    `Scaling ${repositoryName} ECS to zero in ${environment} in progress`
  )

  const undeploymentId = crypto.randomUUID()

  const entity = await getEntity(repositoryName, logger)
  const isNotDeployable =
    entity?.type === entityTypes.repository ||
    entity?.type === entityTypes.testSuite
  if (isNotDeployable) {
    logger.info(`${repositoryName} is a ${entity?.type}, nothing to undeploy`)
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

  await scaleEcsToZero(
    repositoryName,
    environment,
    tenantService?.zone,
    user,
    undeploymentId,
    logger
  )
  return undeploymentId
}
