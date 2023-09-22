import { health } from '~/src/api/health'
import { create } from '~/src/api/create'
import { deploy } from '~/src/api/deploy'
import { status } from '~/src/api/status'

const router = {
  plugin: {
    name: 'Router',
    register: async (server) => {
      await server.register([health, create, deploy, status])
    }
  }
}

export { router }
