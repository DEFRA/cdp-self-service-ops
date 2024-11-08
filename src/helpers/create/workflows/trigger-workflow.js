import { octokit } from '~/src/helpers/oktokit'

import { config } from '~/src/config'

/**
 * Trigger a given GitHub workflow
 * @param {string} org        - GitHub org the workflow is in
 * @param {string} repo       - name of the GitHub repo the workflow is in
 * @param {string} workflowId - name of the workflow file to trigger
 * @param {object} inputs     - input params to pass to the workflow
 */
function triggerWorkflow(org, repo, workflowId, inputs) {
  return octokit.request(
    'POST /repos/{org}/{repo}/actions/workflows/{workflow_id}/dispatches',
    {
      org,
      repo,
      workflow_id: workflowId,
      ref: 'main',
      inputs,
      headers: {
        'X-GitHub-Api-Version': config.get('github.apiVersion')
      }
    }
  )
}

export { triggerWorkflow }
