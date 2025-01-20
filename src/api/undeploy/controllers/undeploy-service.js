import Joi from 'joi'

import { undeployServiceValidation } from '~/src/api/undeploy/helpers/schema/undeploy-service-validation.js'
import { undeployServiceFromEnvironment } from '~/src/api/undeploy/helpers/undeploy-service-from-environment.js'
import { undeployServiceFromAllEnvironments } from '~/src/api/undeploy/helpers/undeploy-service-from-all-environments.js'
import { getScopedUser } from '~/src/helpers/user/get-scoped-user.js'

const undeployServiceFromEnvironmentController = {
  options: {
    auth: {
      strategy: 'azure-oidc'
    },
    validate: {
      params: undeployServiceValidation()
    }
  },
  handler: async (request, h) => {
    const { imageName, environment } = request.params
    const user = await getScopedUser(imageName, request.auth, 'admin')

    await undeployServiceFromEnvironment({
      imageName,
      environment,
      user,
      logger: request.logger
    })
    return h.response({ message: 'success' }).code(204)
  }
}

const undeployServiceFromAllEnvironmentController = {
  options: {
    auth: {
      strategy: 'azure-oidc'
    },
    validate: {
      params: Joi.object({
        imageName: Joi.string().min(1).required()
      })
    }
  },
  handler: async (request, h) => {
    const imageName = request.params.imageName
    const user = await getScopedUser(imageName, request.auth, 'admin')

    await undeployServiceFromAllEnvironments({
      imageName,
      user,
      logger: request.logger
    })
    return h.response({ message: 'success' }).code(204)
  }
}

export {
  undeployServiceFromAllEnvironmentController,
  undeployServiceFromEnvironmentController
}
