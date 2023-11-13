import { octokit } from '~/src/helpers/oktokit'
import { config } from '~/src/config'

function triggerCreateRepositoryWorkflow(
  repositoryName,
  serviceType,
  owningTeam
) {
  return octokit.request(
    'POST /repos/{owner}/{repo}/actions/workflows/{workflow_id}/dispatches',
    {
      owner: config.get('gitHubOrg'),
      repo: config.get('githubRepoCreateWorkflow'),
      workflow_id: config.get('createServiceWorkflow'),
      ref: 'main',
      inputs: {
        repositoryName,
        serviceType,
        owningTeam
      },
      headers: {
        'X-GitHub-Api-Version': config.get('gitHubApiVersion')
      }
    }
  )
}

export { triggerCreateRepositoryWorkflow }
