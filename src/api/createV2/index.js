import { createServiceV2Controller } from '~/src/api/createV2/controller'

const createv2 = {
  plugin: {
    name: 'createv2',
    register: async (server) => {
      server.route([
        {
          method: 'POST',
          path: '/create-service-v2',
          ...createServiceV2Controller
        }
      ])
    }
  }
}

export { createv2 }
