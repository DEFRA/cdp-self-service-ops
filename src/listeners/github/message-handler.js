import { pullRequestHandler } from '~/src/listeners/github/handlers/pull-request-handler'
import { config } from '~/src/config'
import { workflowRunHandlerV2 } from '~/src/listeners/github/handlers/workflow-run-handler-v2'

const githubWebhooks = new Set([
  config.get('gitHubRepoAppDeployments'),
  config.get('gitHubRepoTfServiceInfra'),
  config.get('gitHubRepoConfig'),
  config.get('gitHubRepoNginx'),
  config.get('gitHubRepoCreateWorkflows'),
  config.get('gitHubRepoSquid'),
  config.get('gitHubRepoDashboards')
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
