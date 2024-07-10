import Boom from '@hapi/boom'

import { config } from '~/src/config'
import { deployServiceValidation } from '~/src/api/deploy/helpers/schema/deploy-service-validation'
import { registerDeployment } from '~/src/api/deploy/helpers/register-deployment'
import { getRepoTeams } from '~/src/api/deploy/helpers/get-repo-teams'
import { getSecretKeysForService } from '~/src/api/deploy/helpers/get-secret-keys-for-service'
import { sendSnsDeploymentMessage } from '~/src/api/deploy/helpers/send-sns-deployment-message'
import { commitDeploymentFile } from '~/src/api/deploy/helpers/commit-deployment-file'
import { getLatestCommitSha } from '~/src/helpers/github/get-latest-commit-sha'
import { lookupTenantService } from '~/src/api/deploy/helpers/lookup-tenant-service'

const owner = config.get('gitHubOrg')
const configRepo = config.get('gitHubRepoConfig')

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
    const imageName = request.imageName
    const environment = request.environment

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
    const latestSecretKeys = await getSecretKeysForService(
      imageName,
      environment
    )

    await registerDeployment(
      imageName,
      payload.version,
      environment,
      payload.instanceCount,
      payload.cpu,
      payload.memory,
      user,
      deploymentId,
      configLatestCommitSha,
      latestSecretKeys
    )
    request.logger.info('Deployment registered')

    const service = await lookupTenantService(imageName, environment)
    request.logger.info(
      `Service ${imageName} in ${environment} should be deployed to ${service.zone}`
    )

    if (!service) {
      const message =
        'Error encountered whilst attempting to find deployment zone information'
      return h.response({ message }).code(500)
    }

    await sendSnsDeploymentMessage(
      deploymentId,
      payload,
      service.zone,
      user,
      configLatestCommitSha,
      request.snsClient,
      request.logger
    )
    request.logger.info('deployment sns event sent')

    await commitDeploymentFile(
      deploymentId,
      payload,
      service.zone,
      user,
      configLatestCommitSha,
      request.logger
    )
    request.logger.info('deployment commit file created')
    return h.response({ message: 'success', deploymentId }).code(200)
  }
}

export { deployServiceController }
