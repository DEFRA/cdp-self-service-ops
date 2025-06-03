import {
  deployServiceController,
  deployServiceOptionsController,
  existingServiceInfoController
} from '~/src/api/deploy/controllers/index.js'
import { autoDeployServiceController } from '~/src/api/deploy/controllers/auto-deploy-service.js'
import { deployToZeroController } from '~/src/api/deploy/controllers/deploy-to-zero.js'

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
          method: 'GET',
          path: '/deploy-service/info/{environment}/{imageName}',
          ...existingServiceInfoController
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
