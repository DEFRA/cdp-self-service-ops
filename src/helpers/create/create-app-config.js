import { config } from '~/src/config'
import { createResourceFromWorkflow } from '~/src/helpers/workflow/create-resource-from-workflow'

const createAppConfig = async (request, service) => {
  const org = config.get('github.org')
  const repo = config.get('github.repos.cdpAppConfig')
  const workflow = config.get('workflows.createAppConfig')

  await createResourceFromWorkflow(request, service, org, repo, workflow, {
    service
  })
}

export { createAppConfig }
