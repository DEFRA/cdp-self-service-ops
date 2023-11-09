import { deployServiceValidation } from '~/src/api/deploy/helpers/schema/deploy-service-validation'
import { registerDeployment } from '~/src/api/deploy/helpers/register-deployment'
import { generateDeployMessage } from '~/src/api/deploy/helpers/generate-deploy-message'
import { sendSnsDeployMessage } from '~/src/api/deploy/helpers/send-sns-deploy-message'

const deployServiceController = {
  options: {
    auth: {
      strategy: 'azure-oidc'
    },
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
    const payload = request.payload
    payload.user = {
      id: request.auth?.credentials?.id,
      displayName: request.auth?.credentials?.displayName
    }

    await registerDeployment(payload)
    const deployMessage = await generateDeployMessage(payload)
    const snsResponse = await sendSnsDeployMessage(
      request.snsClient,
      deployMessage
    )

    request.logger.info(
      `SNS Deploy response: ${JSON.stringify(snsResponse, null, 2)}`
    )

    return h.response({ message: 'success' }).code(200)
  }
}

export { deployServiceController }
