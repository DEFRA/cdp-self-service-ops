import { config } from '~/src/config/index.js'
import { fetcher } from '~/src/helpers/fetcher.js'

/**
 * @param {string} service
 * @param {string} environment
 * @param {{id: string, displayName: string}} user
 * @param {string} undeploymentId
 */
async function registerUndeployment(
  service,
  environment,
  user,
  undeploymentId
) {
  const url = `${config.get('portalBackendUrl')}/undeployments`
  await fetcher(url, {
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      service,
      environment,
      user,
      undeploymentId
    })
  })
}

export { registerUndeployment }
