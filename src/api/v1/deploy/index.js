import { deployServiceController } from '~/src/api/v1/deploy/controller'

const deploy = {
  plugin: {
    name: 'deploy',
    register: async (server) => {
      server.route([
        {
          method: 'POST',
          path: '/deploy-service',
          ...deployServiceController
        }
      ])
    }
  }
}

export { deploy }
