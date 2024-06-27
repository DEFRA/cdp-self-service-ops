import path from 'path'
import hapi from '@hapi/hapi'

import { config } from '~/src/config'
import { router } from '~/src/api/router'
import { failAction } from '~/src/helpers/fail-action'
import { requestLogger } from '~/src/helpers/logging/request-logger'
import { azureOidc } from '~/src/helpers/azure-oidc'
import { mongoPlugin } from '~/src/helpers/mongodb'
import { gitHubEventsPlugin } from '~/src/listeners/github/github-events-plugin'
import { snsClientPlugin } from '~/src/helpers/sns-client'
import { registerServerMethods } from '~/src/api/server-methods'
import { secureContext } from '~/src/helpers/secure-context'
import { setupWreckAgents } from '~/src/helpers/proxy/setup-wreck-agents'
import { proxyAgent } from '~/src/helpers/proxy/proxy-agent'

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

  await server.register(azureOidc)

  await server.register({ plugin: mongoPlugin, options: {} })

  if (config.get('sqsGitHubEnabled')) {
    await server.register(gitHubEventsPlugin)
  }

  await server.register({ plugin: snsClientPlugin, options: {} })

  await server.register(router)

  registerServerMethods(server)

  return server
}

export { createServer }
