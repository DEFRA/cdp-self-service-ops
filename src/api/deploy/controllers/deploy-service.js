import Boom from '@hapi/boom'

import { config } from '~/src/config'
import { deployServiceValidation } from '~/src/api/deploy/helpers/schema/deploy-service-validation'
import { registerDeployment } from '~/src/api/deploy/helpers/register-deployment'
import { generateDeployMessage } from '~/src/api/deploy/helpers/generate-deploy-message'
import { sendSnsDeployMessage } from '~/src/api/deploy/helpers/send-sns-deploy-message'
import { getRepoTeams } from '~/src/api/deploy/helpers/get-repo-teams'

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
    const user = {
      id: request.auth?.credentials?.id,
      displayName: request.auth?.credentials?.displayName
    }
    const scope = request.auth?.credentials?.scope

    const isAdmin = scope.includes(config.get('oidcAdminGroupId'))
    if (!isAdmin) {
      const repoTeams = await getRepoTeams(payload.imageName)
      const isTeamMember = repoTeams.some((team) => scope.includes(team.teamId))
      if (!isTeamMember) {
        throw Boom.forbidden('Insufficient scope')
      }
    }

    const deploymentId = crypto.randomUUID()

    await registerDeployment(
      payload.imageName,
      payload.version,
      payload.environment,
      payload.instanceCount,
      payload.cpu,
      payload.memory,
      user,
      deploymentId
    )

    const deployMessage = await generateDeployMessage(
      payload.imageName,
      payload.version,
      payload.environment,
      payload.instanceCount,
      payload.cpu,
      payload.memory,
      user,
      deploymentId
    )
    const snsResponse = await sendSnsDeployMessage(
      request.snsClient,
      deployMessage
    )

    request.logger.info(
      `SNS Deploy response: ${JSON.stringify(snsResponse, null, 2)}`
    )

    return h.response({ message: 'success' }).code(200)
  }
}

export { deployServiceController }
