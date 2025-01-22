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
    const { serviceName, environment } = request.params
    const user = await getScopedUser(serviceName, request.auth, 'admin')

    await undeployServiceFromEnvironment({
      serviceName,
      environment,
      user,
      logger: request.logger
    })
    return h.response({ message: 'success' }).code(200)
  }
}

const undeployServiceFromAllEnvironmentController = {
  options: {
    auth: {
      strategy: 'azure-oidc'
    },
    validate: {
      params: Joi.object({
        serviceName: Joi.string().min(1).required()
      })
    }
  },
  handler: async (request, h) => {
    const serviceName = request.params.serviceName
    const user = await getScopedUser(serviceName, request.auth, 'admin')

    await undeployServiceFromAllEnvironments({
      serviceName,
      user,
      logger: request.logger
    })
    return h.response({ message: 'success' }).code(200)
  }
}

export {
  undeployServiceFromAllEnvironmentController,
  undeployServiceFromEnvironmentController
}
