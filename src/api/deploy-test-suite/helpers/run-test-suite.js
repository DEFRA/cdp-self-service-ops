import { randomUUID } from 'node:crypto'

import { config } from '../../../config/index.js'
import { generateTestRunMessage } from './generate-test-run-message.js'
import { sendSnsMessage } from '../../../helpers/sns/send-sns-message.js'
import { recordTestRun } from './record-test-run.js'
import { getLatestAppConfigCommitSha } from '../../../helpers/portal-backend/get-latest-app-config-commit-sha.js'
import { getLatestImage } from '../../../helpers/portal-backend/get-latest-image.js'

const snsRunTestTopic = config.get('snsRunTestTopicArn')

async function runTestSuite({
  imageName,
  environment,
  user,
  cpu,
  memory,
  snsClient,
  deployment,
  logger
}) {
  const runId = randomUUID()

  const configCommitSha = await getLatestAppConfigCommitSha(environment, logger)
  if (!configCommitSha) {
    logger.error(
      'Error encountered whilst attempting to get latest cdp-app-config sha'
    )
    return null
  }

  logger.info(`Config commit sha ${configCommitSha}`)

  const latestImage = await getLatestImage(imageName)
  const tag = latestImage?.tag ?? null

  const runMessage = generateTestRunMessage({
    imageName,
    environment,
    cpu,
    memory,
    user,
    deployment,
    tag,
    runId,
    configCommitSha
  })

  await sendSnsMessage(snsClient, snsRunTestTopic, runMessage, logger)

  // Inform the backend about the new test run so it can track the results.
  await recordTestRun({
    imageName,
    environment,
    cpu,
    memory,
    user,
    deployment,
    tag,
    runId,
    configCommitSha
  })

  return runId
}

export { runTestSuite }
