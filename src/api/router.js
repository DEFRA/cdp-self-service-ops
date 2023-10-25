import { health } from '~/src/api/health'
import { create } from '~/src/api/create'
import { deploy } from '~/src/api/deploy'
import { status } from '~/src/api/status'
import { createv2 } from '~/src/api/createV2'

const router = {
  plugin: {
    name: 'Router',
    register: async (server) => {
      await server.register([health, create, createv2, deploy, status])
    }
  }
}

export { router }
