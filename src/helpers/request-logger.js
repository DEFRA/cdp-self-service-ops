import hapiPino from 'hapi-pino'

import { appConfig } from '~/src/config'

const requestLogger = {
  plugin: hapiPino,
  options: {
    enabled: !appConfig.get('isTest'),
    level: appConfig.get('logLevel'),
    ...(appConfig.get('isDevelopment') && {
      transport: { target: 'pino-pretty' }
    })
  }
}

export { requestLogger }
