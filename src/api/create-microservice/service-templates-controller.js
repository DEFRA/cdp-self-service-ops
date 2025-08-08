import { getServiceTemplates } from './helpers/microservice-templates.js'
import { statusCodes } from '../../constants/status-codes.js'

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
      .code(statusCodes.ok)
  }
}

export { serviceTemplatesController }
