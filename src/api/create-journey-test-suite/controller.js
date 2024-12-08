import Boom from '@hapi/boom'

import { config } from '~/src/config/index.js'
import { creations } from '~/src/constants/creations.js'
import { journeyTestSuiteValidation } from '~/src/api/create-journey-test-suite/helpers/schema/journey-test-suite-validation.js'
import { createTestRunnerSuite } from '~/src/helpers/create/create-test-runner-suite.js'

const createJourneyTestSuiteController = {
  options: {
    auth: {
      strategy: 'azure-oidc',
      access: {
        scope: ['admin', '{payload.teamId}']
      }
    },
    validate: {
      payload: journeyTestSuiteValidation,
      failAction: () => Boom.boomify(Boom.badRequest())
    }
  },
  handler: async (request, h) => {
    const payload = request?.payload
    const repositoryName = payload?.repositoryName
    const user = request.auth?.credentials

    await createTestRunnerSuite(
      request,
      repositoryName,
      creations.journeyTestsuite,
      payload?.teamId,
      user,
      config.get('workflows.createJourneyTestSuite'),
      'cdp-node-env-test-suite-template', // TODO update template to new journey tests template name
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
