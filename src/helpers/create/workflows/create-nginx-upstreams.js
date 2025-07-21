import { config } from '../../../config/index.js'
import { createResourceFromWorkflow } from './create-resource-from-workflow.js'

/**
 * Creates default service routing
 * @param {import('pino').Logger} logger
 * @param {string} service
 * @param {'public'|'protected'} zone
 * @returns {Promise<void>}
 */
const createNginxUpstreams = async (logger, service, zone) => {
  const org = config.get('github.org')
  const repo = config.get('github.repos.cdpNginxUpstreams')
  const workflow = config.get('workflows.createNginxUpstreams')

  await createResourceFromWorkflow(logger, service, org, repo, workflow, {
    service,
    zone
  })
}

export { createNginxUpstreams }
