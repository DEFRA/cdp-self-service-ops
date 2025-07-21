import Boom from '@hapi/boom'

import { config } from '../../config/index.js'
import { fetcher } from '../fetcher.js'

const portalBackendUrl = config.get('portalBackendUrl')

/**
 * Finds running/deployment details for service within cdp-portal-backend.
 * @param {string} serviceName
 */
export async function fetchRunningServices(serviceName) {
  const url = `${portalBackendUrl}/running-services/${serviceName}`
  const response = await fetcher(url, { method: 'get' })
  if (response.ok) {
    return await response.json()
  }
  throw Boom.notFound(`Deployments of ${serviceName} could not be found`)
}
