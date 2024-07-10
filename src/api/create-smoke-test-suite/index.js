import { createSmokeTestSuiteController } from '~/src/api/create-smoke-test-suite/controller'

const createSmokeTestSuite = {
  plugin: {
    name: 'create-smoke-test-suite',
    register: async (server) => {
      server.route([
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
