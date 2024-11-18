import { createRepositoryController } from '~/src/api/create-repository/controller'
import { withTracing } from '~/src/helpers/tracing/tracing'

const createRepository = {
  plugin: {
    name: 'create-repository',
    register: async (server) => {
      server.route(
        [
          {
            method: 'POST',
            path: '/create-repository',
            ...createRepositoryController
          }
        ].map(withTracing)
      )
    }
  }
}

export { createRepository }
