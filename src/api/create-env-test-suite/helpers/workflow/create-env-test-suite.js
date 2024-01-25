import { config } from '~/src/config'
import { statuses } from '~/src/constants/statuses'
import { triggerWorkflow } from '~/src/api/helpers/workflow/trigger-workflow'
import { updateTestSuiteStatus } from '~/src/api/create-test-suite/helpers/status/update-test-suite-status'

async function createEnvTestSuite(request, repositoryName, payload, team) {
  const gitHubOrg = config.get('gitHubOrg')
  const updateStatus = updateTestSuiteStatus(request.db, repositoryName)

  try {
    const result = await triggerWorkflow(
      {
        repositoryName,
        team: team.github
      },
      config.get('createEnvTestSuiteWorkflow')
    )

    request.logger.info(
      `Create env test suite: ${repositoryName} workflow triggered successfully`
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
    request.logger.error(
      `Create env test suite: ${repositoryName} failed: ${error}`
    )

    await updateStatus({
      status: statuses.inProgress,
      createRepository: {
        status: statuses.failure,
        result: error
      }
    })
  }
}

export { createEnvTestSuite }
