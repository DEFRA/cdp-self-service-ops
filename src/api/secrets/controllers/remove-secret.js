import Boom from '@hapi/boom'

import {
  secretParamsValidation,
  removeSecretPayloadValidation
} from '../helpers/schema/secret-validation.js'
import { sanitize } from '../../../helpers/sanitize.js'
import { registerPendingSecret } from '../helpers/register-pending-secret.js'
import { canManageSecretInEnv } from '../helpers/can-manage-secret.js'
import { statusCodes } from '@defra/cdp-validation-kit'
import { triggerMonoLambda } from '../../../helpers/monolambda/trigger-monolambda.js'

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
    const { params, auth, payload, logger } = request
    const { serviceName, environment } = params
    const scope = auth?.credentials?.scope

    const canManageSecret = await canManageSecretInEnv(
      serviceName,
      environment,
      scope,
      logger
    )

    if (!canManageSecret) {
      throw Boom.forbidden('Insufficient permissions to update this secret')
    }

    const { secretKey } = payload
    const description = `Secret ${secretKey} removal pending for ${serviceName}`

    const removeSecretPayload = {
      action: 'remove_secret_by_key',
      secret_name: `cdp/services/${serviceName}`,
      secret_key_pair_name: secretKey
    }

    try {
      await triggerMonoLambda(
        request,
        'manage_secrets',
        environment,
        removeSecretPayload
      )

      await registerPendingSecret({
        environment,
        service: serviceName,
        secretKey,
        action: 'remove_secret_by_key'
      })

      logger.debug(description)

      return h.response().code(statusCodes.ok)
    } catch (error) {
      logger.error(error, 'Error removing secret')

      return Boom.notImplemented('Error removing secret')
    }
  }
}

export { removeSecretController }
