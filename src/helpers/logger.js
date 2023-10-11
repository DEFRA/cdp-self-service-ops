import pino from 'pino'
import ecsFormat from '@elastic/ecs-pino-format'

import { appConfig } from '~/src/config'

function createLogger() {
  const isDevelopment = appConfig.get('isDevelopment')
  const isProduction = appConfig.get('isProduction')

  return pino({
    enabled: !appConfig.get('isTest'),
    level: appConfig.get('logLevel'),
    ...(isDevelopment && { transport: { target: 'pino-pretty' } }),
    ...(isProduction && ecsFormat())
  })
}

export { createLogger }
