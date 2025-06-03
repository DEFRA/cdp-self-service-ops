import { getEntity } from '~/src/helpers/portal-backend/get-entity.js'
import { lookupTenantService } from '~/src/helpers/portal-backend/lookup-tenant-service.js'
import { registerDeployment } from '~/src/api/deploy/helpers/register-deployment.js'
import { generateDeployment } from '~/src/helpers/deployments/generate-deployment.js'
import { commitDeploymentFile } from '~/src/helpers/deployments/commit-deployment-file.js'
import { getServiceInfo } from '~/src/api/deploy/helpers/get-service-info.js'

async function deployToZero({ logger }, serviceName, environment, user) {
  logger.info(
    `Deployment to zero of ${serviceName} in ${environment} in progress`
  )

  const deploymentId = crypto.randomUUID()

  const entity = await getEntity(serviceName, logger)
  const isTestSuite = entity?.type === 'TestSuite'
  if (isTestSuite) {
    logger.info(`${serviceName} is a test suite, nothing to deploy to zero`)
    return deploymentId
  }

  const tenantService = await lookupTenantService(
    serviceName,
    environment,
    logger
  )

  if (!tenantService?.zone) {
    logger.warn(`Unable to find zone for ${serviceName} in ${environment}`)
    return
  }

  const deployment = await getServiceInfo(serviceName, environment, logger)

  if (deployment === null) {
    logger.warn(
      `Deployment for ${serviceName} not found, skipping deployment to zero`
    )
    return deploymentId
  }

  await registerDeployment(
    serviceName,
    deployment.service.version,
    environment,
    0,
    deployment.resources.cpu,
    deployment.resources.memory,
    user,
    deploymentId,
    deployment.service.configuration.commitSha
  )

  logger.info('Deployment to zero registered')

  const undeployment = generateDeployment({
    payload: {
      imageName: serviceName,
      version: deployment.service.version,
      environment,
      instanceCount: 0,
      cpu: deployment.resources.cpu,
      memory: deployment.resources.memory
    },
    deploymentId,
    zone: tenantService.zone,
    commitSha: deployment.service.configuration.commitSha,
    serviceCode: tenantService.serviceCode,
    deploy: true,
    user
  })

  await commitDeploymentFile(undeployment, logger)

  logger.info('Deployment to zero commit file created')

  return deploymentId
}

export { deployToZero }
