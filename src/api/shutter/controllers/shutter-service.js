import Joi from 'joi'

import { waf } from '~/src/constants/waf.js'
import { scopes } from '~/src/constants/scopes.js'
import { shutterServiceWorkflow } from '~/src/api/shutter/helpers/shutter-service-workflow.js'

const shutterServiceController = {
  options: {
    auth: {
      strategy: 'azure-oidc',
      access: {
        scope: [
          scopes.tenant,
          scopes.admin,
          `+${scopes.restrictedTechMaintenance}`
        ]
      }
    },
    validate: {
      params: Joi.object({
        serviceName: Joi.string().required()
      }),
      payload: Joi.object({
        serviceName: Joi.string().required(),
        environment: Joi.string().required(),
        waf: Joi.string()
          .valid(...Object.values(waf))
          .required(),
        url: Joi.string().required()
      })
    }
  },
  handler: async (request, h) => {
    return false

    const payload = request.payload

    await shutterServiceWorkflow(request.logger, payload.serviceName, payload)

    return h.response().code(200)
  }
}

export { shutterServiceController }
