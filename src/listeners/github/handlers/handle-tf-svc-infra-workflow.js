import { config } from '~/src/config/index.js'
import { bulkUpdateTfSvcInfra } from '~/src/listeners/github/helpers/bulk-update-tf-svc-infra.js'
import { normalizeStatus } from '~/src/listeners/github/helpers/normalize-status.js'
import { trimWorkflowRun } from '~/src/listeners/github/helpers/trim-workflow-run.js'
import { handleTriggeredWorkflow } from '~/src/listeners/github/handlers/handle-triggered-workflow.js'

/**
 * Specific handler for tf-svc-infra create-service calls. On completion, it triggers bulkUpdateTfSvcInfra
 * This creates the placeholder artifact, and checks if any other tenants were completed in this run.
 * On other statuses it just hands off to handleTriggeredWorkflow
 * @param { import('mongodb').Db } db
 * @param { import('pino').Logger } logger
 * @param {object} message
 * @param {string} workflowFile
 * @returns {Promise<void>}
 */
const handleTfSvcInfraWorkflow = async (db, logger, message, workflowFile) => {
  try {
    logger.info(`handling tf-svc-infra workflow ${workflowFile}`)

    if (workflowFile === config.get('workflows.createTenantService')) {
      if (message.action === 'completed') {
        logger.info(
          `Creation handler: Ignoring ${config.get('workflows.createTenantService')} complete status`
        )
        return
      }
      await handleTriggeredWorkflow(db, logger, message)
      return
    }

    if (
      workflowFile === config.get('workflows.applyTenantService') ||
      workflowFile === config.get('workflows.manualApplyTenantService')
    ) {
      if (message.action === 'completed') {
        logger.info(`Creation handler: Bulk updating cdp-tf-svc-infra`)

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
      }
      return
    }

    logger.info(`Creation handler: Did not process tf-svc-infra workflow`)
  } catch (e) {
    logger.error(e)
  }
}

export { handleTfSvcInfraWorkflow }
