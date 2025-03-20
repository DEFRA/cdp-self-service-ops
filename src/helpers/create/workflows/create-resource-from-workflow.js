import { statuses } from '~/src/constants/statuses.js'
import { updateCreationStatus } from '~/src/helpers/create/init-creation-status.js'
import { triggerWorkflow } from '~/src/helpers/github/trigger-workflow.js'

/**
 * Triggers a given workflow and updates the status record
 * @param {{ db: import('mongodb').Db, logger: import('pino').Logger}} request
 * @param {string} service  - resource being created
 * @param {string} org      - GitHub org
 * @param {string} repo     - repo the workflow is in
 * @param {string} workflow - name of the workflow file
 * @param {object} inputs   - input params to pass to workflow
 * @returns {Promise<void>}
 */
const createResourceFromWorkflow = async (
  request,
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
    await triggerWorkflow(org, repo, workflow, inputs, service, request.logger)

    await updateCreationStatus(request.db, service, repo, {
      status: statuses.requested,
      trigger,
      result: 'ok'
    })
  } catch (error) {
    await updateCreationStatus(request.db, service, repo, {
      status: statuses.failure,
      trigger,
      result: error?.response ?? 'see cdp-self-service-ops logs'
    })
    request.logger.error(
      error,
      `update ${repo}/${service} failed with inputs  ${JSON.stringify(inputs)} ${error.message}`
    )
  }
}

export { createResourceFromWorkflow }
