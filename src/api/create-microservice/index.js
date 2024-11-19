import { createMicroserviceController } from '~/src/api/create-microservice/controller.js'
import { withTracing } from '~/src/helpers/tracing/tracing.js'

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
