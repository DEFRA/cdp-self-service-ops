import Joi from 'joi'
import { repositoryNameValidation } from '@defra/cdp-validation-kit/src/validations.js'
import { validatePortalBackendRequest } from '../../helpers/pre/validate-portal-backend-request.js'
import { removeEcsService } from '../../../helpers/remove/workflows/remove-ecs-service.js'
import { removeDeployment } from '../../../helpers/remove/workflows/remove-deployment.js'
import { statusCodes } from '../../../constants/status-codes.js'

const deleteDeploymentsAndEcsController = {
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

    await removeEcsService(serviceName, logger)
    logger.info(`Deleting deployment files for ${serviceName}`)
    await removeDeployment(serviceName, logger)

    return h
      .response({
        message: `${serviceName} has been decommissioned`
      })
      .code(statusCodes.ok)
  }
}

export { deleteDeploymentsAndEcsController }
