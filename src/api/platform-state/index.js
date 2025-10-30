import { republishPlatformStateMessagesController } from './controllers/republish-platform-state-messages.js'

const platformState = {
  plugin: {
    name: 'platform-state',
    register: async (server) => {
      await server.route([
        {
          method: 'POST',
          path: '/republish-platform-state-messages',
          ...republishPlatformStateMessagesController
        }
      ])
    }
  }
}

export { platformState }
