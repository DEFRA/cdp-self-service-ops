import crypto from 'node:crypto'

import { config } from '~/src/config/index.js'
import { generateTestRunMessage } from '~/src/api/deploy-test-suite/helpers/generate-test-run-message.js'
import { sendSnsMessage } from '~/src/helpers/sns/send-sns-message.js'
import { recordTestRun } from '~/src/api/deploy-test-suite/helpers/record-test-run.js'
import { getLatestAppConfigCommitSha } from '~/src/helpers/portal-backend/get-latest-app-config-commit-sha.js'

const snsRunTestTopic = config.get('snsRunTestTopicArn')

async function runTestSuite(imageName, environment, user, snsClient, logger) {
  const runId = crypto.randomUUID()

  const configLatestCommitSha = await getLatestAppConfigCommitSha(
    environment,
    logger
  )
  if (!configLatestCommitSha) {
    logger.error(
      'Error encountered whilst attempting to get latest cdp-app-config sha'
    )
    return null
  }

  logger.info(`Config commit sha ${configLatestCommitSha}`)

  const runMessage = generateTestRunMessage(
    imageName,
    environment,
    runId,
    user,
    configLatestCommitSha
  )

  const snsResponse = await sendSnsMessage(
    snsClient,
    snsRunTestTopic,
    runMessage,
    logger
  )

  if (!snsResponse) {
    logger.error('Failed to send SNS message')
    return null
  }

  logger.info(`SNS Run Test response: ${JSON.stringify(snsResponse, null, 2)}`)

  // Inform the backend about the new test run so it can track the results.
  await recordTestRun(
    imageName,
    runId,
    environment,
    user,
    configLatestCommitSha
  )

  return runId
}

export { runTestSuite }
