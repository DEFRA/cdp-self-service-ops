import { config } from '~/src/config'
import { statuses } from '~/src/constants/statuses'
import { updateCreationStatus } from '~/src/api/create-microservice/helpers/save-status'
import { triggerWorkflow } from '~/src/api/helpers/workflow/trigger-workflow'

const createDashboard = async (request, service, zone) => {
  const org = config.get('gitHubOrg')
  const workflowRepo = config.get('gitHubRepoDashboards')
  const workflowName = config.get('createDashboardWorkflow')

  try {
    await triggerWorkflow(org, workflowRepo, workflowName, {
      service,
      service_zone: zone
    })

    request.logger.info(
      `Create dashboard config workflow triggered for ${service} successfully`
    )

    await updateCreationStatus(request.db, service, workflowRepo, {
      status: statuses.requested
    })
  } catch (e) {
    await updateCreationStatus(request.db, service, workflowRepo, {
      status: statuses.failure,
      result: e?.response ?? 'see cdp-self-service-ops logs'
    })
    request.logger.error(`update ${workflowRepo} ${service} failed ${e}`)
  }
}

export { createDashboard }
