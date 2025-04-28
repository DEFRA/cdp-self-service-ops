import { config } from '~/src/config/index.js'
import { fetcher } from '~/src/helpers/fetcher.js'
import qs from 'qs'

/**
 * Removes data for service within cdp-portal-backend.
 * @param {string} serviceName
 * @param {{id: string, displayName: string}} user
 */
async function portalBackEndDecommissionService(serviceName, user) {
  const queryString = user ? qs.stringify(user, { addQueryPrefix: true }) : ''

  const url =
    config.get('portalBackendUrl') +
    `/decommission/${serviceName}${queryString}`

  await fetcher(url, { method: 'delete' })
}

export { portalBackEndDecommissionService }
