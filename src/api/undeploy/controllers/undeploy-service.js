import Joi from 'joi'

import { undeployServiceValidation } from '~/src/api/undeploy/helpers/schema/undeploy-service-validation.js'
import { undeployServiceFromEnvironment } from '~/src/api/undeploy/helpers/undeploy-service-from-environment.js'
import { undeployServiceFromAllEnvironments } from '~/src/api/undeploy/helpers/undeploy-service-from-all-environments.js'
import { getScopedUser } from '~/src/api/undeploy/helpers/get-scoped-user.js'

const undeployServiceController = {
  options: {
    auth: {
      strategy: 'azure-oidc'
    },
    validate: {
      payload: undeployServiceValidation()
    },
    payload: {
      output: 'data',
      parse: true,
      allow: 'application/json'
    }
  },
  handler: async (request, h) => {
    const { imageName, environment } = request.payload
    const user = await getScopedUser(imageName, request.auth, 'admin')

    await undeployServiceFromEnvironment(imageName, environment, user)
    return h.response({ message: 'success' }).code(204)
  }
}

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

    await undeployServiceFromEnvironment(imageName, environment, user)
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

    await undeployServiceFromAllEnvironments(imageName, user)
    return h.response({ message: 'success' }).code(204)
  }
}

export {
  undeployServiceController,
  undeployServiceFromAllEnvironmentController,
  undeployServiceFromEnvironmentController
}
