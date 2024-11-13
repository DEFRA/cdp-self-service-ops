import { deployWebShellController } from '~/src/api/deploy-webshell/controllers/deploy-webshell'
import { withTracing } from '~/src/helpers/tracing/tracing'

const deployWebShell = {
  plugin: {
    name: 'deploy-webshell',
    register: async (server) => {
      server.route(
        [
          {
            method: 'POST',
            path: '/deploy-webshell',
            ...deployWebShellController
          }
        ].map(withTracing)
      )
    }
  }
}

export { deployWebShell }
