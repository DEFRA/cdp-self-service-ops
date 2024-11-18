import { createEnvTestSuiteController } from '~/src/api/create-env-test-suite/controller'
import { withTracing } from '~/src/helpers/tracing/tracing'

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
