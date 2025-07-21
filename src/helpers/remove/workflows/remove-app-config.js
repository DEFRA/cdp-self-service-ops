import { config } from '../../../config/index.js'
import { triggerWorkflow } from '../../github/trigger-workflow.js'

/**
 * Removes application config
 * @param {string} service
 * @param {import('pino').Logger} logger
 * @returns {Promise<void>}
 */
const removeAppConfig = async (service, logger) => {
  const org = config.get('github.org')
  const repo = config.get('github.repos.cdpAppConfig')
  const workflow = config.get('workflows.removeAppConfig')

  await triggerWorkflow(org, repo, workflow, { service }, service, logger)
}

export { removeAppConfig }
