import { statusController } from '~/src/api/status/controllers/status'
import { inProgressController } from '~/src/api/status/controllers/in-progress'

const status = {
  plugin: {
    name: 'status',
    register: async (server) => {
      server.route([
        {
          method: 'GET',
          path: '/status/{repositoryName}',
          ...statusController
        },
        {
          method: 'GET',
          path: '/status',
          ...inProgressController
        }
      ])
    }
  }
}

export { status }
