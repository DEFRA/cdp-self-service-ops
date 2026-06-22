import { autoDeployServiceValidation } from '../helpers/schema/auto-deploy-service-validation.js'
import { validatePortalBackendRequest } from '../../helpers/pre/validate-portal-backend-request.js'
import { deployService } from '../helpers/deploy-service.js'
import { statusCodes } from '@defra/cdp-validation-kit'
import { shouldDirectDeploy } from '../helpers/should-direct-deploy.js'

const autoDeployServiceController = {
  options: {
    pre: [validatePortalBackendRequest],
    validate: {
      payload: autoDeployServiceValidation
    },
    payload: {
      output: 'data',
      parse: true,
      allow: 'application/json'
    }
  },
  handler: async (request, h) => {
    const { payload, snsClient, logger } = request
    const user = payload.user
    try {
      const result = await deployService(
        payload,
        user,
        snsClient,
        logger,
        shouldDirectDeploy(payload.environment)
      )
      return h.response(result).code(statusCodes.ok)
    } catch (err) {
      logger.error(err)
      return h.response({ message: err }).code(statusCodes.internalError)
    }
  }
}

export { autoDeployServiceController }
