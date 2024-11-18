import {
  inProgressController,
  repositoryStatusController
} from '~/src/api/status/controllers'
import { withTracing } from '~/src/helpers/tracing/tracing'

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
