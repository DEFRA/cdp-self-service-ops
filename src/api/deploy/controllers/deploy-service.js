import Boom from '@hapi/boom'

import { config } from '~/src/config'
import { deployServiceValidation } from '~/src/api/deploy/helpers/schema/deploy-service-validation'
import { registerDeployment } from '~/src/api/deploy/helpers/register-deployment'
import { getRepoTeams } from '~/src/api/deploy/helpers/get-repo-teams'
import { sendSnsDeploymentMessage } from '~/src/api/deploy/helpers/send-sns-deployment-message'
import { commitDeploymentFile } from '~/src/api/deploy/helpers/commit-deployment-file'
import { getLatestCommitSha } from '~/src/helpers/github/get-latest-commit-sha'
import { lookupTenantService } from '~/src/api/deploy/helpers/lookup-tenant-service'

const owner = config.get('github.org')
const configRepo = config.get('github.repos.cdpAppConfig')
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
    const payload = request.payload
    const imageName = payload.imageName
    const environment = payload.environment

    request.logger.info(
      `Deployment of ${imageName} to ${environment} in progress`
    )

    const user = {
      id: request.auth?.credentials?.id,
      displayName: request.auth?.credentials?.displayName
    }
    const scope = request.auth?.credentials?.scope

    const isAdmin = scope.includes(config.get('oidcAdminGroupId'))
    if (!isAdmin) {
      const repoTeams = await getRepoTeams(imageName)
      const isTeamMember = repoTeams.some((team) => scope.includes(team.teamId))
      if (!isTeamMember) {
        throw Boom.forbidden('Insufficient scope')
      }
    }

    const deploymentId = crypto.randomUUID()
    const configLatestCommitSha = await getLatestCommitSha(owner, configRepo)
    request.logger.info(`Config commit sha ${configLatestCommitSha}`)

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
    request.logger.info('Deployment registered')

    const service = await lookupTenantService(imageName, environment)

    if (!service) {
      const message =
        'Error encountered whilst attempting to find deployment zone information'
      return h.response({ message }).code(500)
    }

    request.logger.info(
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
        service.service_code,
        request
      )
      request.logger.info('Deployment sns event sent')
    } else {
      request.logger.info(
        'Deployment sns event not sent - deploying via deployment file'
      )
    }

    await commitDeploymentFile(
      deploymentId,
      payload,
      service.zone,
      user,
      configLatestCommitSha,
      service.service_code,
      shouldDeployByFile,
      request.logger
    )
    request.logger.info('Deployment commit file created')
    return h.response({ message: 'success', deploymentId }).code(200)
  }
}

export { deployServiceController }
