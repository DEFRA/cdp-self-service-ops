import path from 'path'
import hapi from '@hapi/hapi'

import { config } from '../config/index.js'
import { router } from '../plugins/router.js'
import { failAction } from '../helpers/fail-action.js'
import { requestLogger } from '../plugins/request-logger.js'
import { azureOidc } from '../plugins/azure-oidc.js'
import { mongoDb } from '../plugins/mongodb.js'
import { snsClientPlugin } from '../plugins/sns-client.js'
import { secureContext } from '@defra/hapi-secure-context'
import { pulse } from '../plugins/pulse.js'
import { requestTracing } from '../plugins/request-tracing.js'
import { catchAll } from '../helpers/errors/catch-all.js'

async function createServer() {
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

  await server.register([
    requestLogger,
    requestTracing,
    secureContext,
    pulse,
    azureOidc,
    { plugin: mongoDb.plugin, options: config.get('mongo') },
    snsClientPlugin,
    router
  ])

  server.ext('onPreResponse', catchAll)

  return server
}

export { createServer }
