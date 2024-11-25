import { createEnvTestSuiteController } from '~/src/api/create-env-test-suite/controller.js'

// TODO This is now creating "Journey tests" rename to create-journey-test-suite
const createEnvTestSuite = {
  plugin: {
    name: 'create-env-test-suite',
    register: async (server) => {
      await server.route([
        {
          method: 'POST',
          path: '/create-env-test-suite',
          ...createEnvTestSuiteController
        }
      ])
    }
  }
}

export { createEnvTestSuite }
