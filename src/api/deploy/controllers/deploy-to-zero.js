import { undeployServiceValidation } from '../helpers/schema/undeploy-service-validation.js'
import { getScopedUser } from '../../../helpers/user/get-scoped-user.js'
import { deployToZero } from '../helpers/deploy-to-zero.js'
import { statusCodes } from '@defra/cdp-validation-kit'

const deployToZeroController = {
  options: {
    auth: {
      strategy: 'azure-oidc'
    },
    validate: {
      params: undeployServiceValidation()
    }
  },
  handler: async (request, h) => {
    const { params, auth, logger } = request
    const { serviceName, environment } = params
    const user = await getScopedUser(serviceName, auth, logger)

    try {
      const deploymentId = await deployToZero(
        request,
        serviceName,
        environment,
        user
      )
      return h.response({ deploymentId }).code(statusCodes.ok)
    } catch (err) {
      return h.response({ message: err }).code(statusCodes.internalError)
    }
  }
}

export { deployToZeroController }
