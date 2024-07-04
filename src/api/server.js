import path from 'path'
import hapi from '@hapi/hapi'

import { config } from '~/src/config'
import { router } from '~/src/plugins/router'
import { failAction } from '~/src/helpers/fail-action'
import { requestLogger } from '~/src/plugins/request-logger'
import { azureOidc } from '~/src/plugins/azure-oidc'
import { mongoPlugin } from '~/src/plugins/mongodb'
import { snsClientPlugin } from '~/src/plugins/sns-client'
import { registerServerMethods } from '~/src/api/server-methods'
import { secureContext } from '~/src/helpers/secure-context'
import { setupWreckAgents } from '~/src/helpers/proxy/setup-wreck-agents'
import { proxyAgent } from '~/src/helpers/proxy/proxy-agent'
import { gitHubEventsListener } from '~/src/plugins/sqs-listener'
import { sqsClient } from '~/src/plugins/sqs-client'

const isProduction = config.get('isProduction')

async function createServer() {
  setupWreckAgents(proxyAgent())

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

  await server.register(requestLogger)

  if (isProduction) {
    await server.register(secureContext)
  }

  await server.register([
    azureOidc,
    sqsClient,
    mongoPlugin,
    snsClientPlugin,
    router
  ])

  if (config.get('sqsGitHubEvents.enabled')) {
    await server.register(gitHubEventsListener)
  }

  registerServerMethods(server)

  return server
}

export { createServer }
