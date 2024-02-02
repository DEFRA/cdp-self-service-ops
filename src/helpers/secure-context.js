import tls from 'node:tls'

import { config } from '~/src/config'

const secureContext = {
  plugin: {
    name: 'secure-context',
    register: async (server) => {
      const originalCreateSecureContext = tls.createSecureContext

      tls.createSecureContext = (options) => {
        const trustStore = config
          .get('trustStore')
          .map((item) => Buffer.from(item, 'base64').toString())

        if (!trustStore) {
          throw new Error(`Could not find and TRUSTSTORE_ certificates`)
        }

        const context = originalCreateSecureContext(options)
        trustStore.forEach((cert) => {
          context.context.addCACert(cert.trim())
        })

        return context
      }

      server.decorate('server', 'getSecureContext', () => tls.SecureContext)
    }
  }
}

export { secureContext }
