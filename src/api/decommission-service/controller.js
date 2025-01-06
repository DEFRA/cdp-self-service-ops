import Joi from 'joi'
import { removeStatus } from '~/src/api/status/helpers/remove-status.js'
import { portalBackEndDecommissionService } from '~/src/api/decommission-service/helpers/decommission-portal-backend.js'
import { triggerRemoveWorkflows } from '~/src/api/decommission-service/helpers/trigger-remove-workflows.js'
import { getRepositoryInfo } from '~/src/helpers/portal-backend/get-repository-info.js'
import { undeployServiceFromAllEnvironments } from '~/src/api/undeploy/helpers/undeploy-service-from-all-environments.js'
import { deleteDockerImages } from '~/src/api/decommission-service/helpers/delete-docker-images.js'
import { triggerArchiveGithubWorkflow } from '~/src/api/decommission-service/helpers/archive-github-workflow.js'

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
    const logger = request.logger
    const user = request.auth.credentials
    const response = await getRepositoryInfo(serviceName)

    await undeployServiceFromAllEnvironments(serviceName, user)
    await deleteDockerImages(serviceName, user, logger)
    await triggerRemoveWorkflows(serviceName, response.repository, logger)
    await portalBackEndDecommissionService(serviceName)
    await removeStatus(request.db, serviceName)

    await triggerArchiveGithubWorkflow(serviceName, logger)

    return h
      .response({
        message: `Service has been decommissioned: ${serviceName}`
      })
      .code(200)
  }
}

export { decommissionServiceController }
