import Boom from '@hapi/boom'
import { statusCodes, scopes } from '@defra/cdp-validation-kit'

import { createServiceValidationSchema } from './helpers/create-service-validation-schema.js'
import { createMicroservice } from '../../helpers/create/create-microservice.js'
import {
  getServiceTemplates,
  microserviceTemplates
} from './helpers/microservice-templates.js'

const createMicroserviceController = {
  options: {
    auth: {
      strategy: 'azure-oidc',
      access: {
        scope: [scopes.admin, 'team:{payload.teamId}']
      }
    }
  },
  handler: async (request, h) => {
    const allowableServiceTemplates = getServiceTemplates(
      request.auth.credentials?.scope
    )
    const payload = request?.payload

    await createServiceValidationSchema(allowableServiceTemplates)
      .validateAsync(payload, { abortEarly: false })
      .then((value) => ({ value }))
      .catch((error) => ({ value: payload, error }))
    const serviceTypeTemplate = payload?.serviceTypeTemplate
    const repositoryName = payload?.repositoryName
    const teamId = payload.teamId
    const templateTag = payload.templateTag

    const template = microserviceTemplates[serviceTypeTemplate]
    if (!template) {
      throw Boom.badData(`Invalid service template: '${serviceTypeTemplate}'`)
    }
    const user = request.auth?.credentials

    await createMicroservice({
      logger: request.logger,
      repositoryName,
      template,
      templateTag,
      teamId,
      user
    })

    return h
      .response({
        message: 'Service creation has started',
        repositoryName,
        statusUrl: `/status/${repositoryName}`
      })
      .code(statusCodes.ok)
  }
}

export { createMicroserviceController }
