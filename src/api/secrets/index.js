import { addSecretController } from './controllers/add-secret.js'
import { removeSecretController } from './controllers/remove-secret.js'

const secrets = {
  plugin: {
    name: 'secrets',
    register: async (server) => {
      await server.route([
        {
          method: 'POST',
          path: '/secrets/add/{serviceName}/{environment}',
          ...addSecretController
        },
        {
          method: 'POST',
          path: '/secrets/remove/{serviceName}/{environment}',
          ...removeSecretController
        }
      ])
    }
  }
}

export { secrets }
