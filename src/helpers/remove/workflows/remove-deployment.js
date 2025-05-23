import { config } from '~/src/config/index.js'
import { triggerWorkflow } from '~/src/helpers/github/trigger-workflow.js'
import { orderedEnvironments } from '~/src/config/environments.js'

/**
 * Removes deployment file for specified service
 * @param {string} service
 * @param {import("pino").Logger} logger
 * @returns {Promise<void>}
 */
export const removeDeployment = async (service, logger) => {
  const org = config.get('github.org')
  const repo = config.get('github.repos.appDeployments')
  const workflow = config.get('workflows.removeDeploymentFiles')

  const environments = orderedEnvironments.join(' ')

  await triggerWorkflow(
    org,
    repo,
    workflow,
    { service, environments },
    service,
    logger
  )
}
