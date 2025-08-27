import { triggerTestSuiteValidation } from '../helpers/trigger-test-suite-validation.js'
import { runTestSuite } from '../helpers/run-test-suite.js'
import { validatePortalBackendRequest } from '../../helpers/pre/validate-portal-backend-request.js'
import { statusCodes } from '@defra/cdp-validation-kit/src/constants/status-codes.js'

const triggerTestSuiteController = {
  options: {
    pre: [validatePortalBackendRequest],
    validate: {
      payload: triggerTestSuiteValidation
    },
    payload: {
      output: 'data',
      parse: true,
      allow: 'application/json'
    }
  },
  handler: async (request, h) => {
    const { imageName, environment, user, cpu, memory, deployment } =
      request.payload
    const snsClient = request.snsClient
    const logger = request.logger

    const runId = await runTestSuite({
      imageName,
      environment,
      user,
      cpu,
      memory,
      snsClient,
      deployment,
      logger
    })

    if (!runId) {
      return h
        .response({ message: 'Failed to send SNS message' })
        .code(statusCodes.internalError)
    }

    return h.response({ message: 'success', runId }).code(statusCodes.ok)
  }
}

export { triggerTestSuiteController }
