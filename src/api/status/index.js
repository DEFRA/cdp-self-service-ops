import { createServiceStatusController } from '~/src/api/status/controllers/create-service-status'
import { inProgressController } from '~/src/api/status/controllers/in-progress'

// TODO are these in the right place? Maybe move when the codebase has settled a little
const status = {
  plugin: {
    name: 'status',
    register: async (server) => {
      server.route([
        {
          method: 'GET',
          path: '/create-service/status/{repositoryName}',
          ...createServiceStatusController
        },
        {
          method: 'GET',
          path: '/create-service/status',
          ...inProgressController
        }
      ])
    }
  }
}

export { status }
