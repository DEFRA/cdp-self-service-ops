import path from 'path'
import hapi from '@hapi/hapi'
import jwt from '@hapi/jwt'

import { appConfig } from '~/src/config'
import { router } from '~/src/api/router'
import { failAction } from '~/src/helpers/fail-action'
import { requestLogger } from '~/src/helpers/logging/request-logger'
import { azureOidc } from '~/src/helpers/azure-oidc'
import { mongoPlugin } from '~/src/helpers/mongodb'
import { githubEventsPlugin } from '~/src/listeners/github/github-events-plugin'

async function createServer() {
  const server = hapi.server({
    port: appConfig.get('port'),
    routes: {
      validate: {
        options: {
          abortEarly: false
        },
        failAction
      },
      files: {
        relativeTo: path.resolve(appConfig.get('root'), '.public')
      }
    },
    router: {
      stripTrailingSlash: true
    }
  })

  await server.register(requestLogger)

  await server.register(jwt)

  await server.register(azureOidc)

  await server.register({ plugin: mongoPlugin, options: {} })

  await server.register({ plugin: githubEventsPlugin, options: {} })

  await server.register(router, {
    routes: { prefix: `${appConfig.get('appPathPrefix')}` }
  })

  return server
}

export { createServer }
