import { healthController } from './controller.js'

const health = {
  plugin: {
    name: 'health',
    register: async (server) => {
      await server.route({
        method: 'GET',
        path: '/health',
        ...healthController
      })
    }
  }
}

export { health }
