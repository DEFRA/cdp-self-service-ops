import { health } from '~/src/api/health'
import { deploy } from '~/src/api/deploy'
import { status } from '~/src/api/status'
import { create } from '~/src/api/createV2'

const router = {
  plugin: {
    name: 'Router',
    register: async (server) => {
      await server.register([health, create, deploy, status])
    }
  }
}

export { router }
