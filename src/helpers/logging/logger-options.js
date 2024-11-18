import ecsFormat from '@elastic/ecs-pino-format'

import { config } from '~/src/config'

const logConfig = config.get('log')
const serviceName = config.get('serviceName')
const serviceVersion = config.get('serviceVersion')

const formatters = {
  ecs: {
    ...ecsFormat(),
    base: {
      service: {
        name: serviceName,
        type: 'node',
        version: serviceVersion
      }
    }
  },
  'pino-pretty': { transport: { target: 'pino-pretty' } }
}
const loggerOptions = {
  enabled: logConfig.enabled,
  ignorePaths: ['/health'],
  redact: {
    paths: logConfig.redact,
    remove: true
  },
  level: logConfig.level,
  ...formatters[logConfig.format]
}

export { loggerOptions }
