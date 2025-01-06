import { config } from '~/src/config/index.js'
import { triggerWorkflow } from '~/src/helpers/github/trigger-workflow.js'

/**
 * Triggers GitHub repository archive workflow
 * @param {string} service
 * @param {import('pino').Logger} logger
 * @returns {Promise<void>}
 */
const archiveGithubRepo = async (service, logger) => {
  const org = config.get('github.org')
  const repo = config.get('github.repos.createWorkflows')
  const workflow = config.get('workflows.archiveGithubRepoWorkflow')

  await triggerWorkflow(org, repo, workflow, { service }, service, logger)
}

export { archiveGithubRepo }
