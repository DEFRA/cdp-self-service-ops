import { config } from '../../../config/index.js'
import { createResourceFromWorkflow } from './create-resource-from-workflow.js'

/**
 * Creates infrastructure for a microservice/test suite from a given template
 * @param {import('pino').Logger} logger
 * @param {string} service
 * @param {{service: string, zone: string, mongo_enabled: boolean, redis_enabled: boolean, service_code: string, test_suite: string|undefined}} inputs
 * @returns {Promise<void>}
 */
const createTenantInfrastructure = async (logger, service, inputs) => {
  const org = config.get('github.org')
  const repo = config.get('github.repos.cdpTfSvcInfra')
  const workflow = config.get('workflows.createTenantService')

  await createResourceFromWorkflow(logger, service, org, repo, workflow, inputs)
}

export { createTenantInfrastructure }
