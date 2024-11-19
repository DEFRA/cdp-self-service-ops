import { config } from '~/src/config/index.js'
import { createResourceFromWorkflow } from '~/src/helpers/create/workflows/create-resource-from-workflow.js'

/**
 * Creates placeholder application config
 *
 * @param {{ db: import('mongodb').Db, logger: import('pino').Logger}} request
 * @param {string} service
 * @param {{string}} team
 * @returns {Promise<void>}
 */
const createAppConfig = async (request, service, team) => {
  const org = config.get('github.org')
  const repo = config.get('github.repos.cdpAppConfig')
  const workflow = config.get('workflows.createAppConfig')

  await createResourceFromWorkflow(request, service, org, repo, workflow, {
    service,
    team
  })
}

export { createAppConfig }
