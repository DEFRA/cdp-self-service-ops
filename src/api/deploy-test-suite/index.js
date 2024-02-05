import { deployTestSuiteController } from '~/src/api/deploy-test-suite/controllers/deploy-test-suite'

const deployTestSuite = {
  plugin: {
    name: 'deploy-test-suite',
    register: async (server) => {
      server.route([
        {
          method: 'POST',
          path: '/deploy-test-suite',
          ...deployTestSuiteController
        }
      ])
    }
  }
}

export { deployTestSuite }
