import Boom from '@hapi/boom'

import { deployTestSuiteValidation } from '../helpers/deploy-test-suite-validation.js'
import { isOwnerOfSuite } from '../helpers/is-owner-of-suite.js'
import { canRunInEnvironment } from '../helpers/can-run-in-environment.js'
import { runTestSuite } from '../helpers/run-test-suite.js'
import { statusCodes } from '@defra/cdp-validation-kit/src/constants/status-codes.js'

const deployTestSuiteController = {
  options: {
    auth: {
      strategy: 'azure-oidc'
    },
    validate: {
      payload: deployTestSuiteValidation
    },
    payload: {
      output: 'data',
      parse: true,
      allow: 'application/json'
    }
  },
  handler: async (request, h) => {
    const { imageName, environment, cpu, memory } = request.payload
    const credentials = request.auth?.credentials
    const user = {
      id: credentials?.id,
      displayName: credentials?.displayName
    }
    const scope = credentials?.scope
    const snsClient = request.snsClient
    const logger = request.logger

    const isOwner = await isOwnerOfSuite(imageName, scope)

    if (!isOwner) {
      throw Boom.forbidden(
        `Insufficient permissions to start test-suite ${imageName}`
      )
    }

    // Only admins can run test suites in the admin environments
    if (!canRunInEnvironment(environment, scope)) {
      throw Boom.forbidden(
        'Insufficient permissions to run suite in this environment'
      )
    }

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
      return h
        .response({ message: 'Failed to send SNS message' })
        .code(statusCodes.internalError)
    }

    return h.response({ runId }).code(statusCodes.ok)
  }
}

export { deployTestSuiteController }
