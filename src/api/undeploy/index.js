import { undeployServiceController } from '~/src/api/undeploy/controllers/undeploy-service.js'

const undeploy = {
  plugin: {
    name: 'undeploy',
    register: async (server) => {
      await server.route([
        {
          method: 'POST',
          path: '/undeploy-service',
          ...undeployServiceController
        }
      ])
    }
  }
}

export { undeploy }
