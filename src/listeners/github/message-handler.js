import { config } from '~/src/config'
import { workflowRunHandlerV2 } from '~/src/listeners/github/handlers/workflow-run-handler-v2'
import { workflowRunAlertHandler } from '~/src/listeners/github/handlers/workflow-run-alert-handler'

const githubWebhooks = new Set([
  config.get('github.repos.appDeployments'),
  config.get('github.repos.cdpTfSvcInfra'),
  config.get('github.repos.cdpAppConfig'),
  config.get('github.repos.cdpNginxUpstreams'),
  config.get('github.repos.createWorkflows'),
  config.get('github.repos.cdpSquidProxy'),
  config.get('github.repos.cdpGrafanaSvc')
])

const shouldProcess = (message, eventType) => {
  const repo = message.repository?.name
  return message.github_event === eventType && githubWebhooks.has(repo)
}

const handle = async (server, message) => {
  if (shouldProcess(message, 'workflow_run')) {
    return await workflowRunHandlerV2(server, message)
  }
  if (shouldProcess(message, 'workflow_run')) {
    return await workflowRunAlertHandler(server, message)
  }
}

export { handle }
