import path from 'path'
import hapi from '@hapi/hapi'
import { appConfig } from '~/src/config'

import { router } from '~/src/api/router'
import { failAction } from '~/src/helpers/fail-action'
import { requestLogger } from '~/src/helpers/request-logger'

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

  await server.register(router, {
    routes: { prefix: `${appConfig.get('appPathPrefix')}` }
  })

  return server
}

export { createServer }
