import { config } from '~/src/config/index.js'
import { fetcher } from '~/src/helpers/fetcher.js'

/**
 * Removes data for service within cdp-portal-backend.
 * @param {string} serviceName
 */
async function portalBackEndDecommissionService(serviceName) {
  const url = config.get('portalBackendUrl') + `/decommission/${serviceName}`
  await fetcher(url, { method: 'delete' })
}

export { portalBackEndDecommissionService }
