import crypto from 'node:crypto'

import { config } from '~/src/config/index.js'
import { generateTestRunMessage } from '~/src/api/deploy-test-suite/helpers/generate-test-run-message'
import { sendSnsMessage } from '~/src/helpers/sns/send-sns-message'
import { createRecordTestRun } from '~/src/api/deploy-test-suite/helpers/record-test-run'

const snsRunTestTopic = config.get('snsRunTestTopicArn')

async function runTestSuite(imageName, environment, user, snsClient, logger) {
  const runId = crypto.randomUUID()

  const runMessage = generateTestRunMessage(imageName, environment, runId, user)

  const snsResponse = await sendSnsMessage({
    snsClient,
    topic: snsRunTestTopic,
    message: runMessage,
    logger
  })

  if (!snsResponse) {
    logger.error('Failed to send SNS message')
    return null
  }

  logger.info(`SNS Run Test response: ${JSON.stringify(snsResponse, null, 2)}`)

  // Inform the backend about the new test run so it can track the results.
  await createRecordTestRun(imageName, runId, environment, user)

  return runId
}

export { runTestSuite }
