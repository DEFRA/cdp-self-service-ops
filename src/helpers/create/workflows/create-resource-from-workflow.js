import { statuses } from '~/src/constants/statuses'
import { updateCreationStatus } from '~/src/helpers/create/init-creation-status'
import { triggerWorkflow } from '~/src/helpers/create/workflows/trigger-workflow'

/**
 * Triggers a given workflow and updates the status record
 * @param {{ db: import('mongodb').Db, logger: import('pino').Logger}} request
 * @param {string} service  - resource being created
 * @param {string} org      - GitHub org
 * @param {string} repo     - repo the workflow is in
 * @param {string} workflow - name of the workflow file
 * @param {Object} inputs   - input params to pass to workflow
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
  request.logger.info(
    `Workflow ${repo}/${workflow} triggered for ${service} with inputs ${JSON.stringify(inputs)}`
  )
  const trigger = {
    org,
    repo,
    workflow,
    inputs
  }

  try {
    await triggerWorkflow(org, repo, workflow, inputs)

    await updateCreationStatus(request.db, service, repo, {
      status: statuses.requested,
      trigger,
      result: 'ok'
    })
  } catch (e) {
    await updateCreationStatus(request.db, service, repo, {
      status: statuses.failure,
      trigger,
      result: e?.response ?? 'see cdp-self-service-ops logs'
    })
    request.logger.error(
      `update ${repo}/${service} failed with inputs  ${JSON.stringify(inputs)}: ${e}`
    )
  }
}

export { createResourceFromWorkflow }
