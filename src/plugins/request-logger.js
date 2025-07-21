import hapiPino from 'hapi-pino'

import { loggerOptions } from '../helpers/logging/logger-options.js'

const requestLogger = {
  plugin: hapiPino,
  options: loggerOptions
}

export { requestLogger }
