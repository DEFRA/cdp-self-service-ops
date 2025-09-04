import Boom from '@hapi/boom'

import { config } from '../../../config/index.js'
import { sendSnsMessage } from '../../../helpers/sns/send-sns-message.js'
import {
  secretParamsValidation,
  secretPayloadValidation
} from '../helpers/schema/secret-validation.js'
import { sanitize } from '../../../helpers/sanitize.js'
import { registerPendingSecret } from '../helpers/register-pending-secret.js'
import { canAddSecretInEnv } from '../helpers/can-add-secret.js'
import { statusCodes } from '@defra/cdp-validation-kit'

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

      return h
        .response({ message: 'Secret being created' })
        .code(statusCodes.ok)
    } catch (error) {
      request.logger.error(error, 'Error creating secret')

      return Boom.notImplemented('Error creating secret')
    }
  }
}

export { addSecretController }
