import { config } from '~/src/config/index.js'
import { triggerWorkflow } from '~/src/helpers/github/trigger-workflow.js'

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

  await triggerWorkflow(org, repo, workflow, {}, service, logger)
}

export { removeAppConfig }
