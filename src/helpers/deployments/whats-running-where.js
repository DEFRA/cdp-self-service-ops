import Boom from '@hapi/boom'

import { config } from '~/src/config/index.js'
import { fetcher } from '~/src/helpers/fetcher.js'

const portalBackendUrl = config.get('portalBackendUrl')

/**
 * Finds running/deployment details for service within cdp-portal-backend.
 * @param {string} serviceName
 */
export async function whatsRunningWhere(serviceName) {
  const url = `${portalBackendUrl}/whats-running-where/${serviceName}`
  const response = await fetcher(url, { method: 'get' })
  if (response.ok) {
    return await response.json()
  }
  throw Boom.notFound(`Deployments of ${serviceName} could not be found`)
}
