import { deployServiceValidation } from '../helpers/schema/deploy-service-validation.js'
import { getScopedUser } from '../../../helpers/user/get-scoped-user.js'
import { statusCodes } from '@defra/cdp-validation-kit'
import { deployService } from '../helpers/deploy-service.js'

const deployServiceController = {
  options: {
    auth: {
      strategy: 'azure-oidc'
    },
    validate: {
      payload: deployServiceValidation
    },
    payload: {
      output: 'data',
      parse: true,
      allow: 'application/json'
    }
  },
  handler: async (request, h) => {
    const { payload, snsClient, logger, auth } = request
    const user = await getScopedUser(payload.imageName, auth, logger)

    try {
      const result = await deployService(payload, user, snsClient, logger)
      return h.response(result).code(statusCodes.ok)
    } catch (err) {
      logger.error(err)
      return h.response({ message: err }).code(statusCodes.internalError)
    }
  }
}

export { deployServiceController }
