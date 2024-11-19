import Joi from 'joi'

import { config } from '~/src/config/index.js'
import { getContent } from '~/src/helpers/github/get-content.js'
import { createLogger } from '~/src/helpers/logging/logger.js'

const logger = createLogger()

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
    logger.error(error, `Error attempting to retrieve ${filePath} from GitHub`)
  }
}

export { lookupTenantService }
