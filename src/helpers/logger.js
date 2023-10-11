import pino from 'pino'
import ecsFormat from '@elastic/ecs-pino-format'

import { appConfig } from '~/src/config'

function createLogger() {
  if (appConfig.get('isProduction')) {
    return pino({ ...ecsFormat(), level: appConfig.get('logLevel') })
  }

  return pino({
    enabled: !appConfig.get('isTest'),
    level: appConfig.get('logLevel'),
    transport: { target: 'pino-pretty' }
  })
}

export { createLogger }
