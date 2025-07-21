import { config } from '../../../config/index.js'
import { createResourceFromWorkflow } from './create-resource-from-workflow.js'

/**
 * Creates placeholder application config
 * @param {import('pino').Logger} logger
 * @param {string} service
 * @param {{string}} team
 * @returns {Promise<void>}
 */
const createAppConfig = async (logger, service, team) => {
  const org = config.get('github.org')
  const repo = config.get('github.repos.cdpAppConfig')
  const workflow = config.get('workflows.createAppConfig')

  await createResourceFromWorkflow(logger, service, org, repo, workflow, {
    service,
    team
  })
}

export { createAppConfig }
