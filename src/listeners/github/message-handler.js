import { pullRequestHandler } from '~/src/listeners/github/handlers/pull-request-handler'
import { config } from '~/src/config'
import { workflowRunHandlerV2 } from '~/src/listeners/github/handlers/workflow-run-handler-v2'

const githubWebhooks = new Set([
  config.get('github.repos.appDeployments'),
  config.get('github.repos.cdpTfSvcInfra'),
  config.get('github.repos.cdpAppConfig'),
  config.get('github.repos.cdpNginxUpstreams'),
  config.get('github.repos.createWorkflows'),
  config.get('github.repos.cdpSquidProxy'),
  config.get('github.repos.cdpGrafanaSvc')
])
const validActions = new Set(['workflow_run', 'pull_request'])

const shouldProcess = (message) => {
  const eventType = message.github_event
  const repo = message.repository?.name
  return validActions.has(eventType) && githubWebhooks.has(repo)
}

const handle = async (server, message) => {
  if (!shouldProcess(message)) {
    return
  }

  if (message.github_event === 'pull_request') {
    return await pullRequestHandler(server.db, message)
  }

  if (message.github_event === 'workflow_run') {
    return await workflowRunHandlerV2(server, message)
  }
}

export { handle }
