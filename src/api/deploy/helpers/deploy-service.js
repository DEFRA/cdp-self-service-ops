import { generateGitHubDeployment } from '../../../helpers/deployments/generate-deployment.js'
import { registerDeployment } from './register-deployment.js'
import { commitDeploymentFile } from '../../../helpers/deployments/commit-deployment-file.js'
import { getEntity } from '../../../helpers/portal-backend/get-entity.js'
import { triggerDeployment } from '../../../helpers/deployments/trigger-deployment.js'

/**
 * Starts a new deployment of a service.
 * @param {{imageName: string, environment: string, version: string, instanceCount: number, cpu: number, memory: number, configVersion: string}} details
 * @param {{ id: string, displayName: string }} user
 * @param {import("@aws-sdk/client-sns").SNSClient} snsClient
 * @param {import("pino").Logger} logger
 * @return {Promise<{deploymentId: string}>}
 */
export async function deployService(details, user, snsClient, logger) {
  const {
    imageName,
    environment,
    version,
    instanceCount,
    cpu,
    memory,
    configVersion
  } = details

  logger.info(
    `Deployment of ${imageName} version ${version} to ${environment} in progress`
  )

  const deploymentId = crypto.randomUUID()
  await registerDeployment(
    imageName,
    version,
    environment,
    instanceCount,
    cpu,
    memory,
    user,
    deploymentId,
    configVersion
  )

  logger.info('Deployment registered')

  const entity = await getEntity(imageName)
  if (!entity) {
    const message =
      'Error encountered whilst attempting to find deployment zone information'
    throw new Error(message)
  }

  const zone = entity.environments[environment]?.tenant_config?.zone

  logger.info(
    `Service ${imageName} in ${environment} should be deployed to ${zone}`
  )

  const deploymentRequest = {
    deploymentId,
    payload: details,
    zone,
    commitSha: details.configVersion,
    serviceCode: entity.metadata?.service_code,
    deploy: true,
    user
  }

  await triggerDeployment(
    deploymentRequest,
    details.environment,
    snsClient,
    logger
  )

  const deployment = generateGitHubDeployment({
    deploymentId,
    deploy: true,
    payload: { imageName, version, environment, instanceCount, cpu, memory },
    zone,
    commitSha: configVersion,
    serviceCode: entity.metadata.service_code,
    user
  })

  await commitDeploymentFile(deployment, logger)

  logger.info('Deployment commit file created')

  return { deploymentId }
}
