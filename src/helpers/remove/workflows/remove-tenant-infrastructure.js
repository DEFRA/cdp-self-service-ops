import { config } from '~/src/config/index.js'
import { triggerWorkflow } from '~/src/helpers/github/trigger-workflow.js'

/**
 * Removes infrastructure for a service
 * @param {string} service
 * @param {import("pino").Logger} logger
 * @returns {Promise<void>}
 */
const removeTenantInfrastructure = async (service, logger) => {
  const org = config.get('github.org')
  const repo = config.get('github.repos.cdpTfSvcInfra')
  const workflow = config.get('workflows.removeTenantService')

  await triggerWorkflow(org, repo, workflow, {}, service, logger)
}

export { removeTenantInfrastructure }
