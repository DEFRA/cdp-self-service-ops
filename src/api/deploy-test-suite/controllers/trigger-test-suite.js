import { triggerTestSuiteValidation } from '~/src/api/deploy-test-suite/helpers/trigger-test-suite-validation.js'
import { runTestSuite } from '~/src/api/deploy-test-suite/helpers/run-test-suite.js'

const triggerTestSuiteController = {
  options: {
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
    const { imageName, environment, user, cpu, memory } = request.payload
    const snsClient = request.snsClient
    const logger = request.logger

    const runId = await runTestSuite({
      imageName,
      environment,
      user,
      cpu,
      memory,
      snsClient,
      logger
    })

    if (!runId) {
      return h.response({ message: 'Failed to send SNS message' }).code(500)
    }

    return h.response({ message: 'success', runId }).code(200)
  }
}

export { triggerTestSuiteController }
