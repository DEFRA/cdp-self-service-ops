import Boom from '@hapi/boom'

import { config } from '~/src/config/index.js'
import { createServiceValidationSchema } from '~/src/api/create-microservice/helpers/create-service-validation-schema.js'
import { createMicroservice } from '~/src/helpers/create/create-microservice.js'
import { serviceTemplates } from '~/src/api/create-microservice/helpers/service-templates.js'

const createMicroserviceController = {
  options: {
    auth: {
      strategy: 'azure-oidc',
      access: {
        scope: [config.get('oidc.adminGroupId'), '{payload.teamId}']
      }
    },
    validate: {
      payload: createServiceValidationSchema(),
      failAction: () => Boom.boomify(Boom.badRequest())
    }
  },
  handler: async (request, h) => {
    const payload = request?.payload
    const serviceTypeTemplate = payload?.serviceTypeTemplate
    const repositoryName = payload?.repositoryName
    const teamId = payload.teamId
    const zone = serviceTemplates[serviceTypeTemplate]?.zone
    if (!zone) {
      throw Boom.badData(`Invalid service template: '${serviceTypeTemplate}'`)
    }
    const user = request.auth?.credentials

    await createMicroservice(
      request,
      repositoryName,
      serviceTypeTemplate,
      zone,
      teamId,
      user
    )

    return h
      .response({
        message: 'Service creation has started',
        repositoryName,
        statusUrl: `/status/${repositoryName}`
      })
      .code(200)
  }
}

export { createMicroserviceController }
