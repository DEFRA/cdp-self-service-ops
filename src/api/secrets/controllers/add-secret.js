import Boom from '@hapi/boom'

import { config } from '~/src/config'
import { sendSnsMessage } from '~/src/helpers/sns/send-sns-message'
import {
  secretParamsValidation,
  secretPayloadValidation
} from '~/src/api/secrets/helpers/schema/secret-validation'

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
      failAction: () => Boom.boomify(Boom.badRequest())
    }
  },
  handler: async (request, h) => {
    const { serviceName, environment } = request.params
    const { secretValue, secretKey } = request.payload
    const message = `Secret ${secretKey}  added for ${serviceName}`

    request.logger.debug(message)

    await sendSnsMessage(request, config.get('snsSecretsManagementTopicArn'), {
      environment,
      name: `cdp/services/${serviceName}`,
      description: message,
      secret_key: secretKey,
      secret_value: secretValue,
      action: 'update_secret'
    })

    // TODO
    //  Add identifier for sent sns message to db collection with short ttl
    //  Poll a new sns endpoint that will be notified from the secret_management Topic, for add_secret messages that match identifier stored in collection
    //  Respond accordingly with success message or error exception from lambda
    return h.response({ message: 'success' }).code(200)
  }
}

export { addSecretController }
