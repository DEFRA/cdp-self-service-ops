import { deployServiceValidation } from '~/src/api/deploy/helpers/schema/deploy-service-validation'
import { createDeploymentPullRequest } from '~/src/api/deploy/helpers/create-deployment-pull-request'
import { authStrategy } from '~/src/helpers/auth-stratergy'
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
    const payload = request.payload
    payload.user = request.auth.credentials?.profile?.displayName ?? 'unknown'
    logger.info(request.auth)
    await createDeploymentPullRequest(payload)

    return h.response({ message: 'success' }).code(200)
  }
}

export { deployServiceController }
