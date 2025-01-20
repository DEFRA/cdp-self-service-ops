import { config } from '~/src/config/index.js'
import { triggerWorkflow } from '~/src/helpers/github/trigger-workflow.js'

/**
 * Removes a ECS service task in an environment
 * @param {string} service
 * @param {string} environment
 * @param {import("pino").Logger} logger
 * @returns {Promise<void>}
 */
export const removeEcsTask = async (service, environment, logger) => {
  const org = config.get('github.org')
  const repo = config.get('github.repos.cdpTfSvcInfra')
  const workflow = config.get('workflows.removeEcsTask')

  await triggerWorkflow(
    org,
    repo,
    workflow,
    { service, environment },
    service,
    logger
  )
}
