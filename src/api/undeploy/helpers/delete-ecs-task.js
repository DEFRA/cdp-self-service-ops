import { createLogger } from '~/src/helpers/logging/logger.js'
import { lookupTenantService } from '~/src/api/deploy/helpers/lookup-tenant-service.js'
import { featureToggles } from '~/src/helpers/feature-toggle/feature-toggles.js'
import { isFeatureEnabled } from '~/src/helpers/feature-toggle/is-feature-enabled.js'
import { removeEcsTask } from '~/src/helpers/remove/workflows/remove-ecs-task.js'

/**
 * @param {{serviceName: string, environment: string, user: {id: string, displayName: string}, logger: ?import('pino').Logger}} options
 */
export async function deleteEcsTask({
  serviceName,
  environment,
  logger = createLogger()
}) {
  logger.info(`Deleting ECS task for ${serviceName} in env ${environment}`)

  if (!isFeatureEnabled(featureToggles.undeploy.deleteEcsTask)) {
    logger.info('Undeployment registration feature is disabled')
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
