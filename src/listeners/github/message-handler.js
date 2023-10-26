import { pullRequestHandler } from '~/src/listeners/github/handlers/pull-request-handler'
import { workflowRunHandler } from '~/src/listeners/github/handlers/workflow-run-handler'
import { config } from '~/src/config'

const validRepos = new Set([
  config.get('githubRepoTfService'),
  config.get('githubRepoTfServiceInfra'),
  config.get('githubRepoConfig'),
  config.get('githubRepoNginx')
])
const validActions = new Set(['workflow_run', 'pull_request'])

const shouldProcess = (message) => {
  const eventType = message.github_event
  const repo = message.repository?.name
  return validActions.has(eventType) && validRepos.has(repo)
}

const handle = async (server, message) => {
  if (!shouldProcess(message)) {
    return
  }

  if (message.github_event === 'pull_request') {
    return await pullRequestHandler(server.db, message)
  }

  if (message.github_event === 'workflow_run') {
    return await workflowRunHandler(server.db, message)
  }
}

export { handle }
