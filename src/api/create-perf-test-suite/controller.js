import Boom from '@hapi/boom'
import { config } from '../../config/index.js'
import { createTestRunnerSuite } from '../../helpers/create/create-test-runner-suite.js'
import { testSuiteValidation } from '../helpers/schema/test-suite-validation.js'
import { entitySubTypes } from '../../constants/entities.js'

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

    await createTestRunnerSuite({
      logger: request.logger,
      repositoryName,
      entitySubType: entitySubTypes.performance,
      teamId: payload?.teamId,
      user,
      templateWorkflow: config.get('workflows.createPerfTestSuite'),
      templateTag
    })

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
