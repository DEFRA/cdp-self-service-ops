import { orderedEnvironments } from '~/src/config/environments.js'
import { undeployServiceFromEnvironment } from '~/src/api/undeploy/helpers/undeploy-service-from-environment.js'
import { createLogger } from '~/src/helpers/logging/logger.js'

/**
 * @param {{serviceName: string, user: {id: string, displayName: string}, undeploymentId: string, environments: string[], logger: import('pino').Logger}} options
 */
export async function undeployServiceFromAllEnvironments({
  serviceName,
  user,
  undeploymentId = crypto.randomUUID(),
  environments = orderedEnvironments,
  logger = createLogger()
}) {
  logger.info(`Undeploying ${serviceName} from all environments in progress`)
  for (const environment of environments) {
    await undeployServiceFromEnvironment({
      serviceName,
      environment,
      user,
      undeploymentId,
      logger
    })
  }
}
