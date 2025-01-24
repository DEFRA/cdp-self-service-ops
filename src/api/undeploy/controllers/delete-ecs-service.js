import Joi from 'joi'

import { undeployServiceValidation } from '~/src/api/undeploy/helpers/schema/undeploy-service-validation.js'
import {
  deleteEcsService,
  deleteAllEcsServices
} from '~/src/api/undeploy/helpers/delete-ecs-service.js'

const deleteEcsServiceController = {
  options: {
    auth: {
      strategy: 'azure-oidc',
      access: {
        scope: ['admin']
      }
    },
    validate: {
      params: undeployServiceValidation()
    }
  },
  handler: async (request, h) => {
    const { imageName, environment } = request.params

    await deleteEcsService({
      serviceName: imageName,
      environment,
      logger: request.logger
    })
    return h.response().code(204)
  }
}

const deleteAllEcsServicesController = {
  options: {
    auth: {
      strategy: 'azure-oidc',
      access: {
        scope: ['admin']
      }
    },
    validate: {
      params: Joi.object({
        imageName: Joi.string().min(1).required()
      })
    }
  },
  handler: async (request, h) => {
    const { imageName } = request.params

    await deleteAllEcsServices({
      serviceName: imageName,
      logger: request.logger
    })
    return h.response().code(204)
  }
}

export { deleteEcsServiceController, deleteAllEcsServicesController }
