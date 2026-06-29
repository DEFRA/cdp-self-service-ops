import { deployService } from './deploy-service.js'
import { findRunningDetails } from '../../../helpers/deployments/find-running-details.js'
import isEmpty from 'lodash/isEmpty.js'

async function deployToZero(
  { logger, snsClient },
  serviceName,
  environment,
  user
) {
  logger.info(
    `Deployment to zero of ${serviceName} in ${environment} in progress`
  )

  const runningDetails = await findRunningDetails(serviceName, environment)
  if (!runningDetails || isEmpty(runningDetails)) {
    logger.info(
      `Deployment details not found for ${serviceName} in ${environment}, may not be running`
    )
    throw new Error(
      `Deployment details not found for ${serviceName} in ${environment}, may not be running`
    )
  }

  if (runningDetails.instanceCount === 0) {
    logger.info('ECS Service already scaled to 0')
    throw new Error('ECS Service already scaled to 0')
  }

  const details = {
    imageName: serviceName,
    environment,
    version: runningDetails.version,
    instanceCount: 0,
    cpu: Number(runningDetails.cpu),
    memory: Number(runningDetails.memory),
    configVersion: runningDetails.configVersion
  }

  const { deploymentId } = await deployService(details, user, snsClient, logger)

  return deploymentId
}

export { deployToZero }
