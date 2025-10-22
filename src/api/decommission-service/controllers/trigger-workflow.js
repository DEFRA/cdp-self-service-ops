import Joi from 'joi'
import {
  repositoryNameValidation,
  statusCodes
} from '@defra/cdp-validation-kit'

import { triggerRemoveWorkflow } from '../helpers/trigger-remove-workflow.js'
import { getEntity } from '../../../helpers/portal-backend/get-entity.js'
import { validatePortalBackendRequest } from '../../helpers/pre/validate-portal-backend-request.js'

const decommissionTriggerWorkflowController = {
  options: {
    pre: [validatePortalBackendRequest],
    validate: {
      params: Joi.object({
        entityName: repositoryNameValidation
      })
    }
  },
  handler: async (request, h) => {
    const entityName = request.params.entityName
    const logger = request.logger

    const entity = await getEntity(entityName, logger)

    await triggerRemoveWorkflow(entity, logger)

    return h
      .response({
        message: `Decommission workflow has been triggered for: ${entityName}`
      })
      .code(statusCodes.ok)
  }
}

export { decommissionTriggerWorkflowController }
