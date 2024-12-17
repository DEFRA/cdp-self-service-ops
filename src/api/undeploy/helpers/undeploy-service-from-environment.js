import { config } from '~/src/config/index.js'
import { registerUndeployment } from '~/src/api/undeploy/helpers/register-undeployment.js'
import { removeDeploymentFile } from '~/src/api/undeploy/helpers/remove-deployment-file.js'
import { lookupTenantService } from '~/src/api/deploy/helpers/lookup-tenant-service.js'
import { isFeatureEnabled } from '~/src/helpers/feature-toggle/is-feature-enabled.js'
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

  if (isFeatureEnabled('undeploy.register')) {
    await registerUndeployment(imageName, environment, user, undeploymentId)
    logger.info('Undeployment registered')
  } else {
    logger.info('Undeployment registration feature is disabled')
  }

  const service = await lookupTenantService(imageName, environment, logger)

  if (!service) {
    const message =
      'Error encountered whilst attempting to find deployment zone information'
    throw new Error(message)
  }

  const shouldDeployByFile = deployFromFileEnvironments.includes(environment)
  if (!shouldDeployByFile) {
    logger.info(
      `Undeploying ${imageName} from ${environment} is not file based`
    )
  }

  if (isFeatureEnabled('undeploy.deleteDeploymentFile')) {
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
