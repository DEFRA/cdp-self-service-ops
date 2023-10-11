import { deployServiceValidation } from '~/src/api/deploy/helpers/schema/deploy-service-validation'
import { createDeploymentPullRequest } from '~/src/api/deploy/helpers/create-deployment-pull-request'
import { authStrategy } from '~/src/helpers/auth-stratergy'
import { createLogger } from '~/src/helpers/logger'
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
    const logger = createLogger()

    logger.info(`deploying ${JSON.stringify(request.payload)}`)
    logger.info(`authed user ${request.auth}`)

    const payload = request.payload
    payload.user = request.auth?.credentials?.displayName ?? 'n/a'

    await registerDeployment(payload)
    await createDeploymentPullRequest(payload)

    return h.response({ message: 'success' }).code(200)
  }
}

export { deployServiceController }
