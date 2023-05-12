import { triggerCreateRepositoryWorkflow } from './helpers/trigger-create-repository-workflow'
import { createServiceInfrastructureCode } from './helpers/create-service-infrastructure-code'
import { createServiceValidationSchema } from '~/src/api/v1/create/helpers/create-service-validation-schema'

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
      await triggerCreateRepositoryWorkflow(request?.payload)
      await createServiceInfrastructureCode(request?.payload?.repositoryName)

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
