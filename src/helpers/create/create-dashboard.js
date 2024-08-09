import { config } from '~/src/config'
import { createResourceFromWorkflow } from '~/src/helpers/workflow/create-resource-from-workflow'

const createDashboard = async (request, service, zone) => {
  const org = config.get('github.org')
  const repo = config.get('github.repos.cdpGrafanaSvc')
  const workflow = config.get('workflows.createDashboard')

  await createResourceFromWorkflow(request, service, org, repo, workflow, {
    service,
    service_zone: zone
  })
}

export { createDashboard }
