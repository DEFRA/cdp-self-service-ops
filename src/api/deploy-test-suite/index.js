import { deployTestSuiteController } from '~/src/api/deploy-test-suite/controllers/deploy-test-suite.js'
import { triggerTestSuiteController } from '~/src/api/deploy-test-suite/controllers/trigger-test-suite.js'
import { stopTestSuiteController } from '~/src/api/deploy-test-suite/controllers/stop-test-suite.js'

const deployTestSuite = {
  plugin: {
    name: 'deploy-test-suite',
    register: async (server) => {
      server.route([
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
