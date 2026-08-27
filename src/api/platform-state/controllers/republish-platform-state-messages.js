import Boom from '@hapi/boom'
import { environments, scopes, statusCodes } from '@defra/cdp-validation-kit'

import { triggerMonoLambda } from '../../../helpers/monolambda/trigger-monolambda.js'

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

    try {
      const payload = {
        gzip: true
      }
      for (const environment of Object.values(environments)) {
        await triggerMonoLambda(
          request,
          'publish_environment_state',
          environment,
          payload
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
