import { config } from '~/src/config/index.js'
import { createResourceFromWorkflow } from '~/src/helpers/create/workflows/create-resource-from-workflow.js'

/**
 * Creates default Squid proxy config
 * @param {import('pino').Logger} logger
 * @param {string} service
 * @returns {Promise<void>}
 */
const createSquidConfig = async (logger, service) => {
  const org = config.get('github.org')
  const repo = config.get('github.repos.cdpSquidProxy')
  const workflow = config.get('workflows.createSquidConfig')

  await createResourceFromWorkflow(logger, service, org, repo, workflow, {
    service
  })
}

export { createSquidConfig }
