import { createMicroserviceController } from '~/src/api/create-microservice/controller'

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
