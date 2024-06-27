import { octokit } from '~/src/helpers/oktokit'

import { config } from '~/src/config'

function triggerWorkflow(
  inputs,
  workflowId,
  repo = config.get('gitHubRepoCreateWorkflows'),
  org = config.get('gitHubOrg')
) {
  return octokit.request(
    'POST /repos/{org}/{repo}/actions/workflows/{workflow_id}/dispatches',
    {
      org,
      repo,
      workflow_id: workflowId,
      ref: 'main',
      inputs,
      headers: {
        'X-GitHub-Api-Version': config.get('gitHubApiVersion')
      }
    }
  )
}

export { triggerWorkflow }
