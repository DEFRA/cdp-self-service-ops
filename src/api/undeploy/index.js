import {
  undeployServiceController,
  undeployServiceFromAllEnvironmentController,
  undeployServiceFromEnvironmentController
} from '~/src/api/undeploy/controllers/undeploy-service.js'

const undeploy = {
  plugin: {
    name: 'undeploy',
    register: async (server) => {
      await server.route([
        {
          method: 'DELETE',
          path: '/undeploy-service/{imageName}/all',
          ...undeployServiceFromAllEnvironmentController
        },
        {
          method: 'DELETE',
          path: '/undeploy-service/{imageName}/{environment}',
          ...undeployServiceFromEnvironmentController
        },
        {
          method: 'DELETE',
          path: '/undeploy-service',
          ...undeployServiceController
        }
      ])
    }
  }
}

export { undeploy }
