import { orderedEnvironments } from '@defra/cdp-validation-kit'
import { scaleEcsToZeroInEnvironment } from './scale-ecs-to-zero-in-environment.js'

/**
 * @param {string} serviceName
 * @param {{id: string, displayName: string}} user
 * @param {import("pino").Logger} logger
 */
export async function scaleEcsToZeroInAllEnvironments(
  serviceName,
  user,
  logger
) {
  logger.info(
    `Scaling ECS to Zero for ${serviceName} in all environments in progress`
  )
  for (const environment of orderedEnvironments) {
    await scaleEcsToZeroInEnvironment(serviceName, environment, user, logger)
  }
}
