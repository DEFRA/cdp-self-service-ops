import Boom from '@hapi/boom'

import { config } from '~/src/config/index.js'
import { creations } from '~/src/constants/creations.js'
import { createTestRunnerSuite } from '~/src/helpers/create/create-test-runner-suite.js'
import { testSuiteValidation } from '~/src/api/helpers/schema/test-suite-validation.js'

const createJourneyTestSuiteController = {
  options: {
    auth: {
      strategy: 'azure-oidc',
      access: {
        scope: ['admin', '{payload.teamId}']
      }
    },
    validate: {
      payload: testSuiteValidation,
      failAction: () => Boom.boomify(Boom.badRequest())
    }
  },
  handler: async (request, h) => {
    const payload = request?.payload
    const repositoryName = payload?.repositoryName
    const templateTag = payload?.templateTag
    const user = request.auth?.credentials

    await createTestRunnerSuite(
      request.logger,
      repositoryName,
      creations.journeyTestsuite,
      payload?.teamId,
      user,
      config.get('workflows.createJourneyTestSuite'),
      'cdp-node-env-test-suite-template', // TODO update template to new journey tests template name
      templateTag,
      ['journey']
    )

    return h
      .response({
        message: 'Journey test suite creation has started',
        repositoryName,
        statusUrl: `/status/${repositoryName}`
      })
      .code(200)
  }
}

export { createJourneyTestSuiteController }
