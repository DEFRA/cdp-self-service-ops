import { config } from '~/src/config/index.js'
import { createResourceFromWorkflow } from '~/src/helpers/create/workflows/create-resource-from-workflow.js'

/**
 * Create default dashboards
 * @param {{ db: import('mongodb').Db, logger: import('pino').Logger}} request
 * @param {string} service
 * @param {'public'|'protected'} zone
 * @returns {Promise<void>}
 */
const createDashboard = async (request, service, zone) => {
  const org = config.get('github.org')
  const repo = config.get('github.repos.cdpGrafanaSvc')
  const workflow = config.get('workflows.createDashboard')

  await createResourceFromWorkflow(request, service, org, repo, workflow, {
    service,
    service_zone: zone
  })
}

export { createDashboard }
