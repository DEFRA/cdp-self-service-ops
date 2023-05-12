import { create } from '~/src/api/v1/create'
import { deploy } from '~/src/api/v1/deploy'
const routerV1 = {
  plugin: {
    name: 'V1 Router',
    register: async (server) => {
      await server.register([create, deploy])
    }
  }
}

export { routerV1 }
