import Joi from 'joi'
import { repositoryNameValidation } from '@defra/cdp-validation-kit/src/validations.js'
import { removeEcsService } from '~/src/helpers/remove/workflows/remove-ecs-service.js'

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

    await removeEcsService(serviceName, request.logger)
    return h.response().code(204)
  }
}

export { deleteEcsServiceController }
