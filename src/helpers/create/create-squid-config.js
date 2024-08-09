import { config } from '~/src/config'
import { createResourceFromWorkflow } from '~/src/helpers/workflow/create-resource-from-workflow'

const createSquidConfig = async (request, service) => {
  const org = config.get('github.org')
  const repo = config.get('github.repos.cdpSquidProxy')
  const workflow = config.get('workflows.createSquidConfig')

  await createResourceFromWorkflow(request, service, org, repo, workflow, {
    service
  })
}

export { createSquidConfig }
