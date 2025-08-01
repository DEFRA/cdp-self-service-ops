import { createRepositoryController } from './controller.js'

const createRepository = {
  plugin: {
    name: 'create-repository',
    register: async (server) => {
      await server.route([
        {
          method: 'POST',
          path: '/create-repository',
          ...createRepositoryController
        }
      ])
    }
  }
}

export { createRepository }
