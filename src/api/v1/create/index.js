import { createServiceController } from '~/src/api/v1/create/controller'

const create = {
  plugin: {
    name: 'create',
    register: async (server) => {
      server.route([
        {
          method: 'POST',
          path: '/create-service',
          ...createServiceController
        }
      ])
    }
  }
}

export { create }
