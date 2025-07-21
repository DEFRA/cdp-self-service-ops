import path from 'path'
import hapi from '@hapi/hapi'

import { config } from '../config/index.js'
import { router } from '../plugins/router.js'
import { failAction } from '../helpers/fail-action.js'
import { requestLogger } from '../plugins/request-logger.js'
import { azureOidc } from '../plugins/azure-oidc.js'
import { mongoDb } from '../plugins/mongodb.js'
import { snsClientPlugin } from '../plugins/sns-client.js'
import { secureContext } from '../helpers/secure-context/index.js'
import { sqsClient } from '../plugins/sqs-client.js'
import { pulse } from '../plugins/pulse.js'
import { requestTracing } from '../plugins/request-tracing.js'
import { setupProxy } from '../helpers/proxy/setup-proxy.js'
import { catchAll } from '../helpers/errors/catch-all.js'

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

  server.ext('onPreResponse', catchAll)

  return server
}

export { createServer }
