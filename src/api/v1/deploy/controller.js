import { deployServicePayloadSchema } from './helpers/deploy-service-payload-validation'
import { createDeploymentPullRequest } from './helpers/create-deployment-pull-request'

const deployServiceController = {
  options: {
    validate: {
      payload: deployServicePayloadSchema()
    },
    payload: {
      output: 'data',
      parse: true,
      allow: 'application/json'
    }
  },
  handler: async (request, h) => {
    try {
      await createDeploymentPullRequest(
        request.payload.imageName,
        request.payload.version,
        request.payload.cluster
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

export { deployServiceController }
