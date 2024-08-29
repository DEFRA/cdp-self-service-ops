import { getContent } from '~/src/helpers/github/get-content'
import { config } from '~/src/config'
import { createLogger } from '~/src/helpers/logging/logger'
import Joi from 'joi'

const logger = createLogger()

const org = config.get('github.org')
const repo = config.get('github.repos.cdpTfSvcInfra')

const schema = Joi.object({
  zone: Joi.string().valid('public', 'protected').required(),
  service_code: Joi.string().min(3).required(),
  mongo: Joi.boolean(),
  redis: Joi.boolean(),
  testSuite: Joi.string()
}).unknown(true)

/**
 * Get service from the multi-file version of tenants.json
 * @param {string} service
 * @param {string} environment
 * @param {string} ref
 * @returns {Promise<undefined|*>}
 */
async function lookupTenantService(service, environment, ref = 'main') {
  const filePath = `environments/${environment}/tenants/${service}.json`
  try {
    const data = await getContent(org, repo, filePath, ref)
    const service = JSON.parse(data)
    Joi.assert(service, schema) // Check file in correct format
    return service
  } catch (error) {
    logger.error(
      `Error attempting to retrieve ${filePath} from GitHub - Falling back to tenant_services.json, ${error}`
    )
    return await lookupLegacyTenantService(service, environment, org, repo, ref)
  }
}

/**
 * Get service from the legacy single-file version of tenants.json
 * @param {string} service
 * @param {string} environment
 * @param {string} owner
 * @param {string} repo
 * @param {string} ref
 * @returns {Promise<undefined|*>}
 */
async function lookupLegacyTenantService(
  service,
  environment,
  owner,
  repo,
  ref
) {
  const filePath = `environments/${environment}/resources/tenant_services.json`
  logger.info(`Getting legacy tenant file ${filePath}`)
  try {
    const data = await getContent(owner, repo, filePath, ref)
    const services = JSON.parse(data)
    return services[0][service]
  } catch (error) {
    logger.error(error, `Error attempting to retrieve ${filePath} from GitHub`)
    return undefined
  }
}

export { lookupTenantService }
