import { config } from '~/src/config'
import { createResourceFromWorkflow } from '~/src/helpers/workflow/create-resource-from-workflow'

/**
 *
 * @param {{ db: import('mongodb').Db, logger: import('pino').Logger}} request
 * @param {string} workflow          - name of the workflow in cdpCreateWorkflows to use
 * @param {string} repositoryName    - name of the GitHub repo to be created
 * @param {{github: string}} team    - team that will own the repo
 * @param {string[]} githubTopics    - list of topics to add to the repo
 * @param {Object} extraInputs       - extra fields to pass to the job
 * @returns {Promise<void>}
 */
async function createTemplatedRepo(
  request,
  workflow,
  repositoryName,
  team,
  githubTopics,
  extraInputs = {}
) {
  const gitHubOrg = config.get('github.org')
  const repo = config.get('github.repos.createWorkflows')

  await createResourceFromWorkflow(
    request,
    repositoryName,
    gitHubOrg,
    repo,
    workflow,
    {
      ...extraInputs,
      repositoryName,
      team: team.github,
      additionalGitHubTopics: githubTopics.toString()
    }
  )
}

export { createTemplatedRepo }
