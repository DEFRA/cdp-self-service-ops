import { config } from '~/src/config/index.js'
import { fetcher } from '~/src/helpers/fetcher.js'
import Boom from '@hapi/boom'

import Joi from 'joi'
import { getContent } from '~/src/helpers/github/get-content.js'

const org = config.get('github.org')
const repo = config.get('github.repos.cdpTfSvcInfra')

const schema = Joi.object({
  zone: Joi.string().valid('public', 'protected').required(),
  service_code: Joi.any(),
  mongo: Joi.boolean(),
  redis: Joi.boolean(),
  test_suite: Joi.string()
}).unknown(true)

/**
 * Get service from the multi-file version of tenants.json
 * @param {string} service
 * @param {string} environment
 * @param {Logger} logger
 * @param {string} ref
 * @returns {Promise<undefined|*>}
 */
async function lookupTenantServiceFromGitHub(
  service,
  environment,
  logger,
  ref = 'main'
) {
  const filePath = `environments/${environment}/tenants/${service}.json`
  try {
    const data = await getContent(org, repo, filePath, ref)
    if (!data) {
      logger.warn(`Tenant environment file ${filePath} from GitHub not found`)
      return undefined
    }
    const service = JSON.parse(data)
    Joi.assert(service, schema) // Check file in correct format
    return { testSuite: service.test_suite }
  } catch (error) {
    logger.error(error, `Error attempting to retrieve ${filePath} from GitHub`)
  }
}

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

export { lookupTenantService, lookupTenantServiceFromGitHub }
