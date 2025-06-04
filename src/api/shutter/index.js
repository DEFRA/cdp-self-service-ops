import { shutterServiceController } from '~/src/api/shutter/controllers/shutter-service.js'
import { unshutterServiceController } from '~/src/api/shutter/controllers/unshutter-service.js'

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
