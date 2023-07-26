import {
  deployServiceOptionsController,
  deployServiceController,
  existingServiceInfoController
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
          path: '/deploy-service/options',
          ...deployServiceOptionsController
        },
        {
          method: 'GET',
          path: '/deploy-service/info/{environment}/{imageName}',
          ...existingServiceInfoController
        }
      ])
    }
  }
}

export { deploy }
