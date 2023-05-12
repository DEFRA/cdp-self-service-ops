import path from 'path'
import hapi from '@hapi/hapi'
import { appConfig } from '~/src/config'

import { router } from './router'
import { routerV1 } from '~/src/api/v1/router'
import { requestLogger } from '~/src/helpers/request-logger'
import { catchAll } from '~/src/helpers/errors'
import { failAction } from '~/src/helpers/fail-action'

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

  await server.register(router)

  await server.register(routerV1)

  server.ext('onPreResponse', catchAll)

  return server
}

export { createServer }
