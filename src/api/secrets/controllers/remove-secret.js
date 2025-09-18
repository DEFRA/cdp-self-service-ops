import Boom from '@hapi/boom'

import { config } from '../../../config/index.js'
import { sendSnsMessage } from '../../../helpers/sns/send-sns-message.js'
import {
  secretParamsValidation,
  removeSecretPayloadValidation
} from '../helpers/schema/secret-validation.js'
import { sanitize } from '../../../helpers/sanitize.js'
import { registerPendingSecret } from '../helpers/register-pending-secret.js'
import { canManageSecretInEnv } from '../helpers/can-manage-secret.js'
import { statusCodes } from '@defra/cdp-validation-kit'

const removeSecretController = {
  options: {
    auth: {
      strategy: 'azure-oidc'
    },
    validate: {
      params: secretParamsValidation(),
      payload: removeSecretPayloadValidation(),
      failAction: (request, _h, validationError) => {
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
    const scope = request.auth?.credentials?.scope

    const canManageSecret = await canManageSecretInEnv(
      serviceName,
      environment,
      scope
    )
    if (!canManageSecret) {
      throw Boom.forbidden('Insufficient permissions to update this secret')
    }

    const { secretKey } = request.payload
    const topic = config.get('snsSecretsManagementTopicArn')
    const description = `Secret ${secretKey} removal pending for ${serviceName}`

    try {
      await sendSnsMessage(
        request.snsClient,
        topic,
        {
          environment,
          name: `cdp/services/${serviceName}`,
          description,
          secret_key: secretKey,
          action: 'remove_secret_by_key'
        },
        request.logger
      )

      await registerPendingSecret({
        environment,
        service: serviceName,
        secretKey,
        action: 'remove_secret_by_key'
      })

      request.logger.debug(description)

      return h.response().code(statusCodes.ok)
    } catch (error) {
      request.logger.error(error, 'Error removing secret')

      return Boom.notImplemented('Error removing secret')
    }
  }
}

export { removeSecretController }
