import crypto from 'node:crypto'
import Joi from 'joi'
import Boom from '@hapi/boom'
import {
  environments,
  environmentValidation,
  statusCodes
} from '@defra/cdp-validation-kit'

import { config } from '../../../config/index.js'
import { sendSnsMessage } from '../../../helpers/sns/send-sns-message.js'
import { canAddEphemeralKey } from '../helpers/can-add-ephemeral-key.js'

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

    const topic = config.get('monoLambdaTriggerTopicArn')

    const apiKey = generateBase62Secret(32)
    const ttlHours = environment === environments.prod ? 2 : 24

    try {
      await sendSnsMessage(
        request.snsClient,
        topic,
        {
          environment,
          event_type: 'add_ephemeral_api_key',
          timestamp: new Date().toISOString(),
          payload: {
            api_key: apiKey,
            user: request.auth.credentials.displayName,
            ttl: ttlHours
          }
        },
        request.logger
      )

      return h.response({ apiKey }).code(statusCodes.ok)
    } catch (error) {
      request.logger.error(error, 'Error creating ephemeral key')

      return Boom.badRequest('Error creating ephemeral key')
    }
  }
}

export { addEphemeralKeyController }
