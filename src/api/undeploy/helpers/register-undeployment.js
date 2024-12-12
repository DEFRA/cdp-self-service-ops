import { config } from '~/src/config/index.js'
import { fetcher } from '~/src/helpers/fetcher.js'

/**
 * @param {string} imageName
 * @param {string} environment
 * @param {{id: string, displayName: string}} user
 * @param {string} undeploymentId
 */
async function registerUndeployment(
  imageName,
  environment,
  user,
  undeploymentId
) {
  const url = `${config.get('portalBackendUrl')}/undeployments`
  await fetcher(url, {
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      service: imageName,
      environment,
      user,
      undeploymentId
    })
  })
}

export { registerUndeployment }
