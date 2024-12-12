import Boom from '@hapi/boom'

import { undeployServiceValidation } from '~/src/api/undeploy/helpers/schema/undeploy-service-validation.js'
import { undeployServiceFromEnvironment } from '../helpers/undeploy-service-from-environment.js'
import { getRepoTeams } from '~/src/api/deploy/helpers/get-repo-teams.js'

const undeployServiceController = {
  options: {
    auth: {
      strategy: 'azure-oidc'
    },
    validate: {
      payload: undeployServiceValidation()
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

    await undeployServiceFromEnvironment(imageName, environment, user, logger)

    return h.response({ message: 'success' }).code(204)
  }
}

export { undeployServiceController }
