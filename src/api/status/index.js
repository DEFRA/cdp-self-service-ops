import { createServiceStatusController } from '~/src/api/status/createStatusController'

const status = {
  plugin: {
    name: 'status',
    register: async (server) => {
      server.route([
        {
          method: 'GET',
          path: '/create-service/status/{repo}',
          ...createServiceStatusController
        }
      ])
    }
  }
}

export { status }
