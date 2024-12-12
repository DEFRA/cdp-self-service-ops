import {
  deployServiceOptionsController,
  deployServiceController,
  existingServiceInfoController
} from '~/src/api/deploy/controllers/index.js'

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
