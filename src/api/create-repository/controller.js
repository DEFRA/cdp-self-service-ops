import Boom from '@hapi/boom'

import { config } from '~/src/config'
import { repositoryValidation } from '~/src/api/create-repository/helpers/schema/repository-validation'
import { fetchTeam } from '~/src/helpers/fetch-team'
import { creations } from '~/src/constants/creations'
import { initCreationStatus } from '~/src/helpers/create/init-creation-status'
import { createTemplatedRepo } from '~/src/helpers/create/workflows/create-templated-repo'

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
    const org = config.get('github.org')

    const payload = request?.payload
    const repositoryName = payload?.repositoryName
    const visibility = payload?.repositoryVisibility

    const { team } = await fetchTeam(payload?.teamId)
    if (!team?.github) {
      throw Boom.badData(`Team ${team.name} does not have a linked Github team`)
    }

    request.logger.info(`Creating repository: ${repositoryName}`)

    await initCreationStatus(
      request.db,
      org,
      creations.repository,
      repositoryName,
      config.get('workflows.createRepository'),
      undefined,
      team,
      request.auth?.credentials,
      [config.get('github.repos.createWorkflows')]
    )

    await createTemplatedRepo(
      request,
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
