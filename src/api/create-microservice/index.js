import { createMicroserviceController } from './controller.js'
import { serviceTemplatesController } from './service-templates-controller.js'

const createMicroservice = {
  plugin: {
    name: 'create-microservice',
    register: async (server) => {
      await server.route([
        {
          method: 'POST',
          path: '/create-microservice',
          ...createMicroserviceController
        },
        {
          method: 'GET',
          path: '/service-templates',
          ...serviceTemplatesController
        }
      ])
    }
  }
}

export { createMicroservice }
