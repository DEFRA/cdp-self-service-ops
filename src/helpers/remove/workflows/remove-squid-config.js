import { config } from '~/src/config/index.js'
import { triggerWorkflow } from '~/src/helpers/github/trigger-workflow.js'

/**
 * Removes Squid proxy config
 * @param {string} service
 * @param {import("pino").Logger} logger
 * @returns {Promise<void>}
 */
const removeSquidConfig = async (service, logger) => {
  const org = config.get('github.org')
  const repo = config.get('github.repos.cdpSquidProxy')
  const workflow = config.get('workflows.removeSquidConfig')

  await triggerWorkflow(org, repo, workflow, {}, service, logger)
}

export { removeSquidConfig }
