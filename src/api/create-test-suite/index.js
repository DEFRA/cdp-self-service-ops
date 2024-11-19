import { createTestSuiteController } from '~/src/api/create-test-suite/controller.js'
import { withTracing } from '~/src/helpers/tracing/tracing.js'

const createTestSuite = {
  plugin: {
    name: 'create-test-suite',
    register: async (server) => {
      server.route(
        [
          {
            method: 'POST',
            path: '/create-tests',
            ...createTestSuiteController
          }
        ].map(withTracing)
      )
    }
  }
}

export { createTestSuite }
