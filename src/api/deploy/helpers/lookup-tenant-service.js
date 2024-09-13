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
    logger.error(`Error attempting to retrieve ${filePath} from GitHub`)
  }
}

export { lookupTenantService }
