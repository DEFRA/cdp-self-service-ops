import Boom from '@hapi/boom'
import { config } from '~/src/config'
import { envTestSuiteValidation } from '~/src/api/create-env-test-suite/helpers/schema/env-test-suite-validation'
import { creations } from '~/src/constants/creations'
import { createTestRunnerSuite } from '~/src/helpers/create/create-test-runner-suite'

const createEnvTestSuiteController = {
  options: {
    auth: {
      strategy: 'azure-oidc',
      access: {
        scope: [config.get('oidcAdminGroupId'), '{payload.teamId}']
      }
    },
    validate: {
      payload: envTestSuiteValidation,
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
      creations.envTestsuite,
      payload?.teamId,
      user,
      config.get('workflows.createEnvTestSuite'),
      ['environment']
    )

    return h
      .response({
        message: 'Env test suite creation has started',
        repositoryName,
        statusUrl: `/status/${repositoryName}`
      })
      .code(200)
  }
}

export { createEnvTestSuiteController }
