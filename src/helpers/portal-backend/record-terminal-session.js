import { config } from '../../config/index.js'
import { fetcher } from '../fetcher.js'

async function recordTerminalSession(session, logger) {
  const url = `${config.get('portalBackendUrl')}/terminal`
  const response = await fetcher(url, {
    method: 'post',
    headers: { 'Content-Type': 'application/json' }
  })
  const json = await response.json()

  if (response.ok) {
    return json
  }

  logger.error(
    `Error attempting to record terminal session: '${json.message}' statusCode: '${response.status}'`
  )
}

export { recordTerminalSession }
