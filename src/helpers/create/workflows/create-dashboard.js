import { config } from '~/src/config/index.js'
import { createResourceFromWorkflow } from '~/src/helpers/create/workflows/create-resource-from-workflow.js'

/**
 * Create default dashboards
 * @param {import('pino').Logger} logger
 * @param {string} service
 * @param {'public'|'protected'} zone
 * @returns {Promise<void>}
 */
const createDashboard = async (logger, service, zone) => {
  const org = config.get('github.org')
  const repo = config.get('github.repos.cdpGrafanaSvc')
  const workflow = config.get('workflows.createDashboard')

  await createResourceFromWorkflow(logger, service, org, repo, workflow, {
    service,
    service_zone: zone
  })
}

export { createDashboard }
