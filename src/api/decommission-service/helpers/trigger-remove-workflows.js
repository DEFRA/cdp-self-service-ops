import { triggerRemoveTenantWorkflow } from '../../../helpers/remove/workflows/trigger-remove-tenant-workflow.js'

/**
 * Calls remove workflows for specified entity.
 * @param {string} entityName
 * @param {object} entity
 * @param {import("pino").Logger} logger
 */
async function triggerRemoveWorkflows(entityName, entity, logger) {
  logger.info(`Triggering remove workflows service: ${entityName}`)
  await triggerRemoveTenantWorkflow(entityName, entity.Type, logger)
}

export { triggerRemoveWorkflows }
