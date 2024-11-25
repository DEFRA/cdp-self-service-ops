import Boom from '@hapi/boom'

import { config } from '~/src/config/index.js'
import { perfTestSuiteValidation } from '~/src/api/create-perf-test-suite/helpers/schema/perf-test-suite-validation.js'
import { creations } from '~/src/constants/creations.js'
import { createTestRunnerSuite } from '~/src/helpers/create/create-test-runner-suite.js'

const createPerfTestSuiteController = {
  options: {
    auth: {
      strategy: 'azure-oidc',
      access: {
        scope: [config.get('oidc.adminGroupId'), '{payload.teamId}']
      }
    },
    validate: {
      payload: perfTestSuiteValidation,
      failAction: () => Boom.boomify(Boom.badRequest())
    }
  },
  handler: async (request, h) => {
    const payload = request?.payload
    const repositoryName = payload.repositoryName
    const user = request.auth?.credentials

    await createTestRunnerSuite(
      request,
      repositoryName,
      creations.perfTestsuite,
      payload?.teamId,
      user,
      config.get('workflows.createPerfTestSuite'),
      'cdp-perf-test-suite-template',
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
