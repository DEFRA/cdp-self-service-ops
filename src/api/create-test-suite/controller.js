import Boom from '@hapi/boom'

import { config } from '~/src/config'
import { testSuiteValidation } from '~/src/api/create-test-suite/helpers/schema/test-suite-validation'
import { createTestSuiteStatus } from '~/src/api/create-test-suite/helpers/status/create-test-suite-status'
import { createTemplatedRepo } from '~/src/helpers/create/create-templated-repo'
import { fetchTeam } from '~/src/helpers/fetch-team'

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
    const gitHubOrg = config.get('gitHubOrg')

    const payload = request?.payload
    const repositoryName = payload?.repositoryName

    const { team } = await fetchTeam(payload?.teamId)
    if (!team?.github) {
      throw Boom.badData(`Team ${team.name} does not have a linked Github team`)
    }

    request.logger.info(`Creating repository: ${repositoryName}`)

    await createTestSuiteStatus(
      request.db,
      gitHubOrg,
      repositoryName,
      payload,
      team
    )

    const template = config.get('createJourneyTestWorkflow')
    const topics = ['cdp', 'test', 'test-suite', 'journey']
    await createTemplatedRepo(request, template, repositoryName, team, topics)

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
