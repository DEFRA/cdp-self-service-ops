import Joi from 'joi'
import { removeStatus } from '~/src/api/status/helpers/remove-status.js'
import { portalBackEndDecommissionService } from '~/src/api/decommission-service/helpers/decommission-portal-backend.js'
import { triggerRemoveWorkflows } from '~/src/api/decommission-service/helpers/trigger-remove-workflows.js'
import { getRepositoryInfo } from '~/src/helpers/portal-backend/get-repository-info.js'

const decommissionServiceController = {
  options: {
    auth: {
      strategy: 'azure-oidc',
      access: {
        scope: ['admin']
      }
    },
    validate: {
      params: Joi.object({
        serviceName: Joi.string().required()
      })
    }
  },
  handler: async (request, h) => {
    const serviceName = request.params.serviceName
    const response = await getRepositoryInfo(serviceName)

    await triggerRemoveWorkflows(
      serviceName,
      response.repository,
      request.logger
    )
    await portalBackEndDecommissionService(serviceName)
    await removeStatus(request.db, serviceName)

    return h
      .response({
        message: `Service has been decommissioned: ${serviceName}`
      })
      .code(200)
  }
}

export { decommissionServiceController }
