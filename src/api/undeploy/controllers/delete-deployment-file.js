import Joi from 'joi'

import { deleteDeploymentFiles } from '~/src/api/undeploy/helpers/delete-deployment-file.js'

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
    const { serviceName, environment } = request.params

    await deleteDeploymentFiles({
      serviceName,
      environment,
      logger: request.logger
    })
    return h.response({ message: 'success' }).code(204)
  }
}
