import { addSecretController } from '~/src/api/secrets/controllers/add-secret'

const secrets = {
  plugin: {
    name: 'secrets',
    register: async (server) => {
      server.route([
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
