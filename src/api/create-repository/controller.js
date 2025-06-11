import Boom from '@hapi/boom'

import { config } from '~/src/config/index.js'
import { repositoryValidation } from '~/src/api/create-repository/helpers/schema/repository-validation.js'
import { fetchTeam } from '~/src/helpers/fetch-team.js'
import { createInitialEntity } from '~/src/helpers/create/create-initial-entity.js'
import { createTemplatedRepo } from '~/src/helpers/create/workflows/create-templated-repo.js'

const createRepositoryController = {
  options: {
    auth: {
      strategy: 'azure-oidc',
      access: {
        scope: ['admin', '{payload.teamId}']
      }
    },
    validate: {
      payload: repositoryValidation,
      failAction: () => Boom.boomify(Boom.badRequest())
    }
  },
  handler: async (request, h) => {
    const payload = request?.payload
    const repositoryName = payload?.repositoryName
    const visibility = payload?.repositoryVisibility

    const { team } = await fetchTeam(payload?.teamId)
    if (!team?.github) {
      throw Boom.badData(`Team ${team.name} does not have a linked Github team`)
    }

    request.logger.info(`Creating repository: ${repositoryName}`)

    await createInitialEntity({
      repositoryName,
      entityType: 'Repository',
      undefined,
      team,
      user: request.auth?.credentials
    })

    await createTemplatedRepo(
      request.logger,
      config.get('workflows.createRepository'),
      repositoryName,
      team.github,
      ['cdp', 'repository'],
      { repositoryVisibility: visibility }
    )

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
