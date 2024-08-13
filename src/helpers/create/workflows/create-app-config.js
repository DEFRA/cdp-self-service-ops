import { config } from '~/src/config'
import { createResourceFromWorkflow } from '~/src/helpers/create/workflows/create-resource-from-workflow'

/**
 * Creates placeholder application config
 *
 * @param {{ db: import('mongodb').Db, logger: import('pino').Logger}} request
 * @param {string} service
 * @returns {Promise<void>}
 */
const createAppConfig = async (request, service) => {
  const org = config.get('github.org')
  const repo = config.get('github.repos.cdpAppConfig')
  const workflow = config.get('workflows.createAppConfig')

  await createResourceFromWorkflow(request, service, org, repo, workflow, {
    service
  })
}

export { createAppConfig }
