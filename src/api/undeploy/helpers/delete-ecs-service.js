import { createLogger } from '~/src/helpers/logging/logger.js'
import { orderedEnvironments } from '~/src/config/environments.js'
import { lookupTenantService } from '~/src/helpers/portal-backend/lookup-tenant-service.js'
import { featureToggles } from '~/src/helpers/feature-toggle/feature-toggles.js'
import { isFeatureEnabled } from '~/src/helpers/feature-toggle/is-feature-enabled.js'
import { removeEcsService } from '~/src/helpers/remove/workflows/remove-ecs-service.js'

/**
 * @param {{serviceName: string, environment: string, logger: [import('pino').Logger]}} options
 */
async function deleteEcsService({
  serviceName,
  environment,
  logger = createLogger()
}) {
  logger.info(`Deleting ECS service for ${serviceName} in env ${environment}`)

  if (!isFeatureEnabled(featureToggles.undeploy.deleteEcsService)) {
    logger.info('Deleting ECS service feature is disabled')
    return
  }

  const service = await lookupTenantService(serviceName, environment, logger)

  if (!service?.zone) {
    logger.info(
      `Unable to find service [${serviceName}] in environment [${environment}].`
    )
    return
  }

  await removeEcsService(serviceName, environment, service.zone, logger)
}

/**
 * @param {{serviceName: string, environments: [string[]], logger: [import('pino').Logger]}} options
 */
async function deleteAllEcsServices({
  serviceName,
  environments = orderedEnvironments,
  logger = createLogger()
}) {
  for (const environment of environments) {
    await deleteEcsService({ serviceName, environment, logger })
  }
}

export { deleteEcsService, deleteAllEcsServices }
