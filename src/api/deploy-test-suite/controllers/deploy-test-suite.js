import Boom from '@hapi/boom'

import { deployTestSuiteValidation } from '~/src/api/deploy-test-suite/helpers/deploy-test-suite-validation'
import { generateTestRunMessage } from '~/src/api/deploy-test-suite/helpers/generate-test-run-message'
import { sendSnsMessage } from '~/src/helpers/sns/send-sns-message'
import crypto from 'node:crypto'
import { config } from '~/src/config'
import { createRecordTestRun } from '~/src/api/deploy-test-suite/helpers/record-test-run'
import { isOwnerOfSuite } from '~/src/api/deploy-test-suite/helpers/is-owner-of-suite'
import { canRunInEnvironment } from '~/src/api/deploy-test-suite/helpers/can-run-in-environment'

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
    const payload = request.payload
    const user = {
      id: request.auth?.credentials?.id,
      displayName: request.auth?.credentials?.displayName
    }
    const scope = request.auth?.credentials?.scope

    if (!isOwnerOfSuite(payload.imageName, scope)) {
      throw Boom.forbidden(
        `Insufficient permissions to start test-suite ${payload.imageName}`
      )
    }

    // Only admins can run test suites in the admin environments
    if (!canRunInEnvironment(payload.environment, scope)) {
      throw Boom.forbidden(
        'Insufficient permissions to run suite in this environment'
      )
    }

    const runId = crypto.randomUUID()

    request.logger.info(`Running test suite ${payload.imageName} ${runId}`)

    const runMessage = generateTestRunMessage(
      payload.imageName,
      payload.environment,
      runId,
      user
    )

    const topic = config.get('snsRunTestTopicArn')
    const snsResponse = await sendSnsMessage({
      snsClient: request.snsClient,
      topic,
      message: runMessage,
      logger: request.logger
    })
    request.logger.info(
      `SNS Run Test response: ${JSON.stringify(snsResponse, null, 2)}`
    )

    // Inform the backend about the new test run so it can track the results.
    await createRecordTestRun(
      payload.imageName,
      runId,
      payload.environment,
      user
    )

    return h.response({ message: 'success', runId }).code(200)
  }
}

export { deployTestSuiteController }
