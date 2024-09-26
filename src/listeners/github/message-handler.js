import { config } from '~/src/config'
import { workflowRunCreationHandlerV2 } from '~/src/listeners/github/handlers/workflow-run-creation-handler-v2'
import { workflowRunNotificationHandler } from '~/src/listeners/github/handlers/workflow-run-notification-handler'

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
  try {
    if (shouldProcess(message, 'workflow_run')) {
      await workflowRunCreationHandlerV2(server, message)
    }
    if (shouldProcess(message, 'workflow_run')) {
      await workflowRunNotificationHandler(server, message)
    }
  } catch (error) {
    server.logger.error(error, 'Exception in github events processing handler')
  }
}

export { handle }
