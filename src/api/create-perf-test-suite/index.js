import { createPerfTestSuiteController } from './controller.js'

const createPerfTestSuite = {
  plugin: {
    name: 'create-perf-test-suite',
    register: async (server) => {
      await server.route([
        {
          method: 'POST',
          path: '/create-perf-test-suite',
          ...createPerfTestSuiteController
        }
      ])
    }
  }
}

export { createPerfTestSuite }
