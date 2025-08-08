import { deployServiceValidation } from '../helpers/schema/deploy-service-validation.js'
import { registerDeployment } from '../helpers/register-deployment.js'
import { generateDeployment } from '../../../helpers/deployments/generate-deployment.js'
import { commitDeploymentFile } from '../../../helpers/deployments/commit-deployment-file.js'
import { lookupTenantService } from '../../../helpers/portal-backend/lookup-tenant-service.js'
import { getScopedUser } from '../../../helpers/user/get-scoped-user.js'
import { statusCodes } from '../../../constants/status-codes.js'

async function deployService(payload, logger, h, user) {
  const imageName = payload.imageName
  const environment = payload.environment
  const version = payload.version

  logger.info(
    `Deployment of ${imageName} version ${version} to ${environment} in progress`
  )

  const deploymentId = crypto.randomUUID()
  await registerDeployment(
    imageName,
    version,
    environment,
    payload.instanceCount,
    payload.cpu,
    payload.memory,
    user,
    deploymentId,
    payload.configVersion
  )

  logger.info('Deployment registered')

  const service = await lookupTenantService(imageName, environment, logger)

  if (!service) {
    const message =
      'Error encountered whilst attempting to find deployment zone information'
    return h.response({ message }).code(statusCodes.internalError)
  }

  logger.info(
    `Service ${imageName} in ${environment} should be deployed to ${service.zone}`
  )

  const deployment = generateDeployment({
    deploymentId,
    payload,
    zone: service.zone,
    commitSha: payload.configVersion,
    serviceCode: service.serviceCode,
    deploy: true,
    user
  })

  await commitDeploymentFile(deployment, logger)

  logger.info('Deployment commit file created')
  return h.response({ message: 'success', deploymentId }).code(statusCodes.ok)
}

const deployServiceController = {
  options: {
    auth: {
      strategy: 'azure-oidc'
    },
    validate: {
      payload: deployServiceValidation
    },
    payload: {
      output: 'data',
      parse: true,
      allow: 'application/json'
    }
  },
  handler: async (request, h) => {
    const { payload, logger, auth } = request
    const user = await getScopedUser(payload.imageName, auth)

    return await deployService(payload, logger, h, user)
  }
}

export { deployServiceController, deployService }
