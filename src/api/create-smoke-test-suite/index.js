import { createSmokeTestSuiteController } from '~/src/api/create-smoke-test-suite/controller.js'
import { withTracing } from '~/src/helpers/tracing/tracing.js'

const createSmokeTestSuite = {
  plugin: {
    name: 'create-smoke-test-suite',
    register: async (server) => {
      server.route(
        [
          {
            method: 'POST',
            path: '/create-smoke-test-suite',
            ...createSmokeTestSuiteController
          }
        ].map(withTracing)
      )
    }
  }
}

export { createSmokeTestSuite }
