import { config } from '~/src/config'
import { statuses } from '~/src/constants/statuses'
import { updateRepositoryStatus } from '~/src/api/create-repository/helpers/status/update-repository-status'
import { triggerWorkflow } from '~/src/helpers/workflow/trigger-workflow'

/**
 * @param {*} request
 * @param {string} repositoryName
 * @param {string} visibility
 * @param {string} team
 * @return {Promise<void>}
 */
async function createRepository(request, repositoryName, visibility, team) {
  const gitHubOrg = config.get('gitHubOrg')
  const workflowRepo = config.get('gitHubRepoCreateWorkflows')
  const workflowId = config.get('createRepositoryWorkflow')
  const updateStatus = updateRepositoryStatus(request.db, repositoryName)

  try {
    const result = await triggerWorkflow(gitHubOrg, workflowRepo, workflowId, {
      repositoryName,
      repositoryVisibility: visibility,
      team
    })

    request.logger.info(
      `Create repository: ${repositoryName} workflow triggered successfully`
    )

    await updateStatus({
      status: statuses.inProgress,
      createRepository: {
        status: statuses.inProgress,
        url: `https://github.com/${gitHubOrg}/${repositoryName}`,
        result
      }
    })
  } catch (error) {
    request.logger.error(`Create repository: ${repositoryName} failed`)
    request.logger.error(error)

    await updateStatus({
      status: statuses.inProgress,
      createRepository: {
        status: statuses.failure,
        result: error
      }
    })
  }
}

export { createRepository }
