import Boom from '@hapi/boom'

import { config } from '~/src/config/index.js'
import { sendSnsMessage } from '~/src/helpers/sns/send-sns-message.js'
import {
  secretParamsValidation,
  secretPayloadValidation
} from '~/src/api/secrets/helpers/schema/secret-validation.js'
import { sanitize } from '~/src/helpers/sanitize.js'
import { registerPendingSecret } from '~/src/api/secrets/helpers/register-pending-secret.js'
import { canAddSecretInEnv } from '~/src/api/secrets/helpers/can-add-secret.js'

const addSecretController = {
  options: {
    auth: {
      strategy: 'azure-oidc'
    },
    validate: {
      params: secretParamsValidation(),
      payload: secretPayloadValidation(),
      failAction: (request, h, validationError) => {
        request.logger.debug(
          validationError,
          `Validation error: ${validationError.message}`
        )
        return Boom.boomify(Boom.badRequest(sanitize(validationError.message)))
      }
    }
  },
  handler: async (request, h) => {
    const { serviceName, environment } = request.params
    const { secretValue, secretKey } = request.payload
    const description = `Secret ${secretKey} pending for ${serviceName}`
    const topic = config.get('snsSecretsManagementTopicArn')
    const scope = request.auth?.credentials?.scope

    const canAddSecret = await canAddSecretInEnv(
      serviceName,
      environment,
      scope
    )
    if (!canAddSecret) {
      throw Boom.forbidden('Insufficient permissions to update this secret')
    }

    try {
      await sendSnsMessage(
        request.snsClient,
        topic,
        {
          environment,
          name: `cdp/services/${serviceName}`,
          description,
          secret_key: secretKey,
          secret_value: secretValue,
          action: 'add_secret'
        },
        request.logger
      )

      await registerPendingSecret({
        environment,
        service: serviceName,
        secretKey,
        action: 'add_secret'
      })

      request.logger.debug(description)

      return h.response({ message: 'Secret being created' }).code(200)
    } catch (error) {
      request.logger.error(error, 'Error creating secret')

      return Boom.notImplemented('Error creating secret')
    }
  }
}

export { addSecretController }
