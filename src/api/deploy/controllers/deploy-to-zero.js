import { undeployServiceValidation } from '~/src/api/deploy/helpers/schema/undeploy-service-validation.js'
import { getScopedUser } from '~/src/helpers/user/get-scoped-user.js'
import { deployToZero } from '~/src/api/deploy/helpers/deploy-to-zero.js'

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
    return h.response({ message: 'success', deploymentId }).code(200)
  }
}

export { deployToZeroController }
