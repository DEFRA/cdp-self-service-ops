import Joi from 'joi'

import { waf } from '../../../constants/waf.js'
import { unshutterServiceWorkflow } from '../helpers/shutter-service-workflow.js'
import {
  scopes,
  statusCodes,
  environmentValidation,
  repositoryNameValidation
} from '@defra/cdp-validation-kit'
import { getScopedUser } from '../../../helpers/user/get-scoped-user.js'

const unshutterServiceController = {
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

    await unshutterServiceWorkflow(request.logger, payload, user)

    return h.response().code(statusCodes.ok)
  }
}

export { unshutterServiceController }
