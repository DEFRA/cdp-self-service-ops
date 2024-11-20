import { createMicroserviceController } from '~/src/api/create-microservice/controller.js'

const createMicroservice = {
  plugin: {
    name: 'create-microservice',
    register: async (server) => {
      await server.route([
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
