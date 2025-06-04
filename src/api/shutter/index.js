import { shutterServiceController } from '~/src/api/shutter/controllers/shutter-service.js'

const shutter = {
  plugin: {
    name: 'shutter',
    register: async (server) => {
      await server.route([
        {
          method: 'POST',
          path: '/shutter/{serviceName}',
          ...shutterServiceController
        }
      ])
    }
  }
}

export { shutter }
