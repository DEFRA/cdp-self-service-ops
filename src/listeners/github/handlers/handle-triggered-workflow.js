import { updateOverallStatus } from '~/src/api/create-microservice/helpers/save-status'
import { trimWorkflowRun } from '~/src/listeners/github/helpers/trim-workflow-run'
import {
  findByRepoName,
  updateWorkflowStatus
} from '~/src/listeners/github/status-repo'
import { normalizeStatus } from '~/src/listeners/github/helpers/normalize-status'

/**
 * Generic handler for any workflow messages that are triggered directly via workflow-dispatch.
 * The thing to be aware of here is that by convention we set the `workflow_run.name` value to
 * link to the status record.
 * @param { import('mongodb').Db } db
 * @param { import('pino').Logger } logger
 * @param {Object} message
 * @returns {Promise<void>}
 */
const handleTriggeredWorkflow = async (db, logger, message) => {
  try {
    const workflowRepo = message.repository?.name
    const headBranch = message.workflow_run?.head_branch
    const serviceRepo = message.workflow_run?.name // we repurpose the name to track name of repo its creating
    const status = findByRepoName(db, serviceRepo)

    if (status === null) {
      return
    }

    const workflowStatus = normalizeStatus(
      message.action,
      message.workflow_run?.conclusion
    )

    logger.info(
      `attempting to update ${message.repository?.name} status for ${serviceRepo} to ${workflowStatus}`
    )

    await updateWorkflowStatus(
      db,
      serviceRepo,
      workflowRepo,
      headBranch,
      workflowStatus,
      trimWorkflowRun(message.workflow_run)
    )
    await updateOverallStatus(db, serviceRepo)
  } catch (e) {
    logger.error(e)
  }
}

export { handleTriggeredWorkflow }
