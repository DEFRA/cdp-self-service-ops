import { shutterServiceController } from './controllers/shutter-service.js'
import { unshutterServiceController } from './controllers/unshutter-service.js'

const shutter = {
  plugin: {
    name: 'shutter',
    register: async (server) => {
      await server.route([
        {
          method: 'POST',
          path: '/shutter-url',
          ...shutterServiceController
        },
        {
          method: 'POST',
          path: '/unshutter-url',
          ...unshutterServiceController
        }
      ])
    }
  }
}

export { shutter }
