import { triggerTestSuiteValidation } from '~/src/api/deploy-test-suite/helpers/trigger-test-suite-validation'
import { runTestSuite } from '~/src/api/deploy-test-suite/helpers/run-test-suite'

const triggerTestSuiteController = {
  options: {
    validate: {
      payload: triggerTestSuiteValidation()
    },
    payload: {
      output: 'data',
      parse: true,
      allow: 'application/json'
    }
  },
  handler: async (request, h) => {
    const { imageName, environment, user } = request.payload

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

export { triggerTestSuiteController }