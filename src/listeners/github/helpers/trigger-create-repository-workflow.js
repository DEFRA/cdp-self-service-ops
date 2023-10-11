import { octokit } from '~/src/helpers/oktokit'
import { config } from '~/src/config'

function triggerCreateRepositoryWorkflow({
  repositoryName,
  serviceType,
  owningTeam
}) {
  return octokit.request(
    'POST /repos/{owner}/{repo}/actions/workflows/{workflow_id}/dispatches',
    {
      owner: config.get('gitHubOrg'),
      repo: 'cdp-boilerplate',
      workflow_id: 'create_repo.yml',
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
