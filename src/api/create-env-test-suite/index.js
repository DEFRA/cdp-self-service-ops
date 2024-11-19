import { createEnvTestSuiteController } from '~/src/api/create-env-test-suite/controller.js'
import { withTracing } from '~/src/helpers/tracing/tracing.js'

const createEnvTestSuite = {
  plugin: {
    name: 'create-env-test-suite',
    register: async (server) => {
      server.route(
        [
          {
            method: 'POST',
            path: '/create-env-test-suite',
            ...createEnvTestSuiteController
          }
        ].map(withTracing)
      )
    }
  }
}

export { createEnvTestSuite }
