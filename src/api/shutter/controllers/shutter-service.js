import Joi from 'joi'

import { waf } from '../../../constants/waf.js'
import { scopes } from '../../../constants/scopes.js'
import { shutterServiceWorkflow } from '../helpers/shutter-service-workflow.js'
import {
  environmentValidation,
  repositoryNameValidation
} from '@defra/cdp-validation-kit/src/validations.js'
import { getScopedUser } from '../../../helpers/user/get-scoped-user.js'

const shutterServiceController = {
  options: {
    auth: {
      strategy: 'azure-oidc',
      access: {
        scope: [scopes.tenant, scopes.admin]
      }
    },
    validate: {
      payload: Joi.object({
        serviceName: repositoryNameValidation,
        environment: environmentValidation,
        waf: Joi.string()
          .valid(...Object.values(waf))
          .required(),
        url: Joi.string().required()
      })
    }
  },
  handler: async (request, h) => {
    const payload = request.payload
    const user = await getScopedUser(payload.serviceName, request.auth)

    await shutterServiceWorkflow(request.logger, payload, user)

    return h.response().code(200)
  }
}

export { shutterServiceController }
