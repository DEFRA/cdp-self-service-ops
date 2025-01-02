import { config } from '~/src/config/index.js'
import { fetcher } from '~/src/helpers/fetcher.js'
import Boom from '@hapi/boom'

/**
 * Get service from portal-backend
 * @param {string} service
 * @param {string} environment
 * @param {Logger} logger
 * @returns {Promise<undefined|*>}
 */
async function lookupTenantService(service, environment, logger) {
  const url = `${config.get('portalBackendUrl')}/tenant-services/${service}/${environment}`
  const response = await fetcher(url, {
    method: 'get',
    headers: { 'Content-Type': 'application/json' }
  })
  const json = await response.json()

  if (response.ok) {
    return json
  }
  logger.error(`Service lookup failed: ${json.message}`)
  throw Boom.boomify(new Error(json.message), { statusCode: response.status })
}

export { lookupTenantService }
