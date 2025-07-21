import { addSecretController } from './controllers/add-secret.js'

const secrets = {
  plugin: {
    name: 'secrets',
    register: async (server) => {
      await server.route([
        {
          method: 'POST',
          path: '/secrets/add/{serviceName}/{environment}',
          ...addSecretController
        }
      ])
    }
  }
}

export { secrets }
