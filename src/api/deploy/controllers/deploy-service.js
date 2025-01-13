import Boom from '@hapi/boom'

import { config } from '~/src/config/index.js'
import { deployServiceValidation } from '~/src/api/deploy/helpers/schema/deploy-service-validation.js'
import { registerDeployment } from '~/src/api/deploy/helpers/register-deployment.js'
import { getRepoTeams } from '~/src/api/deploy/helpers/get-repo-teams.js'
import { sendSnsDeploymentMessage } from '~/src/api/deploy/helpers/send-sns-deployment-message.js'
import { generateDeployment } from '~/src/helpers/deployments/generate-deployment.js'
import { commitDeploymentFile } from '~/src/helpers/deployments/commit-deployment-file.js'
import { lookupTenantService } from '~/src/api/deploy/helpers/lookup-tenant-service.js'
import { getLatestAppConfigCommitSha } from '~/src/helpers/portal-backend/get-latest-app-config-commit-sha.js'

const deployFromFileEnvironments = config.get('deployFromFileEnvironments')

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

    const user = {
      id: auth?.credentials?.id,
      displayName: auth?.credentials?.displayName
    }
    const scope = auth?.credentials?.scope

    const isAdmin = scope.includes('admin')
    if (!isAdmin) {
      const repoTeams = await getRepoTeams(imageName)
      const isTeamMember = repoTeams.some((team) => scope.includes(team.teamId))
      if (!isTeamMember) {
        throw Boom.forbidden('Insufficient scope')
      }
    }

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
    const shouldDeployByFile = deployFromFileEnvironments.includes(environment)
    if (!shouldDeployByFile) {
      await sendSnsDeploymentMessage(
        deploymentId,
        payload,
        service.zone,
        user,
        configLatestCommitSha,
        service.serviceCode,
        request
      )

      logger.info('Deployment sns event sent')
    } else {
      logger.info(
        'Deployment sns event not sent - deploying via deployment file'
      )
    }

    const deployment = generateDeployment({
      deploymentId,
      payload,
      zone: service.zone,
      configLatestCommitSha,
      serviceCode: service.serviceCode,
      deploy: shouldDeployByFile,
      user
    })

    await commitDeploymentFile({ deployment, logger })

    logger.info('Deployment commit file created')
    return h.response({ message: 'success', deploymentId }).code(200)
  }
}

export { deployServiceController }
