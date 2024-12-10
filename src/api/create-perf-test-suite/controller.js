import Boom from '@hapi/boom'

import { config } from '~/src/config/index.js'
import { creations } from '~/src/constants/creations.js'
import { createTestRunnerSuite } from '~/src/helpers/create/create-test-runner-suite.js'
import { testSuiteValidation } from '~/src/api/helpers/schema/test-suite-validation.js'

const createPerfTestSuiteController = {
  options: {
    auth: {
      strategy: 'azure-oidc',
      access: {
        scope: ['admin', '{payload.teamId}']
      }
    },
    validate: {
      payload: testSuiteValidation,
      failAction: () => Boom.boomify(Boom.badRequest())
    }
  },
  handler: async (request, h) => {
    const payload = request?.payload
    const repositoryName = payload.repositoryName
    const templateTag = payload.templateTag
    const user = request.auth?.credentials

    await createTestRunnerSuite(
      request,
      repositoryName,
      creations.perfTestsuite,
      payload?.teamId,
      user,
      config.get('workflows.createPerfTestSuite'),
      'cdp-perf-test-suite-template',
      templateTag,
      ['performance']
    )

    return h
      .response({
        message: 'Perf test suite creation has started',
        repositoryName,
        statusUrl: `/status/${repositoryName}`
      })
      .code(200)
  }
}

export { createPerfTestSuiteController }
