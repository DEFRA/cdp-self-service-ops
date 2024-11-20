import { createSmokeTestSuiteController } from '~/src/api/create-smoke-test-suite/controller.js'

const createSmokeTestSuite = {
  plugin: {
    name: 'create-smoke-test-suite',
    register: async (server) => {
      await server.route([
        {
          method: 'POST',
          path: '/create-smoke-test-suite',
          ...createSmokeTestSuiteController
        }
      ])
    }
  }
}

export { createSmokeTestSuite }
