import { createSmokeTestSuiteController } from '~/src/api/create-smoke-test-suite/controller'
import { withTracing } from '~/src/helpers/tracing/tracing'

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
