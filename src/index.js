import process from 'node:process'

import { createLogger } from '~/src/helpers/logging/logger'
import { startServer } from '~/src/helpers/start-server'

startServer().catch((error) => {
  const logger = createLogger()
  logger.info('Server failed to start :(')
  logger.error(error)

  process.exitCode = 1
})

process.on('unhandledRejection', (error) => {
  const logger = createLogger()
  logger.info('Unhandled rejection')
  logger.error(error)
  process.exitCode = 1
})
