import { createTestSuiteController } from '~/src/api/create-test-suite/controller'
import { withTracing } from '~/src/helpers/tracing/tracing'

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
