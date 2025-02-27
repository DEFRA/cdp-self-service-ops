import { getServiceTemplates } from '~/src/api/create-microservice/helpers/service-templates.js'

const serviceTemplatesController = {
  options: {
    auth: {
      strategy: 'azure-oidc'
    }
  },
  handler: (request, h) => {
    return h
      .response({
        message: 'success',
        serviceTemplates: getServiceTemplates(request.auth.credentials?.scope)
      })
      .code(200)
  }
}

export { serviceTemplatesController }
