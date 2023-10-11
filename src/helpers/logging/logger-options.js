import ecsFormat from '@elastic/ecs-pino-format'

import { appConfig } from '~/src/config'

const loggerOptions = {
  enabled: !appConfig.get('isTest'),
  redact: {
    paths: ['req.headers.authorization', 'req.headers.cookie', 'res.headers'],
    remove: true
  },
  level: appConfig.get('logLevel'),
  ...(appConfig.get('isDevelopment')
    ? { transport: { target: 'pino-pretty' } }
    : ecsFormat())
}

export { loggerOptions }
