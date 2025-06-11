import Joi from 'joi'

import { waf } from '~/src/constants/waf.js'
import { scopes } from '~/src/constants/scopes.js'
import { unshutterServiceWorkflow } from '~/src/api/shutter/helpers/shutter-service-workflow.js'
import {
  environmentValidation,
  repositoryNameValidation
} from '~/src/api/helpers/schema/common-validations.js'
import { getScopedUser } from '~/src/helpers/user/get-scoped-user.js'

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

    return h.response().code(200)
  }
}

export { unshutterServiceController }
