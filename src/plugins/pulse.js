import hapiPulse from 'hapi-pulse'

import { createLogger } from '../helpers/logging/logger.js'

const tenSeconds = 10 * 1000

const pulse = {
  plugin: hapiPulse,
  options: {
    logger: createLogger(),
    timeout: tenSeconds
  }
}

export { pulse }
