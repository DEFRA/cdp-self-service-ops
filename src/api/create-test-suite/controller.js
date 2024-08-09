import Boom from '@hapi/boom'

import { config } from '~/src/config'
import { testSuiteValidation } from '~/src/api/create-test-suite/helpers/schema/test-suite-validation'
import { createTemplatedRepo } from '~/src/helpers/create/create-templated-repo'
import { fetchTeam } from '~/src/helpers/fetch-team'
import { creations } from '~/src/constants/creations'
import { initCreationStatus } from '~/src/api/create-microservice/helpers/save-status'

const createTestSuiteController = {
  options: {
    auth: {
      strategy: 'azure-oidc',
      access: {
        scope: [config.get('oidcAdminGroupId'), '{payload.teamId}']
      }
    },
    validate: {
      payload: testSuiteValidation,
      failAction: () => Boom.boomify(Boom.badRequest())
    }
  },
  handler: async (request, h) => {
    const org = config.get('gitHubOrg')

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
      config.get('createJourneyTestWorkflow'),
      undefined,
      team,
      request.auth?.credentials,
      [config.get('github.repos.createWorkflows')]
    )

    await createTemplatedRepo(
      request,
      config.get('createJourneyTestWorkflow'),
      repositoryName,
      team,
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
