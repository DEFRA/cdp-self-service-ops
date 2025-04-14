import path from 'path'
import hapi from '@hapi/hapi'

import { config } from '~/src/config/index.js'
import { router } from '~/src/plugins/router.js'
import { failAction } from '~/src/helpers/fail-action.js'
import { requestLogger } from '~/src/plugins/request-logger.js'
import { azureOidc } from '~/src/plugins/azure-oidc.js'
import { mongoDb } from '~/src/plugins/mongodb.js'
import { snsClientPlugin } from '~/src/plugins/sns-client.js'
import { secureContext } from '~/src/helpers/secure-context/index.js'
import { sqsClient } from '~/src/plugins/sqs-client.js'
import { pulse } from '~/src/plugins/pulse.js'
import { requestTracing } from '~/src/plugins/request-tracing.js'
import { setupProxy } from '~/src/helpers/proxy/setup-proxy.js'

const enableSecureContext = config.get('enableSecureContext')

async function createServer() {
  setupProxy()

  const server = hapi.server({
    port: config.get('port'),
    routes: {
      validate: {
        options: {
          abortEarly: false
        },
        failAction
      },
      files: {
        relativeTo: path.resolve(config.get('root'), '.public')
      },
      security: {
        hsts: {
          maxAge: 31536000,
          includeSubDomains: true,
          preload: false
        },
        xss: 'enabled',
        noSniff: true,
        xframe: true
      }
    },
    router: {
      stripTrailingSlash: true
    }
  })

  // Add tracer and request logger before all other plugins
  await server.register([requestTracing, requestLogger])

  if (enableSecureContext) {
    await server.register(secureContext)
  }

  await server.register([
    pulse,
    azureOidc,
    sqsClient,
    mongoDb,
    snsClientPlugin,
    router
  ])

  return server
}

export { createServer }
