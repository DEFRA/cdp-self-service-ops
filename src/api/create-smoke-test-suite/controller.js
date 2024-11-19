import Boom from '@hapi/boom'

import { config } from '~/src/config/index.js'
import { creations } from '~/src/constants/creations.js'
import { smokeTestSuiteValidation } from '~/src/api/create-smoke-test-suite/helpers/schema/smoke-test-suite-validation.js'
import { createTestRunnerSuite } from '~/src/helpers/create/create-test-runner-suite.js'

const createSmokeTestSuiteController = {
  options: {
    auth: {
      strategy: 'azure-oidc',
      access: {
        scope: [config.get('oidc.adminGroupId'), '{payload.teamId}']
      }
    },
    validate: {
      payload: smokeTestSuiteValidation,
      failAction: () => Boom.boomify(Boom.badRequest())
    }
  },
  handler: async (request, h) => {
    const payload = request?.payload
    const repositoryName = payload?.repositoryName
    const user = request.auth?.credentials

    await createTestRunnerSuite(
      request,
      repositoryName,
      creations.smokeTestSuite,
      payload?.teamId,
      user,
      config.get('workflows.createSmokeTestSuite'),
      ['smoke']
    )

    return h
      .response({
        message: 'Smoke test suite creation has started',
        repositoryName,
        statusUrl: `/status/${repositoryName}`
      })
      .code(200)
  }
}

export { createSmokeTestSuiteController }
