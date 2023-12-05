import { createRepositoryController } from '~/src/api/create-repository/controller'

const createRepository = {
  plugin: {
    name: 'create-repository',
    register: async (server) => {
      server.route([
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
