import { config } from '~/src/config/index.js'
import { fetcher } from '~/src/helpers/fetcher.js'
import Boom from '@hapi/boom'

import Joi from 'joi'
import { getContent } from '~/src/helpers/github/get-content.js'
import {
  repositoryNameValidation,
  zoneValidation
} from '~/src/api/helpers/schema/common-validations.js'

const org = config.get('github.org')
const repo = config.get('github.repos.cdpTfSvcInfra')

const schema = Joi.object({
  zone: zoneValidation,
  service_code: Joi.any(),
  mongo: Joi.boolean(),
  redis: Joi.boolean(),
  test_suite: repositoryNameValidation
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

export {
  lookupServiceInEnvironment,
  lookupTenantService,
  lookupTenantServiceFromGitHub
}
