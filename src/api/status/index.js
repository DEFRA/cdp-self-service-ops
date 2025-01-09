import { inProgressController } from '~/src/api/status/controllers/in-progress.js'
import { repositoryStatusController } from '~/src/api/status/controllers/repository-status.js'
import { inProgressFiltersController } from '~/src/api/status/controllers/in-progress-filters.js'

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
          path: '/status/in-progress/filters',
          ...inProgressFiltersController
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
