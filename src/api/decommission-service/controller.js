import Boom from '@hapi/boom'

import Joi from 'joi'
import { removeStatus } from '~/src/api/status/helpers/remove-status.js'
import { portalBackEndDecommissionService } from '~/src/api/decommission-service/helpers/decommission-portal-backend.js'

const decommissionServiceController = {
  options: {
    auth: {
      strategy: 'azure-oidc',
      access: {
        scope: ['admin']
      }
    },
    validate: {
      params: Joi.object({
        serviceName: Joi.string().required()
      }),
      failAction: () => Boom.boomify(Boom.badRequest())
    }
  },
  handler: async (request, h) => {
    const serviceName = request.params.serviceName

    await removeStatus(request.db, serviceName)
    await portalBackEndDecommissionService(serviceName)

    return h
      .response({
        message: `Service has been decommissioned: ${serviceName}`
      })
      .code(200)
  }
}

export { decommissionServiceController }
