import {
  inProgressController,
  repositoryStatusController
} from '~/src/api/status/controllers/index.js'
import { withTracing } from '~/src/helpers/tracing/tracing.js'

const status = {
  plugin: {
    name: 'status',
    register: async (server) => {
      server.route(
        [
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
        ].map(withTracing)
      )
    }
  }
}

export { status }
