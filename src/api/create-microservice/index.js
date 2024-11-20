import { createMicroserviceController } from '~/src/api/create-microservice/controller.js'

const createMicroservice = {
  plugin: {
    name: 'create-microservice',
    register: async (server) => {
      server.route([
        {
          method: 'POST',
          path: '/create-microservice',
          ...createMicroserviceController
        }
      ])
    }
  }
}

export { createMicroservice }
