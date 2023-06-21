import { deployServicePayloadSchema } from './helpers/deploy-service-payload-validation'
import { createDeploymentPullRequest } from './helpers/create-deployment-pull-request'
import { getClusterName } from '~/src/api/deploy/helpers/get-cluster-name'

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
      const cluster = await getClusterName(request.payload)

      await createDeploymentPullRequest(
        request.payload.imageName,
        request.payload.version,
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

export { deployServiceController }
