import { createTestSuiteController } from '~/src/api/create-test-suite/controller'

const createTestSuite = {
  plugin: {
    name: 'create-test-suite',
    register: async (server) => {
      server.route([
        {
          method: 'POST',
          path: '/create-tests',
          ...createTestSuiteController
        }
      ])
    }
  }
}

export { createTestSuite }
