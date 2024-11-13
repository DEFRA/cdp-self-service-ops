import { createMicroserviceController } from '~/src/api/create-microservice/controller'
import { withTracing } from '~/src/helpers/tracing/tracing'

const createMicroservice = {
  plugin: {
    name: 'create-microservice',
    register: async (server) => {
      server.route(
        [
          {
            method: 'POST',
            path: '/create-microservice',
            ...createMicroserviceController
          }
        ].map(withTracing)
      )
    }
  }
}

export { createMicroservice }
