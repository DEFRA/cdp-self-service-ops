import { config } from '~/src/config/index.js'
import { fetcher } from '~/src/helpers/fetcher.js'

async function getEntity(repositoryName, logger) {
  const url = `${config.get('portalBackendUrl')}/entities/${repositoryName}`
  const response = await fetcher(url, {
    method: 'get',
    headers: { 'Content-Type': 'application/json' }
  })
  const json = await response.json()

  if (response.ok) {
    return json
  }

  logger.error(
    `Error attempting to retrieve entity for ${repositoryName}: '${json.message}' statusCode: '${response.status}'`
  )
}

export { getEntity }
