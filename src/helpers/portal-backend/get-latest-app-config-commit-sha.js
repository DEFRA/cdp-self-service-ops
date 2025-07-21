import { config } from '../../config/index.js'
import { fetcher } from '../fetcher.js'

async function getLatestAppConfigCommitSha(environment, logger) {
  const url = `${config.get('portalBackendUrl')}/config/latest/${environment}`
  const response = await fetcher(url, {
    method: 'get',
    headers: { 'Content-Type': 'application/json' }
  })
  const json = await response.json()

  if (response.ok) {
    return json?.commitSha
  }

  logger.error(
    `Error attempting to retrieve latest cdp-app-config sha - message: '${json.message}' statusCode: '${response.status}'`
  )
}

export { getLatestAppConfigCommitSha }
