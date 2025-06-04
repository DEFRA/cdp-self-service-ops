import { config } from '~/src/config/index.js'
import { triggerWorkflow } from '~/src/helpers/github/trigger-workflow.js'

async function shutterServiceWorkflow(logger, service, inputs) {
  const org = config.get('github.org')
  const repo = config.get('github.repos.cdpWaf')
  const workflow = config.get('workflows.shutterWorkflow')

  await triggerWorkflow(org, repo, workflow, inputs, service, logger)
}

export { shutterServiceWorkflow }
