import { statusCodes } from '@defra/cdp-validation-kit'
import { filterTemplates } from './helpers/templates.js'

const tenantTemplatesController = {
  options: {
    auth: {
      strategy: 'azure-oidc'
    }
  },
  handler: (request, h) => {
    return h
      .response(
        filterTemplates({
          scopes: request.auth.credentials?.scope,
          type: request.query.type,
          subtype: request.query.subtype
        })
      )
      .code(statusCodes.ok)
  }
}

export { tenantTemplatesController }
