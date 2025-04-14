import { statuses } from '~/src/constants/statuses.js'
import { triggerWorkflow } from '~/src/helpers/github/trigger-workflow.js'
import { updateLegacyStatus } from '~/src/helpers/portal-backend/legacy-status/update-legacy-status.js'

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
  const trigger = {
    org,
    repo,
    workflow,
    inputs
  }

  try {
    await triggerWorkflow(org, repo, workflow, inputs, service, logger)

    await updateLegacyStatus(service, repo, {
      status: statuses.requested,
      trigger,
      result: 'ok'
    })
  } catch (error) {
    await updateLegacyStatus(service, repo, {
      status: statuses.failure,
      trigger,
      result: error?.response ?? 'see cdp-self-service-ops logs'
    })
    logger.error(
      error,
      `update ${repo}/${service} failed with inputs  ${JSON.stringify(inputs)} ${error.message}`
    )
  }
}

export { createResourceFromWorkflow }
