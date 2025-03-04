import isEmpty from 'lodash/isEmpty.js'

import { findRunningDetails } from '~/src/helpers/deployments/find-running-details.js'
import { commitDeploymentFile } from '~/src/helpers/deployments/commit-deployment-file.js'
import { transformRunningDetailsToDeployment } from '~/src/helpers/deployments/transform-running-details-to-deployment.js'
import { scaleDeploymentToZeroInstances } from '~/src/api/undeploy/helpers/scale-deployment-to-zero-instances.js'

/**
 * @param {string} serviceName
 * @param {string} environment
 * @param {string} zone
 * @param {{id: string, displayName: string}} user
 * @param {string} undeploymentId
 * @param {import("pino").Logger} logger
 */
export async function scaleEcsToZero(
  serviceName,
  environment,
  zone,
  user,
  undeploymentId,
  logger
) {
  logger.info(`Scaling ECS to ZERO for ${serviceName} in env ${environment}`)

  const runningDetails = await findRunningDetails(serviceName, environment)

  if (!runningDetails || isEmpty(runningDetails)) {
    logger.info(
      `Deployment details not found for ${serviceName} in ${environment}, may not be running`
    )
    return
  }

  if (runningDetails.instanceCount === 0) {
    logger.info('ECS Service already scaled to 0')
    return
  }

  const deployment = transformRunningDetailsToDeployment(runningDetails, zone)
  const undeployment = scaleDeploymentToZeroInstances(
    deployment,
    user,
    undeploymentId
  )
  await commitDeploymentFile(undeployment, logger)

  logger.info('ECS Service scaled to 0')
}
