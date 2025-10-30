import Boom from '@hapi/boom'
import { environments, scopes, statusCodes } from '@defra/cdp-validation-kit'

import { config } from '../../../config/index.js'
import { sendSnsMessage } from '../../../helpers/sns/send-sns-message.js'

export const republishPlatformStateMessagesController = {
  options: {
    auth: {
      strategy: 'azure-oidc'
    }
  },
  handler: async (request, h) => {
    const scope = request.auth?.credentials?.scope

    if (!scope.includes(scopes.admin)) {
      throw Boom.forbidden(
        'Insufficient permissions to republish platform state messages'
      )
    }

    const topic = config.get('monoLambdaTriggerTopicArn')

    try {
      for (const environment of Object.values(environments)) {
        await sendSnsMessage(
          request.snsClient,
          topic,
          {
            environment,
            event_type: 'publish_environment_state',
            timestamp: new Date().toISOString(),
            payload: {
              gzip: true
            }
          },
          request.logger
        )
      }

      return h.response().code(statusCodes.ok)
    } catch (error) {
      request.logger.error(
        error,
        'Error triggering platform state message republish'
      )

      return Boom.badRequest(
        'Error triggering platform state message republish'
      )
    }
  }
}
