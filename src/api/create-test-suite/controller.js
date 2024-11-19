import Boom from '@hapi/boom'

import { config } from '~/src/config/index.js'
import { testSuiteValidation } from '~/src/api/create-test-suite/helpers/schema/test-suite-validation.js'
import { createTemplatedRepo } from '~/src/helpers/create/workflows/create-templated-repo.js'
import { fetchTeam } from '~/src/helpers/fetch-team.js'
import { creations } from '~/src/constants/creations.js'
import { initCreationStatus } from '~/src/helpers/create/init-creation-status.js'

const createTestSuiteController = {
  options: {
    auth: {
      strategy: 'azure-oidc',
      access: {
        scope: [config.get('oidc.adminGroupId'), '{payload.teamId}']
      }
    },
    validate: {
      payload: testSuiteValidation,
      failAction: () => Boom.boomify(Boom.badRequest())
    }
  },
  handler: async (request, h) => {
    const org = config.get('github.org')

    const payload = request?.payload
    const repositoryName = payload?.repositoryName

    const { team } = await fetchTeam(payload?.teamId)
    if (!team?.github) {
      throw Boom.badData(`Team ${team.name} does not have a linked Github team`)
    }

    request.logger.info(`Creating repository: ${repositoryName}`)

    await initCreationStatus(
      request.db,
      org,
      creations.testsuite,
      repositoryName,
      config.get('workflows.createJourneyTest'),
      undefined,
      team,
      request.auth?.credentials,
      [config.get('github.repos.createWorkflows')]
    )

    await createTemplatedRepo(
      request,
      config.get('workflows.createJourneyTest'),
      repositoryName,
      team.github,
      ['cdp', 'repository', 'test-suite', 'journey']
    )

    return h
      .response({
        message: 'Test suite creation has started',
        repositoryName,
        statusUrl: `/status/${repositoryName}`
      })
      .code(200)
  }
}

export { createTestSuiteController }
