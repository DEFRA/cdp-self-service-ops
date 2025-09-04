import Boom from '@hapi/boom'
import { statusCodes, scopes } from '@defra/cdp-validation-kit'

import { config } from '../../config/index.js'
import { repositoryValidation } from './helpers/schema/repository-validation.js'
import { fetchTeam } from '../../helpers/fetch-team.js'
import { createTemplatedRepo } from '../../helpers/create/workflows/index.js'
import { createInitialEntity } from '../../helpers/create/create-initial-entity.js'

const createRepositoryController = {
  options: {
    auth: {
      strategy: 'azure-oidc',
      access: {
        scope: [scopes.admin, 'team:{payload.teamId}']
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

    const team = await fetchTeam(payload?.teamId)
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
      .code(statusCodes.ok)
  }
}

export { createRepositoryController }
