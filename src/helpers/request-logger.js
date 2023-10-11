import hapiPino from 'hapi-pino'
import ecsFormat from '@elastic/ecs-pino-format'

import { appConfig } from '~/src/config'

const isDevelopment = appConfig.get('isDevelopment')
const isProduction = appConfig.get('isProduction')

const requestLogger = {
  plugin: hapiPino,
  options: {
    enabled: !appConfig.get('isTest'),
    redact: {
      paths: ['req.headers.authorization', 'req.headers.cookie', 'res.headers'],
      remove: true
    },
    level: appConfig.get('logLevel'),
    ...(isDevelopment && { transport: { target: 'pino-pretty' } }),
    ...(isProduction && ecsFormat())
  }
}

export { requestLogger }
