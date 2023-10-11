import { deployServiceValidation } from '~/src/api/deploy/helpers/schema/deploy-service-validation'
import { createDeploymentPullRequest } from '~/src/api/deploy/helpers/create-deployment-pull-request'
import { authStrategy } from '~/src/helpers/auth-stratergy'
import { registerDeployment } from '~/src/api/deploy/helpers/register-deployment'
import { createLogger } from '~/src/helpers/logger'

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
    const logger = createLogger()

    request.logger.info(request.payload, 'Request payload is:')
    request.logger.info(request.auth, 'Authed user is:')
    request.logger.info('Testing request logger')

    request.logger.info('SR - Request payload is: %s', request.payload)
    request.logger.info('SR - Authed user is: %s', request.auth)
    request.logger.info('SR - Testing request logger')

    logger.info(request.payload, 'L - Request payload is:')
    logger.info(request.auth, 'L - Authed user is:')
    logger.info('L - Testing request logger')

    const payload = request.payload
    payload.user = request.auth?.credentials?.displayName ?? 'n/a'

    request.logger.info(payload, 'Updated Payload is:')
    request.logger.info('SR - Updated Payload is: %s', JSON.stringify(payload))
    logger.info(payload, 'L - Updated Payload is:')

    await registerDeployment(payload)
    await createDeploymentPullRequest(payload)

    return h.response({ message: 'success' }).code(200)
  }
}

export { deployServiceController }
