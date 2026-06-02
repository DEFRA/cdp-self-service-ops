import { createLogger } from '../logging/logger.js'

const logger = createLogger()

export function setupProxy() {
  if (process.env.HTTPS_PROXY) {
    logger.info('Routing outbound requests via proxy')
  }
}
