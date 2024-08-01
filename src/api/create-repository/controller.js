import Boom from '@hapi/boom'

import { config } from '~/src/config'
import { createRepository } from '~/src/api/create-repository/helpers/workflow/create-repository'
import { repositoryValidation } from '~/src/api/create-repository/helpers/schema/repository-validation'
import { createRepositoryStatus } from '~/src/api/create-repository/helpers/status/create-repository-status'
import { fetchTeam } from '~/src/helpers/fetch-team'

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
    const visibility = payload?.repositoryVisibility

    const { team } = await fetchTeam(payload?.teamId)
    if (!team?.github) {
      throw Boom.badData(`Team ${team.name} does not have a linked Github team`)
    }

    request.logger.info(`Creating repository: ${repositoryName}`)

    await createRepositoryStatus(
      request.db,
      gitHubOrg,
      repositoryName,
      payload,
      team.github
    )
    await createRepository(request, repositoryName, visibility, team.github)

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
