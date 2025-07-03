import { autoDeployServiceValidation } from '~/src/api/deploy/helpers/schema/auto-deploy-service-validation.js'
import { deployService } from '~/src/api/deploy/controllers/deploy-service.js'
import { validatePortalBackendRequest } from '~/src/api/helpers/pre/validate-portal-backend-request.js'

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
