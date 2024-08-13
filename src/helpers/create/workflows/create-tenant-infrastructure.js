import { config } from '~/src/config'
import { createResourceFromWorkflow } from '~/src/helpers/create/workflows/create-resource-from-workflow'

/**
 * Creates infrastructure for a microservice/test suite from a given template
 * @param {{ db: import('mongodb').Db, logger: import('pino').Logger}} request
 * @param {string} service
 * @param {{service: string, zone: string, mongo_enabled: boolean, redis_enabled: boolean, service_code: string, test_suite: string|undefined}} inputs
 * @returns {Promise<void>}
 */
const createTenantInfrastructure = async (request, service, inputs) => {
  const org = config.get('github.org')
  const repo = config.get('github.repos.cdpTfSvcInfra')
  const workflow = config.get('workflows.createTenantService')

  await createResourceFromWorkflow(
    request,
    service,
    org,
    repo,
    workflow,
    inputs
  )
}

export { createTenantInfrastructure }
