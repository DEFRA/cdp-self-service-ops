import Joi from 'joi'
import { scaleEcsToZeroInAllEnvironments } from '../helpers/scale-ecs-to-zero-in-all-environments.js'
import { validatePortalBackendRequest } from '../../helpers/pre/validate-portal-backend-request.js'
import {
  repositoryNameValidation,
  userWithIdValidation
} from '@defra/cdp-validation-kit/src/validations.js'
import { statusCodes } from '../../../constants/status-codes.js'

const scaleEcsToZeroController = {
  options: {
    pre: [validatePortalBackendRequest],
    validate: {
      params: Joi.object({
        serviceName: repositoryNameValidation
      }),
      payload: userWithIdValidation
    }
  },
  handler: async (request, h) => {
    const serviceName = request.params.serviceName
    const user = await request.payload

    await scaleEcsToZeroInAllEnvironments(serviceName, user, request.logger)
    return h.response({ message: 'success' }).code(statusCodes.ok)
  }
}

export { scaleEcsToZeroController }
