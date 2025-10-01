import { config } from '../../../config/index.js'
import { triggerWorkflow } from '../../github/trigger-workflow.js'
import { orderedEnvironments } from '@defra/cdp-validation-kit'

/**
 * Removes an ECS service from an environment
 * @param {string} service
 * @param {import("pino").Logger} logger
 * @returns {Promise<void>}
 */
export const removeEcsService = async (service, logger) => {
  const org = config.get('github.org')
  const repo = config.get('github.repos.cdpTfSvcInfra')
  const workflow = config.get('workflows.removeEcsService')

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
