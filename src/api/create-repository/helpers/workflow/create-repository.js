import { config } from '~/src/config'
import { statuses } from '~/src/constants/statuses'
import { triggerWorkflow } from '~/src/api/helpers/workflow/trigger-workflow'
import { updateSubStatus } from '~/src/helpers/db/status/update-sub-status'

async function createRepository(request, repositoryName, payload, team) {
  const gitHubOrg = config.get('gitHubOrg')

  try {
    const repositoryVisibility = payload.repositoryVisibility
    const workflowResult = await triggerWorkflow(
      {
        repositoryName,
        repositoryVisibility,
        team: team.github
      },
      config.get('createRepositoryWorkflow')
    )

    request.logger.info(
      `Create repository: ${repositoryName} workflow triggered successfully`
    )

    await updateSubStatus(
      request.db,
      repositoryName,
      'createRepository',
      statuses.inProgress,
      {
        url: `https://github.com/${gitHubOrg}/${repositoryName}`,
        result: workflowResult
      }
    )
  } catch (error) {
    request.logger.error(`Create repository: ${repositoryName} failed`)
    request.logger.error(error)

    await updateSubStatus(
      request.db,
      repositoryName,
      'createRepository',
      statuses.failure,
      {
        url: `https://github.com/${gitHubOrg}/${repositoryName}`,
        result: error
      }
    )
  }
}

export { createRepository }
