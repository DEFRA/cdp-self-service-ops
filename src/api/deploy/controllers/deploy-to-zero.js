import { undeployServiceValidation } from '../helpers/schema/undeploy-service-validation.js'
import { getScopedUser } from '../../../helpers/user/get-scoped-user.js'
import { deployToZero } from '../helpers/deploy-to-zero.js'
import { statusCodes } from '@defra/cdp-validation-kit/src/constants/status-codes.js'

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
    const { serviceName, environment } = request.params
    const user = await getScopedUser(serviceName, request.auth)

    const deploymentId = await deployToZero(
      request,
      serviceName,
      environment,
      user
    )
    return h.response({ deploymentId }).code(statusCodes.ok)
  }
}

export { deployToZeroController }
