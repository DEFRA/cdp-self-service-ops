import { config } from '~/src/config'
import qs from 'qs'
import { createLogger } from '~/src/helpers/logging/logger'

async function createPlaceholderArtifact({ service, githubUrl }) {
  const logger = createLogger()

  const queryString = qs.stringify(
    {
      service,
      githubUrl
    },
    { addQueryPrefix: true }
  )

  const url = `${config.get(
    'portalBackendApiUrl'
  )}/artifacts/placeholder${queryString}`

  logger.info(`calling create placeholder with ${service} ${githubUrl}`)
  return await fetch(url, {
    method: 'post'
  })
}

export { createPlaceholderArtifact }
