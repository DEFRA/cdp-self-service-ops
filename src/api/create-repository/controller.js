import Boom from '@hapi/boom'
import { isNil } from 'lodash'

import { config } from '~/src/config'
import { createRepository } from '~/src/api/create-repository/helpers/workflow/create-repository'
import { repositoryValidation } from '~/src/api/create-repository/helpers/schema/repository-validation'
import { createRepositoryStatus } from '~/src/helpers/db/status/create-repository-status'

const createRepositoryController = {
  options: {
    auth: {
      strategy: 'azure-oidc',
      access: {
        scope: [config.get('oidcAdminGroupId'), '{payload.teamId}']
      }
    },
    validate: {
      payload: repositoryValidation,
      failAction: () => Boom.boomify(Boom.badRequest())
    }
  },
  handler: async (request, h) => {
    const gitHubOrg = config.get('gitHubOrg')

    const payload = request?.payload
    const repositoryName = payload?.repositoryName

    const { team } = await request.server.methods.fetchTeam(payload?.teamId)
    if (isNil(team?.github)) {
      throw Boom.badData(`Team ${team.name} does not have a linked Github team`)
    }

    request.logger.info(`Creating repository: ${repositoryName}`)

    await createRepositoryStatus(
      request.db,
      gitHubOrg,
      repositoryName,
      payload,
      team
    )
    await createRepository(request, repositoryName, payload, team)

    return h
      .response({
        message: 'Repository creation has started',
        repositoryName,
        statusUrl: `/status/${repositoryName}`
      })
      .code(200)
  }
}

export { createRepositoryController }
