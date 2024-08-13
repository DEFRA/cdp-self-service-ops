import { bulkUpdateTfSvcInfra } from '~/src/listeners/github/helpers/bulk-update-tf-svc-infra'
import { normalizeStatus } from '~/src/listeners/github/helpers/normalize-status'
import { trimWorkflowRun } from '~/src/listeners/github/helpers/trim-workflow-run'
import { handleTriggeredWorkflow } from '~/src/listeners/github/handlers/handle-triggered-workflow'

/**
 * Specific handler for tf-svc-infra create-service calls. On completion, it triggers bulkUpdateTfSvcInfra
 * This creates the placeholder artifact, and checks if any other tenants were completed in this run.
 * On other statuses it just hands off to handleTriggeredWorkflow
 * @param { import('mongodb').Db } db
 * @param { import('pino').Logger } logger
 * @param {Object} message
 * @returns {Promise<void>}
 */
const handleTfSvcInfraWorkflow = async (db, logger, message) => {
  try {
    if (message.action === 'completed') {
      logger.info(`Handling tf-svc-infra workflow completed message from main`)

      // Any time cdp-tf-svc-infra completes on main, regardless of which commit triggered it
      // assume all services in management tenant-services.json are successfully created.
      // (we use management as it is responsible for the ECR)
      const status = normalizeStatus(
        message.action,
        message.workflow_run?.conclusion
      )
      await bulkUpdateTfSvcInfra(
        db,
        trimWorkflowRun(message.workflow_run),
        status
      )
    } else {
      await handleTriggeredWorkflow(db, logger, message)
    }
  } catch (e) {
    logger.error(e)
  }
}

export { handleTfSvcInfraWorkflow }
