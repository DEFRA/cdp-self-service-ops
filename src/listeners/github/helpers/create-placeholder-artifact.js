import qs from 'qs'

import { config } from '~/src/config/index.js'
import { createLogger } from '~/src/helpers/logging/logger.js'
import { fetcher } from '~/src/helpers/fetcher.js'

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
