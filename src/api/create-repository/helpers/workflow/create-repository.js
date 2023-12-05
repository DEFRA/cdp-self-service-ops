import { config } from '~/src/config'
import { statuses } from '~/src/constants/statuses'
import { updateRepositoryStatus } from '~/src/api/create-repository/helpers/status/update-repository-status'
import { triggerWorkflow } from '~/src/api/helpers/workflow/trigger-workflow'

async function createRepository(request, repositoryName, payload, team) {
  const gitHubOrg = config.get('gitHubOrg')
  const updateStatus = updateRepositoryStatus(request.db, repositoryName)

  try {
    const repositoryVisibility = payload.repositoryVisibility
    const result = await triggerWorkflow(
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
