import { health } from '~/src/api/health'

const router = {
  plugin: {
    name: 'Base Router',
    register: async (server) => {
      await server.register([health])
    }
  }
}

export { router }
