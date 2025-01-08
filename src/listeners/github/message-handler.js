import { config } from '~/src/config/index.js'
import { workflowRunCreationHandlerV2 } from '~/src/listeners/github/handlers/workflow-run-creation-handler-v2.js'

const gitHubRepoConfig = config.get('github.repos')

const githubWebhooks = new Set([
  gitHubRepoConfig.appDeployments,
  gitHubRepoConfig.cdpTfSvcInfra,
  gitHubRepoConfig.cdpAppConfig,
  gitHubRepoConfig.cdpNginxUpstreams,
  gitHubRepoConfig.createWorkflows,
  gitHubRepoConfig.cdpSquidProxy,
  gitHubRepoConfig.cdpGrafanaSvc
])

const shouldProcess = (message) => {
  return (
    message.github_event === 'workflow_run' &&
    message?.repository?.name &&
    githubWebhooks.has(message.repository.name)
  )
}

const handle = async (server, message) => {
  if (shouldProcess(message)) {
    try {
      await workflowRunCreationHandlerV2(server, message)
    } catch (error) {
      server.logger.error(
        error,
        'Exception in github events processing creation handler'
      )
    }
  }
}

export { handle }
