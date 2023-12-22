import { createServiceV2Controller } from '~/src/api/createV2/controller'

const create = {
  plugin: {
    name: 'create',
    register: async (server) => {
      server.route([
        {
          method: 'POST',
          path: '/create-microservice',
          ...createServiceV2Controller
        }
      ])
    }
  }
}

export { create }
