import { getEntity } from '../../../helpers/portal-backend/get-entity.js'
import { entityTypes } from '@defra/cdp-validation-kit'
import { deployToZero } from '../../deploy/helpers/deploy-to-zero.js'

/**
 * @param {string} serviceName
 * @param {string} environment
 * @param {{id: string, displayName: string}} user
 * @param {import("pino").Logger} logger
 * @param {import("@aws-sdk/client-sns").SNSClient} snsClient
 * @returns {Promise<string|undefined>}
 */
export async function scaleEcsToZeroInEnvironment(
  serviceName,
  environment,
  user,
  logger,
  snsClient
) {
  logger.info(
    `Scaling ${serviceName} ECS to zero in ${environment} in progress`
  )

  const undeploymentId = crypto.randomUUID()

  const entity = await getEntity(serviceName, logger)
  const isNotDeployable =
    entity?.type === entityTypes.repository ||
    entity?.type === entityTypes.testSuite
  if (isNotDeployable) {
    logger.info(`${serviceName} is a ${entity?.type}, nothing to undeploy`)
    return undeploymentId
  }

  const zone = entity.environments[environment]?.tenant_config?.zone
  if (!zone) {
    logger.warn(`Unable to find zone for [${serviceName}] in ${environment}.`)
    return
  }

  try {
    return await deployToZero(
      { logger, snsClient },
      serviceName,
      environment,
      user
    )
  } catch (error) {
    logger.error(error)
  }
}
