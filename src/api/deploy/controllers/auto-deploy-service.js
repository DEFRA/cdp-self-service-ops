import { autoDeployServiceValidation } from '../helpers/schema/auto-deploy-service-validation.js'
import { deployService } from './deploy-service.js'
import { validatePortalBackendRequest } from '../../helpers/pre/validate-portal-backend-request.js'

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
    const { payload, logger } = request
    return await deployService(payload, logger, h, payload.user)
  }
}

export { autoDeployServiceController }
