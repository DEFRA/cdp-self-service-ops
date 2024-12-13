import { config } from '~/src/config/index.js'
import { triggerWorkflow } from '~/src/helpers/github/trigger-workflow.js'

/**
 * Removes dashboards
 * @param {string} service
 * @param {import('pino').Logger} logger
 * @returns {Promise<void>}
 */
const removeDashboard = async (service, logger) => {
  const org = config.get('github.org')
  const repo = config.get('github.repos.cdpGrafanaSvc')
  const workflow = config.get('workflows.removeDashboard')

  await triggerWorkflow(org, repo, workflow, {}, service, logger)
}

export { removeDashboard }
