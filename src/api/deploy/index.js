import { deployServiceController } from '~/src/api/deploy/deploy-service-controller'
import { deploymentInfoController } from '~/src/api/deploy/deployment-info-controller'
import { deploymentInfoForServiceController } from '~/src/api/deploy/deployment-info-for-service-controller'
import { validEcsCpuAndMemoryController } from '~/src/api/deploy/valid-ecs-cpu-and-memory-controller'

const deploy = {
  plugin: {
    name: 'deploy',
    register: async (server) => {
      server.route([
        {
          method: 'POST',
          path: '/deploy-service',
          ...deployServiceController
        },
        {
          method: 'GET',
          path: '/deployment-info/{env}',
          ...deploymentInfoController
        },
        {
          method: 'GET',
          path: '/deployment-info/{env}/{service}',
          ...deploymentInfoForServiceController
        },
        {
          method: 'GET',
          path: '/deployment-options',
          ...validEcsCpuAndMemoryController
        }
      ])
    }
  }
}

export { deploy }
