import Boom from '@hapi/boom'
import Joi from 'joi'

import { config } from '~/src/config/index.js'
import { fetchTestRun } from '~/src/api/deploy-test-suite/helpers/fetch-test-run.js'
import { isOwnerOfSuite } from '~/src/api/deploy-test-suite/helpers/is-owner-of-suite.js'
import { sendSnsMessage } from '~/src/helpers/sns/send-sns-message.js'
import { runIdValidation } from '~/src/api/helpers/schema/common-validations.js'

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

    const user = {
      id: request.auth?.credentials?.id,
      displayName: request.auth?.credentials?.displayName
    }
    const scope = request.auth?.credentials?.scope

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
