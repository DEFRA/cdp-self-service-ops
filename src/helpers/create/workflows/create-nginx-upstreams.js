import { config } from '~/src/config/index.js'
import { createResourceFromWorkflow } from '~/src/helpers/create/workflows/create-resource-from-workflow.js'

/**
 * Creates default service routing
 * @param {{ db: import('mongodb').Db, logger: import('pino').Logger}} request
 * @param {string} service
 * @param {'public'|'protected'} zone
 * @returns {Promise<void>}
 */
const createNginxUpstreams = async (request, service, zone) => {
  const org = config.get('github.org')
  const repo = config.get('github.repos.cdpNginxUpstreams')
  const workflow = config.get('workflows.createNginxUpstreams')

  await createResourceFromWorkflow(request, service, org, repo, workflow, {
    service,
    zone
  })
}

export { createNginxUpstreams }
