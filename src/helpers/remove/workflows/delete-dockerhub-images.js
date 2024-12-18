import { config } from '~/src/config/index.js'
import { triggerWorkflow } from '~/src/helpers/github/trigger-workflow.js'

/**
 * Delete DockerHub images
 * @param {string} service
 * @param {import('pino').Logger} logger
 * @returns {Promise<void>}
 */
const deleteDockerHubImages = async (service, logger) => {
  const org = config.get('github.org')
  const repo = config.get('github.repos.cdpDockerHubImages')
  const workflow = config.get('workflows.deleteDockerHubImages')

  await triggerWorkflow(org, repo, workflow, { service }, service, logger)
}

export { deleteDockerHubImages }
