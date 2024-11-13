import { createPerfTestSuiteController } from '~/src/api/create-perf-test-suite/controller'
import { withTracing } from '~/src/helpers/tracing/tracing'

const createPerfTestSuite = {
  plugin: {
    name: 'create-perf-test-suite',
    register: async (server) => {
      server.route(
        [
          {
            method: 'POST',
            path: '/create-perf-test-suite',
            ...createPerfTestSuiteController
          }
        ].map(withTracing)
      )
    }
  }
}

export { createPerfTestSuite }
