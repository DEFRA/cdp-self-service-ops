import { deployServiceValidation } from '../helpers/schema/deploy-service-validation.js'
import { registerDeployment } from '../helpers/register-deployment.js'
import { generateDeployment } from '../../../helpers/deployments/generate-deployment.js'
import { commitDeploymentFile } from '../../../helpers/deployments/commit-deployment-file.js'
import { getScopedUser } from '../../../helpers/user/get-scoped-user.js'
import { getEntity } from '../../../helpers/portal-backend/get-entity.js'
import { statusCodes } from '@defra/cdp-validation-kit'

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

  const entity = await getEntity(imageName)
  if (!entity) {
    const message =
      'Error encountered whilst attempting to find deployment zone information'
    return h.response({ message }).code(statusCodes.internalError)
  }

  const zone = entity.environments[environment]?.tenant_config?.zone

  logger.info(
    `Service ${imageName} in ${environment} should be deployed to ${zone}`
  )

  const deployment = generateDeployment({
    deploymentId,
    payload,
    zone,
    commitSha: payload.configVersion,
    serviceCode: entity.metadata.service_code,
    deploy: true,
    user
  })

  await commitDeploymentFile(deployment, logger)

  logger.info('Deployment commit file created')
  return h.response({ deploymentId }).code(statusCodes.ok)
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
    const user = await getScopedUser(payload.imageName, auth, logger)

    return await deployService(payload, logger, h, user)
  }
}

export { deployServiceController, deployService }
