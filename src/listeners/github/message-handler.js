import { config } from '~/src/config/index.js'
import { workflowRunCreationHandlerV2 } from '~/src/listeners/github/handlers/workflow-run-creation-handler-v2.js'
import { workflowRunNotificationHandler } from '~/src/listeners/github/handlers/workflow-run-notification-handler.js'

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
    try {
      await workflowRunCreationHandlerV2(server, message)
    } catch (error) {
      server.logger.error(
        error,
        'Exception in github events processing creation handler'
      )
    }
  }

  if (shouldProcess(message, 'workflow_run')) {
    try {
      await workflowRunNotificationHandler(server, message)
    } catch (error) {
      server.logger.error(
        error,
        'Exception in github events processing notification handler'
      )
    }
  }
}

export { handle }
