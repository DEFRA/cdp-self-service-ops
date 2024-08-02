import { config } from '~/src/config'
import { statuses } from '~/src/constants/statuses'
import { triggerWorkflow } from '~/src/helpers/workflow/trigger-workflow'
import { updateTestSuiteStatus } from '~/src/api/create-test-suite/helpers/status/update-test-suite-status'

/**
 *
 * @param {} request
 * @param {string} template
 * @param {string} repositoryName
 * @param {{id: string, github: string}} team
 * @param {string} testType
 * @returns {Promise<void>}
 */
async function createTestSuiteFromTemplate(
  request,
  template,
  repositoryName,
  team,
  testType
) {
  const gitHubOrg = config.get('gitHubOrg')
  const createWorkflowRepository = config.get('gitHubRepoCreateWorkflows')
  const updateStatus = updateTestSuiteStatus(request.db, repositoryName)
  const githubTopics = ['cdp', 'test', 'test-suite']
  githubTopics.push(testType)

  try {
    const result = await triggerWorkflow(
      gitHubOrg,
      createWorkflowRepository,
      template,
      {
        repositoryName,
        team: team.github,
        additionalGitHubTopics: githubTopics.toString()
      }
    )

    request.logger.info(
      `Create env test suite: ${repositoryName} workflow triggered successfully`
    )

    await updateStatus({
      createRepository: {
        status: statuses.inProgress,
        url: `https://github.com/${gitHubOrg}/${repositoryName}`,
        result
      }
    })
  } catch (error) {
    request.logger.error(
      `Create env test suite: ${repositoryName} failed: ${error}`
    )

    await updateStatus({
      createRepository: {
        status: statuses.failure,
        result: error
      }
    })
  }
}

export { createTestSuiteFromTemplate }
