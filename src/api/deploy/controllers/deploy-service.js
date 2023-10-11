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
    request.logger.info(
      'SR - Request payload is: %s',
      JSON.stringify(request.payload)
    )
    request.logger.info('SR - Auth is: %s', JSON.stringify(request.auth))
    request.logger.info(
      'SR - User is: %s',
      request.auth?.credentials?.displayName
    )
    request.logger.info('SR - Testing request logger')

    const payload = request.payload
    payload.user = request.auth?.credentials?.displayName ?? 'n/a'

    request.logger.info('SR - Updated Payload is: %s', JSON.stringify(payload)) // Works

    await registerDeployment(payload)
    await createDeploymentPullRequest(payload)

    return h.response({ message: 'success' }).code(200)
  }
}

export { deployServiceController }
