import { triggerWorkflow } from '../../github/trigger-workflow.js'

/**
 * Triggers a given workflow and updates the status record
 * @param {import('pino').Logger} logger
 * @param {string} service  - resource being created
 * @param {string} org      - GitHub org
 * @param {string} repo     - repo the workflow is in
 * @param {string} workflow - name of the workflow file
 * @param {object} inputs   - input params to pass to workflow
 * @returns {Promise<void>}
 */
const createResourceFromWorkflow = async (
  logger,
  service,
  org,
  repo,
  workflow,
  inputs
) => {
  try {
    await triggerWorkflow(org, repo, workflow, inputs, service, logger)
  } catch (error) {
    logger.error(
      error,
      `update ${repo}/${service} failed with inputs  ${JSON.stringify(inputs)} ${error.message}`
    )
  }
}

export { createResourceFromWorkflow }
