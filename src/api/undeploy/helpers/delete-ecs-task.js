import { createLogger } from '~/src/helpers/logging/logger.js'
import { orderedEnvironments } from '~/src/config/environments.js'
import { lookupTenantService } from '~/src/api/deploy/helpers/lookup-tenant-service.js'
import { featureToggles } from '~/src/helpers/feature-toggle/feature-toggles.js'
import { isFeatureEnabled } from '~/src/helpers/feature-toggle/is-feature-enabled.js'
import { removeEcsTask } from '~/src/helpers/remove/workflows/remove-ecs-task.js'

/**
 * @param {{serviceName: string, environment: string, logger: [import('pino').Logger]}} options
 */
async function deleteEcsTask({
  serviceName,
  environment,
  logger = createLogger()
}) {
  logger.info(`Deleting ECS task for ${serviceName} in env ${environment}`)

  if (!isFeatureEnabled(featureToggles.deleteEcsTask)) {
    logger.info('Deleting ECS Task feature is disabled')
    return
  }

  const service = await lookupTenantService(serviceName, environment, logger)

  if (!service?.zone) {
    logger.info(
      `Unable to find service [${serviceName}] in environment [${environment}].`
    )
    return
  }

  await removeEcsTask(serviceName, environment, logger)
}

/**
 * @param {{serviceName: string, environments: [string[]], logger: [import('pino').Logger]}} options
 */
async function deleteAllEcsTasks({
  serviceName,
  environments = orderedEnvironments,
  logger = createLogger()
}) {
  for (const environment of environments) {
    await deleteEcsTask({ serviceName, environment, logger })
  }
}

export { deleteEcsTask, deleteAllEcsTasks }
