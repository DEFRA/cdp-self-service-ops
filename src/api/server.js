import path from 'path'
import hapi from '@hapi/hapi'

import { config } from '~/src/config'
import { router } from '~/src/plugins/router'
import { failAction } from '~/src/helpers/fail-action'
import { requestLogger } from '~/src/plugins/request-logger'
import { azureOidc } from '~/src/plugins/azure-oidc'
import { mongoDb } from '~/src/plugins/mongodb'
import { snsClientPlugin } from '~/src/plugins/sns-client'
import { secureContext } from '~/src/helpers/secure-context'
import { setupWreckAgents } from '~/src/helpers/proxy/setup-wreck-agents'
import { proxyAgent } from '~/src/helpers/proxy/proxy-agent'
import { gitHubEventsListener } from '~/src/plugins/sqs-listener'
import { sqsClient } from '~/src/plugins/sqs-client'
import { pulse } from '~/src/plugins/pulse'
import { tracing } from '~/src/helpers/tracing/tracing'

const enableSecureContext = config.get('enableSecureContext')

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

  // Add tracer and request logger before all other plugins
  await server.register([tracing, requestLogger])

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

  if (config.get('sqsGitHubEvents.enabled')) {
    await server.register(gitHubEventsListener)
  }

  return server
}

export { createServer }
