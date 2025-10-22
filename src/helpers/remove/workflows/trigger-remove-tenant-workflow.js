import { triggerWorkflow } from '../../github/trigger-workflow.js'
import { config } from '../../../config/index.js'

/**
 * @param {string} name - name of tenant service or test suite to remove
 * @param {string} type - The type of service being removed (e.g. Microservice, TestSuite)
 * @param {import("pino").Logger} logger
 * @returns {Promise<void>}
 */
async function triggerRemoveTenantWorkflow(name, type, logger) {
  const org = config.get('github.org')
  const repo = config.get('github.repos.cdpTenantConfig')
  const workflowId = config.get('workflows.removeTenantService')

  const inputs = {
    service: name,
    type
  }

  await triggerWorkflow(org, repo, workflowId, inputs, name, logger)
}

export { triggerRemoveTenantWorkflow }
