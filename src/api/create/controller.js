import { triggerCreateRepositoryWorkflow } from './helpers/trigger-create-repository-workflow'
import { createServiceInfrastructureCode } from './helpers/create-service-infrastructure-code'
import { createServiceValidationSchema } from '~/src/api/create/helpers/create-service-validation-schema'
import { createInitialDeploymentPullRequest } from './helpers/add-service-to-deployments'
import { templates } from './helpers/service-templates'

const createServiceController = {
  options: {
    validate: {
      payload: createServiceValidationSchema()
    },
    payload: {
      output: 'data',
      parse: true,
      allow: 'application/json'
    }
  },
  handler: async (request, h) => {
    try {
      const cluster = templates[request?.payload?.serviceType]
      if (cluster === null) {
        throw new Error(`invalid template: '${request?.payload?.serviceType}'`)
      }

      await triggerCreateRepositoryWorkflow(request?.payload)
      await createServiceInfrastructureCode(request?.payload?.repositoryName)
      await createInitialDeploymentPullRequest(
        request?.payload?.repositoryName,
        '0.1.0',
        cluster
      )
      return h.response({ message: 'success' }).code(200)
    } catch (error) {
      h.request.logger.error(error)

      return h
        .response({
          message: error?.message
        })
        .code(error?.status)
    }
  }
}

export { createServiceController }
