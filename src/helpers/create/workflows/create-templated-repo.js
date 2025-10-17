import { config } from '../../../config/index.js'
import { triggerWorkflow } from '../../github/trigger-workflow.js'

/**
 * Creates a new GitHub repository from a template
 * @param {import('pino').Logger} logger
 * @param {string} workflow       - name of the workflow in cdpCreateWorkflows to use
 * @param {string} repositoryName - name of the GitHub repo to be created
 * @param {string} team           - team that will own the repo
 * @param {string[]} githubTopics - list of topics to add to the repo
 * @param {object} extraInputs    - extra fields to pass to the job
 * @returns {Promise<void>}
 */
async function createTemplatedRepo(
  logger,
  workflow,
  repositoryName,
  team,
  githubTopics,
  extraInputs = {}
) {
  const org = config.get('github.org')
  const workflowRepo = config.get('github.repos.createWorkflows')

  const inputs = {
    ...extraInputs,
    repositoryName,
    team,
    additionalGitHubTopics: githubTopics.toString()
  }

  try {
    await triggerWorkflow(
      org,
      workflowRepo,
      workflow,
      inputs,
      repositoryName,
      logger
    )
  } catch (error) {
    logger.error(
      error,
      `update ${workflowRepo}/${repositoryName} failed with inputs  ${JSON.stringify(inputs)} ${error.message}`
    )
  }
}

export { createTemplatedRepo }
