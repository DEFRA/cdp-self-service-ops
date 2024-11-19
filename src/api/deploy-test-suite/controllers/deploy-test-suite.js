import Boom from '@hapi/boom'

import { deployTestSuiteValidation } from '~/src/api/deploy-test-suite/helpers/deploy-test-suite-validation.js'
import { isOwnerOfSuite } from '~/src/api/deploy-test-suite/helpers/is-owner-of-suite.js'
import { canRunInEnvironment } from '~/src/api/deploy-test-suite/helpers/can-run-in-environment.js'
import { runTestSuite } from '~/src/api/deploy-test-suite/helpers/run-test-suite.js'

const deployTestSuiteController = {
  options: {
    auth: {
      strategy: 'azure-oidc'
    },
    validate: {
      payload: deployTestSuiteValidation()
    },
    payload: {
      output: 'data',
      parse: true,
      allow: 'application/json'
    }
  },
  handler: async (request, h) => {
    const { imageName, environment } = request.payload
    const user = {
      id: request.auth?.credentials?.id,
      displayName: request.auth?.credentials?.displayName
    }
    const scope = request.auth?.credentials?.scope

    request.logger.info({ scope }, '--------')

    if (!isOwnerOfSuite(imageName, scope)) {
      throw Boom.forbidden(
        `Insufficient permissions to start test-suite ${imageName}`
      )
    }

    // Only admins can run test suites in the admin environments
    if (!canRunInEnvironment(environment, scope)) {
      throw Boom.forbidden(
        'Insufficient permissions to run suite in this environment'
      )
    }

    const runId = await runTestSuite(
      imageName,
      environment,
      user,
      request.snsClient,
      request.logger
    )

    if (!runId) {
      return h.response({ message: 'Failed to send SNS message' }).code(500)
    }

    return h.response({ message: 'success', runId }).code(200)
  }
}

export { deployTestSuiteController }
