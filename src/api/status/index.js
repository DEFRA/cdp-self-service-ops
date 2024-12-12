import {
  inProgressController,
  repositoryStatusController
} from '~/src/api/status/controllers/index.js'

const status = {
  plugin: {
    name: 'status',
    register: async (server) => {
      await server.route([
        {
          method: 'GET',
          path: '/status/in-progress',
          ...inProgressController
        },
        {
          method: 'GET',
          path: '/status/{repositoryName}',
          ...repositoryStatusController
        }
      ])
    }
  }
}

export { status }
