import { config } from '~/src/config/index.js'
import { createResourceFromWorkflow } from '~/src/helpers/create/workflows/create-resource-from-workflow.js'

/**
 * Creates default Squid proxy config
 * @param {{ db: import('mongodb').Db, logger: import('pino').Logger}} request
 * @param {string} service
 * @returns {Promise<void>}
 */
const createSquidConfig = async (request, service) => {
  const org = config.get('github.org')
  const repo = config.get('github.repos.cdpSquidProxy')
  const workflow = config.get('workflows.createSquidConfig')

  await createResourceFromWorkflow(request, service, org, repo, workflow, {
    service
  })
}

export { createSquidConfig }
