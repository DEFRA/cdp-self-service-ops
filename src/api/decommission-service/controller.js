import Joi from 'joi'
import { portalBackEndDecommissionService } from '~/src/api/decommission-service/helpers/decommission-portal-backend.js'
import { triggerRemoveWorkflows } from '~/src/api/decommission-service/helpers/trigger-remove-workflows.js'
import { getRepositoryInfo } from '~/src/helpers/portal-backend/get-repository-info.js'
import { deleteDockerImages } from '~/src/api/decommission-service/helpers/delete-docker-images.js'
import { triggerArchiveGithubWorkflow } from '~/src/api/decommission-service/helpers/archive-github-workflow.js'
import { featureToggles } from '~/src/helpers/feature-toggle/feature-toggles.js'
import { isFeatureEnabled } from '~/src/helpers/feature-toggle/is-feature-enabled.js'

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
    const { id, displayName } = request.auth.credentials

    if (!isFeatureEnabled(featureToggles.decommissionService)) {
      logger.info('Decommission service feature is disabled')
      return h
        .response({
          message: 'Decommission disabled'
        })
        .code(409)
    }

    const repository = await getRepositoryInfo(serviceName)

    await deleteDockerImages(serviceName, logger)
    await triggerRemoveWorkflows(serviceName, repository, logger)
    await portalBackEndDecommissionService(serviceName, { id, displayName })

    await triggerArchiveGithubWorkflow(serviceName, logger)

    return h
      .response({
        message: `Service has been decommissioned: ${serviceName}`
      })
      .code(200)
  }
}

export { decommissionServiceController }
