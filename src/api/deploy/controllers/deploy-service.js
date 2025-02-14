import { deployServiceValidation } from '~/src/api/deploy/helpers/schema/deploy-service-validation.js'
import { registerDeployment } from '~/src/api/deploy/helpers/register-deployment.js'
import { generateDeployment } from '~/src/helpers/deployments/generate-deployment.js'
import { commitDeploymentFile } from '~/src/helpers/deployments/commit-deployment-file.js'
import { lookupTenantService } from '~/src/helpers/portal-backend/lookup-tenant-service.js'
import { getLatestAppConfigCommitSha } from '~/src/helpers/portal-backend/get-latest-app-config-commit-sha.js'
import { getScopedUser } from '~/src/helpers/user/get-scoped-user.js'

const deployServiceController = {
  options: {
    auth: {
      strategy: 'azure-oidc'
    },
    validate: {
      payload: deployServiceValidation()
    },
    payload: {
      output: 'data',
      parse: true,
      allow: 'application/json'
    }
  },
  handler: async (request, h) => {
    const { payload, logger, auth } = request
    const imageName = payload.imageName
    const environment = payload.environment

    logger.info(`Deployment of ${imageName} to ${environment} in progress`)

    const user = getScopedUser(imageName, auth)

    const configLatestCommitSha = await getLatestAppConfigCommitSha(
      environment,
      logger
    )
    if (!configLatestCommitSha) {
      const message =
        'Error encountered whilst attempting to get latest cdp-app-config sha'
      return h.response({ message }).code(500)
    }
    logger.info(`Config commit sha ${configLatestCommitSha}`)

    const deploymentId = crypto.randomUUID()

    await registerDeployment(
      imageName,
      payload.version,
      environment,
      payload.instanceCount,
      payload.cpu,
      payload.memory,
      user,
      deploymentId,
      configLatestCommitSha
    )

    logger.info('Deployment registered')

    const service = await lookupTenantService(imageName, environment, logger)

    if (!service) {
      const message =
        'Error encountered whilst attempting to find deployment zone information'
      return h.response({ message }).code(500)
    }

    logger.info(
      `Service ${imageName} in ${environment} should be deployed to ${service.zone}`
    )

    const deployment = generateDeployment({
      deploymentId,
      payload,
      zone: service.zone,
      commitSha: configLatestCommitSha,
      serviceCode: service.serviceCode,
      deploy: true,
      user
    })

    await commitDeploymentFile({ deployment, logger })

    logger.info('Deployment commit file created')
    return h.response({ message: 'success', deploymentId }).code(200)
  }
}

export { deployServiceController }
