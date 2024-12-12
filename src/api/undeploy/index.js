import { undeployServiceController } from '~/src/api/undeploy/controllers/index.js'

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
