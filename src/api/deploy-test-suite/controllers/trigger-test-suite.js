import crypto from 'node:crypto'

import { config } from '~/src/config'
import { triggerTestSuiteValidation } from '~/src/api/deploy-test-suite/helpers/trigger-test-suite-validation'
import { generateTestRunMessage } from '~/src/api/deploy-test-suite/helpers/generate-test-run-message'
import { createRecordTestRun } from '~/src/api/deploy-test-suite/helpers/record-test-run'
import { sendSnsMessage } from '~/src/helpers/sns/send-sns-message'

const botUser = {
  id: 'cdp-bot',
  displayName: 'CDP Bot'
}
const snsRunTestTopic = config.get('snsRunTestTopicArn')

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
    const { imageName, environment } = request.payload

    const runId = crypto.randomUUID()

    const runMessage = generateTestRunMessage(
      imageName,
      environment,
      runId,
      botUser
    )
    const snsResponse = await sendSnsMessage({
      snsClient: request.snsClient,
      topic: snsRunTestTopic,
      message: runMessage,
      logger: request.logger
    })

    if (!snsResponse) {
      request.logger.error('Failed to send SNS message')
      return h.response({ message: 'Failed to send SNS message' }).code(500)
    }

    request.logger.info(
      `SNS Run Test response: ${JSON.stringify(snsResponse, null, 2)}`
    )

    // Inform the backend about the new test run so it can track the results.
    await createRecordTestRun(imageName, runId, environment, botUser)

    return h.response({ message: 'success', runId }).code(200)
  }
}

export { triggerTestSuiteController }
