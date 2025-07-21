import { deployTestSuiteController } from './controllers/deploy-test-suite.js'
import { triggerTestSuiteController } from './controllers/trigger-test-suite.js'
import { stopTestSuiteController } from './controllers/stop-test-suite.js'

const deployTestSuite = {
  plugin: {
    name: 'deploy-test-suite',
    register: async (server) => {
      await server.route([
        {
          method: 'POST',
          path: '/deploy-test-suite',
          ...deployTestSuiteController
        },
        {
          method: 'POST',
          path: '/trigger-test-suite',
          ...triggerTestSuiteController
        },
        {
          method: 'POST',
          path: '/stop-test-suite',
          ...stopTestSuiteController
        }
      ])
    }
  }
}

export { deployTestSuite }
