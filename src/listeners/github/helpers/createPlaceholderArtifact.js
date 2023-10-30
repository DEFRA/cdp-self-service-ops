import { config } from '~/src/config'
import qs from 'qs'

async function createPlaceholderArtifact({ service, githubUrl }) {
  const queryString = qs.stringify(
    {
      ...(service && { githubUrl })
    },
    { addQueryPrefix: true }
  )

  const url = `${config.get(
    'portalBackendApiUrl'
  )}/artifacts/placeholder${queryString}`
  return await fetch(url, {
    method: 'post'
  })
}

export { createPlaceholderArtifact }
