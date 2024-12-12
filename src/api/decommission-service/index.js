import { decommissionServiceController } from '~/src/api/decommission-service/controller.js'

const decommissionService = {
  plugin: {
    name: 'decommission-service',
    register: async (server) => {
      await server.route([
        {
          method: 'DELETE',
          path: '/decommission/{serviceName}',
          ...decommissionServiceController
        }
      ])
    }
  }
}

export { decommissionService }
