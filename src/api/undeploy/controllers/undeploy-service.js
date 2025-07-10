import Joi from 'joi'

import { undeployServiceValidation } from '~/src/api/undeploy/helpers/schema/undeploy-service-validation.js'
import { undeployServiceFromEnvironment } from '~/src/api/undeploy/helpers/undeploy-service-from-environment.js'
import { undeployServiceFromAllEnvironments } from '~/src/api/undeploy/helpers/undeploy-service-from-all-environments.js'
import { getScopedUser } from '~/src/helpers/user/get-scoped-user.js'
import { validatePortalBackendRequest } from '~/src/api/helpers/pre/validate-portal-backend-request.js'
import {
  repositoryNameValidation,
  userWithIdValidation
} from '@defra/cdp-validation-kit/src/validations.js'

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
    const user = await getScopedUser(serviceName, request.auth)

    await undeployServiceFromEnvironment(
      serviceName,
      environment,
      user,
      request.logger
    )
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
        serviceName: repositoryNameValidation
      })
    }
  },
  handler: async (request, h) => {
    const serviceName = request.params.serviceName
    const user = await getScopedUser(serviceName, request.auth)

    await undeployServiceFromAllEnvironments(serviceName, user, request.logger)
    return h.response({ message: 'success' }).code(200)
  }
}

const undeployServiceViaPortalBackend = {
  options: {
    pre: [validatePortalBackendRequest],
    validate: {
      params: Joi.object({
        serviceName: repositoryNameValidation
      }),
      payload: userWithIdValidation
    }
  },
  handler: async (request, h) => {
    const serviceName = request.params.serviceName
    const user = await request.payload

    await undeployServiceFromAllEnvironments(serviceName, user, request.logger)
    return h.response({ message: 'success' }).code(200)
  }
}

export {
  undeployServiceViaPortalBackend,
  undeployServiceFromAllEnvironmentController,
  undeployServiceFromEnvironmentController
}
