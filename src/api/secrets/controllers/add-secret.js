import Boom from '@hapi/boom'

import {
  secretParamsValidation,
  addSecretPayloadValidation
} from '../helpers/schema/secret-validation.js'
import { sanitize } from '../../../helpers/sanitize.js'
import { registerPendingSecret } from '../helpers/register-pending-secret.js'
import { canManageSecretInEnv } from '../helpers/can-manage-secret.js'
import { statusCodes } from '@defra/cdp-validation-kit'
import { triggerMonoLambda } from '../../../helpers/monolambda/trigger-monolambda.js'

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
    const { params, payload, auth, logger } = request
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

    const createSecretPayload = {
      action: 'add_secret_key_value_pair',
      secret_name: `cdp/services/${serviceName}`,
      secret_key_pair_name: secretKey,
      secret_key_pair_value: secretValue
    }

    try {
      await triggerMonoLambda(
        request,
        'manage_secrets',
        environment,
        createSecretPayload
      )

      await registerPendingSecret({
        environment,
        service: serviceName,
        secretKey,
        action: 'add_secret'
      })

      return h.response().code(statusCodes.ok)
    } catch (error) {
      logger.error(error, 'Error creating secret')

      return Boom.notImplemented('Error creating secret')
    }
  }
}

export { addSecretController }
