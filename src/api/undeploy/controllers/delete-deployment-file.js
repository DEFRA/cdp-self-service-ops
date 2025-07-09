import Joi from 'joi'
import { removeDeployment } from '~/src/helpers/remove/workflows/remove-deployment.js'

export const deleteDeploymentFilesController = {
  options: {
    auth: {
      strategy: 'azure-oidc',
      access: {
        scope: ['admin']
      }
    },
    validate: {
      params: Joi.object({
        serviceName: Joi.string().min(1).required()
      })
    }
  },
  handler: async (request, h) => {
    const { serviceName } = request.params

    request.logger.info(`Deleting deployment files for ${serviceName}`)
    await removeDeployment(serviceName, request.logger)
    return h.response().code(204)
  }
}
