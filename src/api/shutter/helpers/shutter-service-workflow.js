import { config } from '../../../config/index.js'
import { triggerWorkflow } from '../../../helpers/github/trigger-workflow.js'
import { registerShuttering } from './register-shuttering.js'

const buildWorkFlowInputs = (inputs) => ({
  service_name: inputs.serviceName,
  environment: inputs.environment,
  url: inputs.url,
  urlType: inputs.urlType
})

async function shutterServiceWorkflow(inputs, user, logger) {
  const org = config.get('github.org')
  const repo = config.get('github.repos.cdpTenantConfig')
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

async function unshutterServiceWorkflow(inputs, user, logger) {
  const org = config.get('github.org')
  const repo = config.get('github.repos.cdpTenantConfig')
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
