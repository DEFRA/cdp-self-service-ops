import { deployServiceValidation } from '~/src/api/deploy/helpers/schema/deploy-service-validation'
import { createDeploymentPullRequest } from '~/src/api/deploy/helpers/create-deployment-pull-request'
import { authStrategy } from '~/src/helpers/auth-stratergy'
import { registerDeployment } from '~/src/api/deploy/helpers/register-deployment'

const deployServiceController = {
  options: {
    auth: authStrategy,
    validate: {
      payload: deployServiceValidation()
    },
    payload: {
      output: 'data',
      parse: true,
      allow: 'application/json'
    }
  },
  handler: async (request, h) => {
    request.logger.info(request.payload, 'Request payload is:')
    // TODO once issue has been fixed remove logging exposing auth contents
    request.logger.info(request.auth, 'Authed user is:')

    const payload = request.payload
    payload.user = request.auth?.credentials?.displayName ?? 'n/a'

    request.logger.info(payload, 'Updated Payload is:')

    await registerDeployment(payload)
    await createDeploymentPullRequest(payload)

    return h.response({ message: 'success' }).code(200)
  }
}

export { deployServiceController }
