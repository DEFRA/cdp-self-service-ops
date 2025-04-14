import { config } from '~/src/config/index.js'
import { createResourceFromWorkflow } from '~/src/helpers/create/workflows/create-resource-from-workflow.js'

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
  const repo = config.get('github.repos.createWorkflows')

  await createResourceFromWorkflow(
    logger,
    repositoryName,
    org,
    repo,
    workflow,
    {
      ...extraInputs,
      repositoryName,
      team,
      additionalGitHubTopics: githubTopics.toString()
    }
  )
}

export { createTemplatedRepo }
