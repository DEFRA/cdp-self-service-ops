import { config } from '../../../config/index.js'
import { triggerWorkflow } from '../../github/trigger-workflow.js'

/**
 * Removes service routing
 * @param {string} service
 * @param {"public"|"protected"} zone
 * @param {import("pino").Logger} logger
 * @returns {Promise<void>}
 */
const removeNginxUpstreams = async (service, zone, logger) => {
  const org = config.get('github.org')
  const repo = config.get('github.repos.cdpNginxUpstreams')
  const workflow = config.get('workflows.removeNginxUpstreams')

  await triggerWorkflow(org, repo, workflow, { service, zone }, service, logger)
}

export { removeNginxUpstreams }
