import {
  deployServiceController,
  deploymentInfoController,
  deploymentInfoForServiceController,
  validEcsCpuAndMemoryController
} from '~/src/api/deploy/controllers'

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
