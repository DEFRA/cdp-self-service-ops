import Boom from '@hapi/boom'
import Joi from 'joi'

import { config } from '../../../config/index.js'
import { fetchTestRun } from '../helpers/fetch-test-run.js'
import { isOwnerOfSuite } from '../helpers/is-owner-of-suite.js'
import { sendSnsMessage } from '../../../helpers/sns/send-sns-message.js'
import { runIdValidation } from '@defra/cdp-validation-kit/src/validations.js'

const stopTestSuiteController = {
  options: {
    auth: {
      strategy: 'azure-oidc'
    },
    validate: {
      payload: Joi.object({
        runId: runIdValidation
      })
    },
    payload: {
      output: 'data',
      parse: true,
      allow: 'application/json'
    }
  },
  handler: async (request, h) => {
    const testRun = await fetchTestRun(request.payload.runId)

    const credentials = request.auth?.credentials
    const user = {
      id: credentials?.id,
      displayName: credentials?.displayName
    }
    const scope = credentials?.scope

    const isOwner = await isOwnerOfSuite(testRun.testSuite, scope)

    if (!isOwner) {
      throw Boom.forbidden(
        `Insufficient permissions to stop test-suite ${testRun.runId}`
      )
    }

    const topic = config.get('snsStopTestTopicArn')
    const taskId = getTaskId(testRun.taskArn)
    const message = {
      environment: testRun.environment,
      task_id: taskId,
      deployed_by: user.displayName
    }

    request.logger.info(`Stopping task ${taskId} in ${testRun.environment}`)

    const snsResponse = await sendSnsMessage(
      request.snsClient,
      topic,
      message,
      request.logger,
      testRun.environment,
      taskId
    )
    request.logger.info(
      `SNS Stop Test response: ${JSON.stringify(snsResponse, null, 2)}`
    )

    return h.response({ message: 'success' }).code(200)
  }
}

/**
 * Split a full task ARN into just the task ID.
 * @param {string} taskArn
 * @returns {string}
 */
function getTaskId(taskArn) {
  const parts = taskArn.split('/')
  return parts[parts.length - 1]
}

export { stopTestSuiteController }
