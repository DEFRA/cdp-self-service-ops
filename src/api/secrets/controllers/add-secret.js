import Boom from '@hapi/boom'

import { config } from '~/src/config'
import { sendSnsMessage } from '~/src/helpers/sns/send-sns-message'
import {
  secretParamsValidation,
  secretPayloadValidation
} from '~/src/api/secrets/helpers/schema/secret-validation'
import { sanitize } from '~/src/helpers/sanitize'

const addSecretController = {
  options: {
    auth: {
      strategy: 'azure-oidc',
      access: {
        scope: [config.get('oidcAdminGroupId'), '{payload.teamId}']
      }
    },
    validate: {
      params: secretParamsValidation(),
      payload: secretPayloadValidation,
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
    const description = `Secret ${secretKey} added for ${serviceName}`
    const topic = config.get('snsSecretsManagementTopicArn')

    request.logger.debug(description)

    await sendSnsMessage({
      request,
      topic,
      message: {
        environment,
        name: `cdp/services/${serviceName}`,
        description,
        secret_key: secretKey,
        secret_value: secretValue,
        action: 'add_secret'
      }
    })

    // TODO
    //  Add identifier for sent sns message to db collection with short ttl
    //  Poll a new sns endpoint that will be notified from the secret_management Topic, for add_secret messages that match identifier stored in collection
    //  Respond accordingly with success message or error exception from lambda
    return h.response({ message: 'Success' }).code(200)
  }
}

export { addSecretController }
