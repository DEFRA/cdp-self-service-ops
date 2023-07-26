import Boom from '@hapi/boom'

import { deployServiceValidation } from '~/src/api/deploy/helpers/schema/deploy-service-validation'
import { createDeploymentPullRequest } from '~/src/api/deploy/helpers/create-deployment-pull-request'

const deployServiceController = {
  options: {
    validate: {
      payload: deployServiceValidation()
    },
    payload: {
      output: 'data',
      parse: true,
      allow: 'application/json'
    }
  },
  handler: async (request, h) => {
    try {
      await createDeploymentPullRequest(request.payload)

      return h.response({ message: 'success' }).code(200)
    } catch (error) {
      return Boom.boomify(error)
    }
  }
}

export { deployServiceController }
