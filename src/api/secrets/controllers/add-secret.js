import Boom from '@hapi/boom'

import { config } from '../../../config/index.js'
import { sendSnsMessage } from '../../../helpers/sns/send-sns-message.js'
import {
  secretParamsValidation,
  addSecretPayloadValidation
} from '../helpers/schema/secret-validation.js'
import { sanitize } from '../../../helpers/sanitize.js'
import { registerPendingSecret } from '../helpers/register-pending-secret.js'
import { canManageSecretInEnv } from '../helpers/can-manage-secret.js'
import { statusCodes } from '@defra/cdp-validation-kit'

const addSecretController = {
  options: {
    auth: {
      strategy: 'azure-oidc'
    },
    validate: {
      params: secretParamsValidation(),
      payload: addSecretPayloadValidation(),
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
    const { params, payload, auth, snsClient, logger } = request
    const { serviceName, environment } = params
    const scope = auth?.credentials?.scope

    const canAddSecret = await canManageSecretInEnv(
      serviceName,
      environment,
      scope,
      logger
    )
    if (!canAddSecret) {
      throw Boom.forbidden('Insufficient permissions to manage this secret')
    }

    const { secretValue, secretKey } = payload
    const topic = config.get('snsSecretsManagementTopicArn')
    const description = `Secret ${secretKey} pending for ${serviceName}`

    try {
      await sendSnsMessage(
        snsClient,
        topic,
        {
          environment,
          name: `cdp/services/${serviceName}`,
          description,
          secret_key: secretKey,
          secret_value: secretValue,
          action: 'add_secret'
        },
        logger
      )

      await registerPendingSecret({
        environment,
        service: serviceName,
        secretKey,
        action: 'add_secret'
      })

      logger.debug(description)

      return h.response().code(statusCodes.ok)
    } catch (error) {
      logger.error(error, 'Error creating secret')

      return Boom.notImplemented('Error creating secret')
    }
  }
}

export { addSecretController }
