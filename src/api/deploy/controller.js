import Boom from '@hapi/boom'

import { deployServicePayloadSchema } from '~/src/api/deploy/helpers/deploy-service-payload-validation'
import { createDeploymentPullRequest } from '~/src/api/deploy/helpers/create-deployment-pull-request'
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

      await createDeploymentPullRequest({
        ...request.payload,
        cluster
      })

      return h.response({ message: 'success' }).code(200)
    } catch (error) {
      return Boom.boomify(error)
    }
  }
}

export { deployServiceController }
