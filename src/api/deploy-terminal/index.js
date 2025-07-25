import { deployTerminalController } from './controllers/deploy-terminal.js'

const deployTerminal = {
  plugin: {
    name: 'deploy-terminal',
    register: async (server) => {
      await server.route([
        {
          method: 'POST',
          path: '/deploy-terminal',
          ...deployTerminalController
        }
      ])
    }
  }
}

export { deployTerminal }
