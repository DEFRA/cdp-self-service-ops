import { config } from '~/src/config'
import qs from 'qs'
import { createLogger } from '~/src/helpers/logging/logger'

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
    'portalBackendApiUrl'
  )}/artifacts/placeholder${queryString}`

  logger.info(
    `calling create ${runMode} placeholder with ${service} ${gitHubUrl}`
  )
  return await fetch(url, {
    method: 'post'
  })
}

export { createPlaceholderArtifact }
