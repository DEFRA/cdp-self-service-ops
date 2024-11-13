import { config } from '~/src/config'
import qs from 'qs'
import { createLogger } from '~/src/helpers/logging/logger'
import { fetcher } from '~/src/helpers/fetcher'

async function createPlaceholderArtifact({ service, gitHubUrl, runMode }) {
  const logger = createLogger()

  const queryString = qs.stringify(
    {
      service,
      gitHubUrl,
      runMode
    },
    { addQueryPrefix: true }
  )

  const url = `${config.get(
    'portalBackendUrl'
  )}/artifacts/placeholder${queryString}`

  logger.info(
    `Calling create ${runMode} placeholder with ${service} ${gitHubUrl}`
  )
  return await fetcher(url, {
    method: 'post'
  })
}

export { createPlaceholderArtifact }
