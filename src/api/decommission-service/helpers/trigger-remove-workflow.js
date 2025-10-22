import { triggerRemoveTenantWorkflow } from '../../../helpers/remove/workflows/trigger-remove-tenant-workflow.js'

/**
 * Calls remove workflow for specified entity.
 * @param {object} entity
 * @param {import("pino").Logger} logger
 */
async function triggerRemoveWorkflow(entity, logger) {
  logger.info(`Triggering remove workflow for: ${entity.name}`)
  await triggerRemoveTenantWorkflow(entity.name, entity.type, logger)
}

export { triggerRemoveWorkflow }
