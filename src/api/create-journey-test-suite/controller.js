import Boom from '@hapi/boom'
import {
  scopes,
  statusCodes,
  entitySubTypes,
  entityTypes
} from '@defra/cdp-validation-kit'

import { config } from '../../config/index.js'
import { createTestRunnerSuite } from '../../helpers/create/create-test-runner-suite.js'
import { testSuiteValidation } from '../helpers/schema/test-suite-validation.js'

const createJourneyTestSuiteController = {
  options: {
    auth: {
      strategy: 'azure-oidc',
      access: {
        scope: [scopes.admin, 'team:{payload.teamId}']
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

    await createTestRunnerSuite({
      logger: request.logger,
      repositoryName,
      entityType: entityTypes.testSuite,
      entitySubType: entitySubTypes.journey,
      teamId: payload?.teamId,
      user,
      templateWorkflow: config.get('workflows.createJourneyTestSuite'),
      templateTag
    })

    return h
      .response({
        message: 'Journey test suite creation has started',
        repositoryName,
        statusUrl: `/status/${repositoryName}`
      })
      .code(statusCodes.ok)
  }
}

export { createJourneyTestSuiteController }
