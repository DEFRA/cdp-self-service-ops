import Joi from 'joi'
import { triggerRemoveWorkflows } from '../helpers/trigger-remove-workflows.js'
import { getEntity } from '../../../helpers/portal-backend/get-entity.js'
import { repositoryNameValidation } from '@defra/cdp-validation-kit/src/validations.js'
import { validatePortalBackendRequest } from '../../helpers/pre/validate-portal-backend-request.js'

const decommissionTriggerWorkflowsController = {
  options: {
    pre: [validatePortalBackendRequest],
    validate: {
      params: Joi.object({
        serviceName: repositoryNameValidation
      })
    }
  },
  handler: async (request, h) => {
    const serviceName = request.params.serviceName
    const logger = request.logger

    const entity = await getEntity(serviceName, logger)

    await triggerRemoveWorkflows(serviceName, entity, logger)

    return h
      .response({
        message: `Decommission workflows have been triggered for: ${serviceName}`
      })
      .code(200)
  }
}

export { decommissionTriggerWorkflowsController }
