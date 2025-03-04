import Joi from 'joi'

import { deleteEcsService } from '~/src/api/undeploy/helpers/delete-ecs-service.js'
import { repositoryNameValidation } from '~/src/api/helpers/schema/common-validations.js'

const deleteEcsServiceController = {
  options: {
    auth: {
      strategy: 'azure-oidc',
      access: {
        scope: ['admin']
      }
    },
    validate: {
      params: Joi.object({
        serviceName: repositoryNameValidation
      })
    }
  },
  handler: async (request, h) => {
    const { serviceName } = request.params

    await deleteEcsService(serviceName, request.logger)
    return h.response().code(204)
  }
}

export { deleteEcsServiceController }
