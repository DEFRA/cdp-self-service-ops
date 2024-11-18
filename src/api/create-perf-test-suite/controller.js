import Boom from '@hapi/boom'
import { config } from '~/src/config'
import { perfTestSuiteValidation } from '~/src/api/create-perf-test-suite/helpers/schema/perf-test-suite-validation'
import { creations } from '~/src/constants/creations'
import { createTestRunnerSuite } from '~/src/helpers/create/create-test-runner-suite'

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
