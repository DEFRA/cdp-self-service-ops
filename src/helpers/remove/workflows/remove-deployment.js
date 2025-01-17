import { config } from '~/src/config/index.js'
import { triggerWorkflow } from '~/src/helpers/github/trigger-workflow.js'

/**
 * Removes deployment file for specified service
 * @param {string} service
 * @param {import("pino").Logger} logger
 * @returns {Promise<void>}
 */
export const removeDeployment = async (service, logger) => {
  const org = config.get('github.org')
  const repo = config.get('github.repos.cdpAppDeployments')
  const workflow = config.get('workflows.removeService')

  await triggerWorkflow(org, repo, workflow, { service }, service, logger)
}
