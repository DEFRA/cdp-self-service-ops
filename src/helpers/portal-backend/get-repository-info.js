import { config } from '../../config/index.js'
import { fetcher } from '../fetcher.js'

async function getRepositoryInfo(serviceName, logger) {
  const url = `${config.get('portalBackendUrl')}/repositories/${serviceName}`
  const response = await fetcher(url, {
    method: 'get',
    headers: { 'Content-Type': 'application/json' }
  })
  const json = await response.json()

  if (response.ok) {
    return json
  }

  logger.error(
    `Error attempting to retrieve repository information for ${serviceName}: '${json.message}' statusCode: '${response.status}'`
  )
}

export { getRepositoryInfo }
