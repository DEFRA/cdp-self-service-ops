import { config } from '../../config/index.js'
import { fetcher } from '../fetcher.js'
import Boom from '@hapi/boom'

/**
 * Get service from portal-backend
 * @param {string} service
 * @param {string} environment
 * @param {Logger} logger
 * @returns {Promise<undefined|*>}
 */
async function lookupTenantService(service, environment, logger) {
  const { response, serviceJson } = await lookupServiceInEnvironment(
    service,
    environment
  )
  if (response.ok) {
    return serviceJson
  }
  logger.error(`Service lookup failed: ${serviceJson.message}`)
  throw Boom.boomify(new Error(serviceJson.message), {
    statusCode: response.status
  })
}

/**
 * Get service from portal-backend
 * @param {string} service
 * @param {string} environment
 * @returns {Promise<undefined|*>}
 */
async function lookupServiceInEnvironment(service, environment) {
  const url = `${config.get('portalBackendUrl')}/tenant-services/${service}/${environment}`
  const response = await fetcher(url, {
    method: 'get',
    headers: { 'Content-Type': 'application/json' }
  })
  const serviceJson = await response.json()
  return { response, serviceJson }
}

export { lookupServiceInEnvironment, lookupTenantService }
