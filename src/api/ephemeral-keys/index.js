import { addEphemeralKeyController } from './controllers/add-ephemeral-key.js'

const ephemeralKeys = {
  plugin: {
    name: 'ephemeral-keys',
    register: async (server) => {
      await server.route([
        {
          method: 'POST',
          path: '/ephemeral-keys/{environment}',
          ...addEphemeralKeyController
        }
      ])
    }
  }
}

export { ephemeralKeys }
