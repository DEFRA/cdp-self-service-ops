import { octokit } from '~/src/helpers/oktokit/oktokit.js'

import { config } from '~/src/config/index.js'

/**
 * Trigger a given GitHub workflow
 * @param {string} org                      - GitHub org the workflow is in
 * @param {string} repo                     - name of the GitHub repo the workflow is in
 * @param {string} workflowId               - name of the workflow file to trigger
 * @param {object} inputs                   - input params to pass to the workflow
 * @param {string} service                  - service that workflow has been triggered for
 * @param {import('pino').Logger} logger    - logger to be used
 */
function triggerWorkflow(org, repo, workflowId, inputs, service, logger) {
  logger.info(
    `Workflow ${repo}/${workflowId} triggered for ${service} with inputs ${JSON.stringify(inputs)}`
  )
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
