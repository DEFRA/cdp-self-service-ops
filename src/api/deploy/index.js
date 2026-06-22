import {
  deployServiceController,
  deployServiceOptionsController
} from './controllers/index.js'
import { autoDeployServiceController } from './controllers/auto-deploy-service.js'
import { deployToZeroController } from './controllers/deploy-to-zero.js'

const deploy = {
  plugin: {
    name: 'deploy',
    register: async (server) => {
      await server.route([
        {
          method: 'POST',
          path: '/deploy-service',
          ...deployServiceController
        },
        {
          method: 'POST',
          path: '/auto-deploy-service',
          ...autoDeployServiceController
        },
        {
          method: 'GET',
          path: '/deploy-service/options',
          ...deployServiceOptionsController
        },
        {
          method: 'POST',
          path: '/deploy-service/to-zero/{environment}/{serviceName}',
          ...deployToZeroController
        }
      ])
    }
  }
}

export { deploy }
