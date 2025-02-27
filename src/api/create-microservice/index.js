import { createMicroserviceController } from '~/src/api/create-microservice/controller.js'
import { serviceTemplatesController } from '~/src/api/create-microservice/service-templates-controller.js'

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
