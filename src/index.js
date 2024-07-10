import { createLogger } from '~/src/helpers/logging/logger'
import { startServer } from '~/src/helpers/start-server'
import process from 'node:process'

startServer()

process.on('unhandledRejection', (error) => {
  const logger = createLogger()
  logger.info('Unhandled rejection')
  logger.error(error)
  process.exitCode = 1
})
