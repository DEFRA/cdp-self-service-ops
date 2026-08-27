import crypto from 'node:crypto'
import Joi from 'joi'
import Boom from '@hapi/boom'
import {
  environments,
  environmentValidation,
  statusCodes
} from '@defra/cdp-validation-kit'

import { canAddEphemeralKey } from '../helpers/can-add-ephemeral-key.js'
import { triggerMonoLambda } from '../../../helpers/monolambda/trigger-monolambda.js'

function generateBase62Secret(length) {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
  const bytes = crypto.randomBytes(length)
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars[bytes[i] % chars.length]
  }
  return result
}

const addEphemeralKeyController = {
  options: {
    auth: {
      strategy: 'azure-oidc'
    },
    validate: {
      params: Joi.object({
        environment: environmentValidation
      }),
      failAction: () => Boom.badRequest()
    }
  },
  handler: async (request, h) => {
    const { environment } = request.params
    const scope = request.auth?.credentials?.scope

    const canAddKey = await canAddEphemeralKey(environment, scope)

    if (!canAddKey) {
      throw Boom.forbidden(
        'Insufficient permissions to create an ephemeral key'
      )
    }

    const apiKey = generateBase62Secret(32)
    const ttlHours = environment === environments.prod ? 2 : 24

    try {
      const payload = {
        api_key: apiKey,
        user: request.auth.credentials.displayName,
        ttl: ttlHours
      }
      await triggerMonoLambda(
        request,
        'add_ephemeral_api_key',
        environment,
        payload
      )

      return h.response({ apiKey }).code(statusCodes.ok)
    } catch (error) {
      request.logger.error(error, 'Error creating ephemeral key')

      return Boom.badRequest('Error creating ephemeral key')
    }
  }
}

export { addEphemeralKeyController }
