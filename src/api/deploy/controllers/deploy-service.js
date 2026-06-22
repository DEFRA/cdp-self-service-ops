import { deployServiceValidation } from '../helpers/schema/deploy-service-validation.js'
import { registerDeployment } from '../helpers/register-deployment.js'
import { generateGitHubDeployment } from '../../../helpers/deployments/generate-deployment.js'
import { commitDeploymentFile } from '../../../helpers/deployments/commit-deployment-file.js'
import { getScopedUser } from '../../../helpers/user/get-scoped-user.js'
import { getEntity } from '../../../helpers/portal-backend/get-entity.js'
import { statusCodes } from '@defra/cdp-validation-kit'
import { triggerDeployment } from '../../../helpers/deployments/trigger-deployment.js'
import { config } from '#config/config.js'

/**
 *
 * @param {{ imageName: string, version: string, environment: string, instanceCount: number, cpu: number, memory: number, configVersion: string }} payload
 * @param {import("@aws-sdk/client-sns").SNSClient} snsClient
 * @param {import("pino").Logger} logger
 * @param {{}} h
 * @param {{ id: string, displayName: string }} user
 * @param { string[] } allowedEnvs
 * @return {Promise<*>}
 */
async function deployService(payload, snsClient, logger, h, user, allowedEnvs) {
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

  const deploymentRequest = {
    deploymentId,
    payload,
    zone,
    commitSha: payload.configVersion,
    serviceCode: entity.metadata.service_code,
    deploy: true,
    user
  }

  const deployDirectly = (allowedEnvs ?? []).includes(environment)

  if (deployDirectly) {
    await triggerDeployment(
      deploymentRequest,
      payload.environment,
      snsClient,
      logger
    )
  }

  const deployment = generateGitHubDeployment({
    deploymentId,
    deploy: true,
    payload,
    zone,
    commitSha: payload.configVersion,
    serviceCode: entity.metadata.service_code,
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
    const { payload, snsClient, logger, auth } = request
    const user = await getScopedUser(payload.imageName, auth, logger)
    const allowedEnvs = config.get('directDeployments').split(',')

    return await deployService(payload, snsClient, logger, h, user, allowedEnvs)
  }
}

export { deployServiceController, deployService }
