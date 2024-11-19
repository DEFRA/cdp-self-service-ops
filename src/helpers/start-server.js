import { config } from '~/src/config/index.js'
import { createServer } from '~/src/api/server.js'

async function startServer() {
  const server = await createServer()
  await server.start()

  server.logger.info('Server started successfully')
  server.logger.info(
    `Access your backend on http://localhost:${config.get('port')}`
  )
  return server
}

export { startServer }
