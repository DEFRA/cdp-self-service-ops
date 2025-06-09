import { config } from '~/src/config/index.js'
import { triggerWorkflow } from '~/src/helpers/github/trigger-workflow.js'
import { registerShuttering } from '~/src/api/shutter/helpers/register-shuttering.js'

const buildWorkFlowInputs = (inputs) => ({
  service: inputs.serviceName,
  environment: inputs.environment,
  waf: inputs.waf,
  url: inputs.url
})

async function shutterServiceWorkflow(logger, inputs, user) {
  const org = config.get('github.org')
  const repo = config.get('github.repos.cdpWaf')
  const workflow = config.get('workflows.addShutterWorkflow')

  await triggerWorkflow(
    org,
    repo,
    workflow,
    buildWorkFlowInputs(inputs),
    inputs.url,
    logger
  )

  await registerShuttering({ ...inputs, shuttered: true, actionedBy: user })
}

async function unshutterServiceWorkflow(logger, inputs, user) {
  const org = config.get('github.org')
  const repo = config.get('github.repos.cdpWaf')
  const workflow = config.get('workflows.removeShutterWorkflow')

  await triggerWorkflow(
    org,
    repo,
    workflow,
    buildWorkFlowInputs(inputs),
    inputs.url,
    logger
  )

  await registerShuttering({ ...inputs, shuttered: false, actionedBy: user })
}

export { shutterServiceWorkflow, unshutterServiceWorkflow }
