import { config } from '../../../config/index.js'
import { triggerWorkflow } from '../../github/trigger-workflow.js'

/**
 * Delete DockerHub images
 * @param {string} service
 * @param {import('pino').Logger} logger
 * @returns {Promise<void>}
 */
const deleteDockerHubImages = async (service, logger) => {
  const org = config.get('github.org')
  const repo = config.get('github.repos.cdpTfSvcInfra')
  const workflow = config.get('workflows.deleteDockerHubImages')

  await triggerWorkflow(
    org,
    repo,
    workflow,
    { service_name: service },
    service,
    logger
  )
}

export { deleteDockerHubImages }
