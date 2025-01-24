import { config } from '~/src/config/index.js'
import { triggerWorkflow } from '~/src/helpers/github/trigger-workflow.js'

/**
 * Removes an ECS service from an environment
 * @param {string} service
 * @param {string} environments
 * @param {string} zone
 * @param {import("pino").Logger} logger
 * @returns {Promise<void>}
 */
export const removeEcsService = async (service, environments, zone, logger) => {
  const org = config.get('github.org')
  const repo = config.get('github.repos.cdpTfSvcInfra')
  const workflow = config.get('workflows.removeEcsService')

  await triggerWorkflow(
    org,
    repo,
    workflow,
    { service, environments, zone },
    service,
    logger
  )
}
