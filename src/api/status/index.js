import { createServiceStatusController } from '~/src/api/status/createStatusController'
import { inProgressController } from '~/src/api/status/inProgressController'

const status = {
  plugin: {
    name: 'status',
    register: async (server) => {
      server.route([
        {
          method: 'GET',
          path: '/create-service/status/{repo}',
          ...createServiceStatusController
        },
        {
          method: 'GET',
          path: '/create-service',
          ...inProgressController
        }
      ])
    }
  }
}

export { status }
